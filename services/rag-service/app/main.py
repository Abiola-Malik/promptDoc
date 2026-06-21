from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.graph import get_graph
from app.config import settings
from app.queue import create_doc_gen_job, get_job_status, get_redis
from app.worker import run_doc_gen_loop
import json
import logging
import secrets
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the doc-gen worker as a background task inside this same
    # process/container. This is what lets rag-service handle both the
    # /query streaming API and doc-gen job processing without needing a
    # separate Railway service for the worker.
    worker_task = asyncio.create_task(run_doc_gen_loop())
    logger.info("doc-gen worker task started")
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    logger.info("doc-gen worker task stopped")


app = FastAPI(title="rag-service", version="1.0.0", lifespan=lifespan)


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
                    metadata = event.get("metadata") or {}
                    print("DEBUG node:", metadata.get("langgraph_node"), "all metadata keys:", list(metadata.keys()))
                    node_name = metadata.get("langgraph_node")
                    if node_name != "generate":
                        continue # skip tokens from expand/plan/draft/critique
                    
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


# ── Doc-gen job endpoints ────────────────────────────────────────────────────
# Single canonical path set. The Next.js BFF (web/app/api/generate-docs/...)
# calls these directly — no duplicate /api/-prefixed routes needed here,
# since the BFF owns the public-facing /api/generate-docs paths and this
# service only needs to expose its own internal API surface once.

@app.post("/generate")
async def generate_docs(request: GenerateDocsRequest, _=Depends(verify_secret)):
    """
    Enqueues a doc-gen job and returns immediately. The actual LangGraph run
    happens in the in-process background worker (see lifespan above), fully
    decoupled from this request/response cycle — no HTTP connection stays
    open for the 30-60s the graph typically takes to run.
    """
    job_id = str(uuid.uuid4())
    create_doc_gen_job(job_id, request.project_id, request.query)
    return {"job_id": job_id, "status": "queued"}


@app.get("/job/{job_id}")
async def job_status(job_id: str, _=Depends(verify_secret)):
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

    return status