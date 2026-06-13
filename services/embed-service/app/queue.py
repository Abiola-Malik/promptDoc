import json
import logging
from typing import cast
import redis
from redis import Redis
from app.config import settings

logger = logging.getLogger("queue")

# Shared Redis client to avoid creating a new connection on every call
_redis_client: Redis | None = None


def get_redis() -> Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = cast(Redis, redis.from_url(settings.redis_url))
    return _redis_client


def pop_chunk(timeout: int = 5) -> dict | None:
    """Blocking pop — waits up to timeout seconds."""
    r = get_redis()
    result = cast(tuple | None, r.blpop(["embed_queue"], timeout=timeout))
    if result is None:
        return None
    _, raw = result
    try:
        raw_text = raw.decode(errors="replace") if isinstance(raw, (bytes, bytearray)) else str(raw)
        return json.loads(raw_text)
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError) as e:
        logger.error(f"JSON decode error: {e}")
        return None

def pop_chunk_nowait() -> dict | None:
    """Non-blocking pop — returns None immediately if queue is empty."""
    r = get_redis()
    result = cast(bytes | None, r.lpop("embed_queue"))
    if result is None:
        return None
    try:
        raw_text = result.decode(errors="replace") if isinstance(result, (bytes, bytearray)) else str(result)
        return json.loads(raw_text)
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError) as e:
        logger.error(f"JSON decode error: {e}")
        return None
    
    
def update_job_progress(job_id: str, success: bool) -> None:
    r = get_redis()
    if success:
        r.hincrby(f"job:{job_id}", "processed", 1)
    else:
        r.hincrby(f"job:{job_id}", "failed", 1)

    job = cast(dict, r.hgetall(f"job:{job_id}"))
    total = int(job.get(b"total_chunks", 0))
    processed = int(job.get(b"processed", 0))
    failed = int(job.get(b"failed", 0))
    done = processed + failed

    if total > 0 and done >= total:
        r.hset(f"job:{job_id}", "status", "complete" if failed == 0 else "partial")

def get_job_status(job_id: str) -> dict | None:
    r = get_redis()
    job = cast(dict, r.hgetall(f"job:{job_id}"))
    if not job:
        return None
    total = int(job.get(b"total_chunks", 0))
    processed = int(job.get(b"processed", 0))
    failed = int(job.get(b"failed", 0))
    project_id = job.get(b"project_id", b"").decode(errors="replace")
    status = job.get(b"status", b"queued").decode(errors="replace")
    return {
        "job_id": job_id,
        "project_id": project_id,
        "status": status,
        "total_chunks": total,
        "processed": processed,
        "failed": failed,
        "progress_pct": round((processed / total) * 100, 1) if total > 0 else 0,
    }