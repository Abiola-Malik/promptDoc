import json
import redis
from app.models import Chunk
from app.config import settings

def get_redis():
    return redis.from_url(settings.redis_url)

def publish_chunks(job_id: str, project_id: str, chunks: list[Chunk]):
    r = get_redis()
    # publish job metadata
    r.hset(f"job:{job_id}", mapping={
        "project_id": project_id,
        "status": "queued",
        "total_chunks": len(chunks),
        "processed": 0,
    })
    # push each chunk onto the queue
    for chunk in chunks:
        r.rpush("embed_queue", json.dumps({
            "job_id": job_id,
            **chunk.model_dump()
        }))
    r.expire(f"job:{job_id}", 60 * 60 * 24)  # 24hr TTL