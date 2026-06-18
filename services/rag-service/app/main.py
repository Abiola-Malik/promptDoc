from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.graph import get_graph
from app.config import settings
import json
import logging

app = FastAPI(title="rag-service", version="1.0.0")
logger = logging.getLogger("rag-service")


class QueryRequest(BaseModel):
    query: str
    project_id: str
    intent_hint: str = "qa"


import secrets


def verify_secret(x_internal_secret: str = Header(...)):
    # ensure server secret is configured
    server_secret = getattr(settings, "internal_api_secret", None)
    if not server_secret or not isinstance(server_secret, str):
        logger.error("internal_api_secret is not configured on server")
        raise HTTPException(status_code=500, detail="Server misconfigured")
    # perform constant-time comparison
    try:
        if not secrets.compare_digest(x_internal_secret, server_secret):
            raise HTTPException(status_code=403, detail="Forbidden")
    except TypeError:
        # compare_digest can raise TypeError for non-bytes/str; fail safe
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

            async for event in graph.astream_events(
                initial_state, config=config, version="v2"
            ):
                kind = event.get("event")
                if not kind:
                    continue

                # ── Final Answer Tokens Only ──
                if kind == "on_chat_model_stream":
                    data = event.get("data") or {}
                    chunk = data.get("chunk") if isinstance(data, dict) else None

                    content = None
                    if chunk is not None:
                        if hasattr(chunk, "content"):
                            content = getattr(chunk, "content", None)
                        elif isinstance(chunk, dict):
                            content = (
                                chunk.get("content")
                                or chunk.get("text")
                                or chunk.get("delta")
                            )

                    if content:
                        try:
                            payload = {"type": "token", "content": str(content)}
                            yield f"data: {json.dumps(payload)}\n\n"
                        except Exception:
                            logger.exception("failed to serialize token content")

                # ── Progress / Thinking Messages ──
                elif kind == "on_chain_start":
                    node = event.get("name") or ""
                    message = None

                    if node == "classify":
                        message = "Analyzing intent..."
                    elif node == "expand":
                        message = "Expanding query + step-back reasoning..."
                    elif node == "retrieve":
                        message = "Retrieving relevant code chunks..."
                    elif node == "plan":
                        message = "Planning documentation structure..."
                    elif node == "draft":
                        message = "Drafting documentation..."
                    elif node == "critique":
                        message = "Critiquing and refining draft..."

                    if message:
                        try:
                            yield f"data: {json.dumps({'type': 'thinking', 'message': message})}\n\n"
                        except Exception:
                            logger.exception("failed to serialize thinking event")

            # Done after graph completes
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            logger.exception("error streaming events")
            yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )