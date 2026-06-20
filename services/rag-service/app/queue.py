import json
import logging
from typing import cast
import redis
from redis import Redis
from app.config import settings
import threading
from datetime import datetime

logger = logging.getLogger("queue")
_lock = threading.Lock()
_redis_client: Redis | None = None

def get_redis() -> Redis:
    global _redis_client
    if _redis_client is None:
        with _lock:
            if _redis_client is None:
                _redis_client = cast(Redis, redis.from_url(settings.redis_url))
    return _redis_client


def create_doc_gen_job(job_id: str, project_id: str, query: str) -> None:
    """
    Push a doc-gen job onto the queue and create its tracking hash in Redis.
    Mirrors the exact pattern chunk-service uses for embed jobs — same
    job:{job_id} hash shape, same TTL, same status lifecycle.
    """
    r = get_redis()
    r.hset(f"job:{job_id}", mapping={
        "type": "doc_gen",
        "project_id": project_id,
        "status": "queued",
        "result_path": "",
        "error": "",
    })
    r.expire(f"job:{job_id}", 60 * 60 * 24)
    r.rpush("doc_gen_queue", json.dumps({
        "job_id": job_id,
        "project_id": project_id,
        "query": query,
    }))


def pop_doc_gen_job(timeout: int = 5) -> dict | None:
    """Blocking pop from the doc-gen queue — used by the worker loop."""
    r = get_redis()
    result = cast(tuple | None, r.blpop(["doc_gen_queue"], timeout=timeout))
    if result is None:
        return None
    _, raw = result
    raw_text = None
    try:
        raw_text = raw.decode(errors="replace") if isinstance(raw, (bytes, bytearray)) else str(raw)
        return json.loads(raw_text)
    except Exception as e:
        # Preserve malformed payload for inspection: push to a dead-letter queue
        try:
            # Ensure we have a best-effort textual representation of the raw payload
            if raw_text is None:
                try:
                    raw_text = raw.decode(errors="replace") if isinstance(raw, (bytes, bytearray)) else str(raw)
                except Exception:
                    raw_text = repr(raw)

            dead_entry = {
                "error": str(e),
                "raw": raw_text,
                "queue": "doc_gen_queue",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            # store the dead-letter entry in Redis for later inspection
            try:
                r.rpush("doc_gen_dead_letter", json.dumps(dead_entry))
                r.incr("doc_gen_dead_letter_count")
            except Exception:
                # If Redis push fails for some reason, at least log the raw payload
                logger.exception("Failed to push malformed job to dead-letter queue")

            logger.error(
                "Malformed job payload pushed to dead-letter queue: %s",
                f"error={e} len={len(raw_text) if isinstance(raw_text, str) else 'N/A'}",
            )
        except Exception:
            # Fallback logging — ensure we don't lose the original exception
            logger.exception("Error handling malformed job payload")
        return None


def update_doc_gen_status(job_id: str, status: str, result_path: str = "", error: str = "") -> None:
    r = get_redis()
    r.hset(f"job:{job_id}", mapping={
        "status": status,
        "result_path": result_path,
        "error": error,
    })


def get_job_status(job_id: str) -> dict | None:
    r = get_redis()
    job = cast(dict, r.hgetall(f"job:{job_id}"))
    if not job:
        return None
    return {
        "job_id": job_id,
        "type": job.get(b"type", b"").decode(),
        "status": job.get(b"status", b"queued").decode(),
        "result_path": job.get(b"result_path", b"").decode(),
        "error": job.get(b"error", b"").decode(),
    }