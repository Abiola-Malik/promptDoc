from fastapi import FastAPI, Header, HTTPException
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
    if not secrets.compare_digest(x_internal_secret, settings.internal_api_secret):
        raise HTTPException(status_code=403, detail="Forbidden")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "rag-service"}

@app.post("/query")
async def query(request: QueryRequest, x_internal_secret: str = Header(...)):
    verify_secret(x_internal_secret)

    async def event_stream():
        graph = get_graph()
        initial_state = {
            "query":        request.query,
            "project_id":   request.project_id,
            "intent_hint":  request.intent_hint,
            "intent":       "",
            "expanded_queries": [],
            "retrieved_chunks": [],
            "context":      "",
            "answer":       "",
            "outline":      "",
            "draft":        "",
            "critique":     "",
            "refined_doc":  "",
            "critique_loops": 0,
        }

        try:
            async for event in graph.astream_events(initial_state, version="v2"):
                kind = event["event"]

                # stream LLM tokens as they arrive
                if kind == "on_chat_model_stream":
                    data = event.get("data") or {}
                    chunk = data.get("chunk") if isinstance(data, dict) else None
                    # support either dict-shaped chunk or object with .content
                    content = None
                    if isinstance(chunk, dict):
                        content = chunk.get("content")
                    else:
                        content = getattr(chunk, "content", None)

                    if content:
                        yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

                # notify client which node is running
                elif kind == "on_chain_start":
                    node = event.get("name", "")
                    if node in ("classify", "expand", "retrieve", "generate", "plan", "draft", "critique"):
                        yield f"data: {json.dumps({'type': 'node', 'node': node})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            # log full exception server-side, but send a generic message to client
            logger.exception("error streaming events")
            yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )