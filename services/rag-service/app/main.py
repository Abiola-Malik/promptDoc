from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.graph import get_graph
from app.config import settings
from app.queue import create_doc_gen_job, get_job_status, get_redis
import json
import logging
import secrets
import uuid

app = FastAPI(title="rag-service", version="1.0.0")
logger = logging.getLogger("rag-service")


class QueryRequest(BaseModel):
    query: str
    project_id: str
    intent_hint: str = "qa"


class GenerateDocsRequest(BaseModel):
    query: str
    project_id: str


def verify_secret(x_internal_secret: str = Header(...)):
    server_secret = getattr(settings, "internal_api_secret", None)
    if not server_secret or not isinstance(server_secret, str):
        logger.error("internal_api_secret is not configured on server")
        raise HTTPException(status_code=500, detail="Server misconfigured")
    try:
        if not secrets.compare_digest(x_internal_secret, server_secret):
            raise HTTPException(status_code=403, detail="Forbidden")
    except TypeError:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "rag-service"}


@app.post("/query")
async def query(request: QueryRequest, _=Depends(verify_secret)):
    # unchanged — Q&A streaming path stays exactly as it was
    async def event_stream():
        graph = get_graph()
        initial_state = {
            "query": request.query,
            "project_id": request.project_id,
            "intent_hint": request.intent_hint,
            "intent": "",
            "expanded_queries": [],
            "retrieved_chunks": [],
            "context": "",
            "answer": "",
            "outline": "",
            "draft": "",
            "critique": "",
            "refined_doc": "",
            "critique_loops": 0,
        }

        try:
            config = {"recursion_limit": 50}
            async for event in graph.astream_events(initial_state, config=config, version="v2"):
                kind = event.get("event")
                if not kind:
                    continue

                if kind == "on_chat_model_stream":
                    data = event.get("data") or {}
                    chunk = data.get("chunk") if isinstance(data, dict) else None
                    content = None
                    if chunk is not None:
                        if hasattr(chunk, "content"):
                            content = getattr(chunk, "content", None)
                        elif isinstance(chunk, dict):
                            content = chunk.get("content") or chunk.get("text") or chunk.get("delta")
                    if content:
                        yield f"data: {json.dumps({'type': 'token', 'content': str(content)})}\n\n"

                elif kind == "on_chain_start":
                    node = event.get("name") or ""
                    messages = {
                        "classify": "Analyzing intent...",
                        "expand": "Expanding query + step-back reasoning...",
                        "retrieve": "Retrieving relevant code chunks...",
                    }
                    if node in messages:
                        yield f"data: {json.dumps({'type': 'thinking', 'message': messages[node]})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception:
            logger.exception("error streaming events")
            yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/generate")
async def generate_docs(request: GenerateDocsRequest, _=Depends(verify_secret)):
    """
    Kicks off an async doc-gen job. Returns immediately with a job_id —
    the actual LangGraph run happens in rag-doc-worker, completely decoupled
    from this request/response cycle. This is what fixes the timeout issue:
    no HTTP connection stays open for the full ~30-60s the graph takes to run.
    """
    job_id = str(uuid.uuid4())
    create_doc_gen_job(job_id, request.project_id, request.query)
    return {"job_id": job_id, "status": "queued"}


# Backwards-compatible API paths used by the Next.js frontend
@app.post("/api/generate-docs")
async def api_generate_docs(request: GenerateDocsRequest, _=Depends(verify_secret)):
    job_id = str(uuid.uuid4())
    create_doc_gen_job(job_id, request.project_id, request.query)
    return {"jobId": job_id}


@app.get("/job/{job_id}")
async def job_status(job_id: str, _=Depends(verify_secret)):
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")

    # if complete, include the actual generated markdown content
    if status["status"] == "complete" and status["result_path"]:
        r = get_redis()
        content = r.get(status["result_path"])
        if isinstance(content, (bytes, bytearray)):
            status["content"] = content.decode()
        else:
            status["content"] = content or ""

    return status


@app.get("/api/generate-docs/status/{job_id}")
async def api_generate_docs_status(job_id: str, _=Depends(verify_secret)):
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")

    if status["status"] == "complete" and status["result_path"]:
        r = get_redis()
        content = r.get(status["result_path"])
        if isinstance(content, (bytes, bytearray)):
            status["content"] = content.decode()
        else:
            status["content"] = content or ""

    # frontend expects keys like jobId and status
    return {
        "jobId": status["job_id"],
        "status": status["status"],
        "result_path": status.get("result_path", ""),
        "error": status.get("error", ""),
        "content": status.get("content", ""),
    }