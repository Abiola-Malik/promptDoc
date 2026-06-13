import time
import logging
from app.models import ChunkPayload
from app.queue import pop_chunk, update_job_progress
from app.store import upsert_chunks_batch
from app.config import settings
from app.store import get_index
from app.embedder import get_embedder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")

def drain_batch(batch_size: int, timeout: int = 5) -> list[dict]:
    """Block waiting for first chunk, then drain up to batch_size quickly."""
    from app.queue import pop_chunk, pop_chunk_nowait
    
    # block until at least one chunk arrives
    first = pop_chunk(timeout=timeout)
    if first is None:
        return []
    
    batch = [first]
    # drain remaining without blocking
    while len(batch) < batch_size:
        chunk = pop_chunk_nowait()
        if chunk is None:
            break
        batch.append(chunk)
    
    return batch

def run_worker():
    logger.info("embed-service worker started — waiting for chunks...")
    # initialize clients once on startup
   
    get_index()
    get_embedder()
    logger.info("clients initialized")

    while True:
        batch_raw: list[dict] | None = None
        chunks: list[ChunkPayload] | None = None
        try:
            batch_raw = drain_batch(settings.batch_size)
            if not batch_raw:
                time.sleep(settings.worker_sleep_seconds)
                continue
            chunks = []
            for raw in batch_raw:
                try:
                    chunks.append(ChunkPayload(**raw))
                except Exception as e:
                    logger.error(f"Invalid chunk payload: {e}")
                    try:
                        update_job_progress(raw.get("job_id", "unknown"), success=False)
                    except Exception:
                        pass

            if not chunks:
                time.sleep(settings.worker_sleep_seconds)
                continue

            job_id = chunks[0].job_id
            logger.info(f"embedding batch of {len(chunks)} chunks — job {job_id}")

            upserted_successfully = False
            try:
                upsert_chunks_batch(chunks)
                upserted_successfully = True
            except Exception as e:
                logger.error(f"upsert_chunks_batch failed: {e}")

            # report per-chunk progress based on upsert result
            for chunk in chunks:
                try:
                    update_job_progress(chunk.job_id, success=upserted_successfully)
                except Exception as e:
                    logger.error(f"failed to update progress for job {chunk.job_id}: {e}")

            if upserted_successfully:
                logger.info(f"✓ batch upserted — {len(chunks)} chunks — job {job_id}")
            else:
                logger.error(f"batch upsert failed — {len(chunks)} chunks — job {job_id}")

        except Exception as e:
            logger.error(f"worker error: {e}")
            for chunk in chunks or []:
                try:
                    update_job_progress(chunk.job_id, success=False)
                except Exception as e:
                    logger.error(f"failed to mark chunk failed for job {getattr(chunk, 'job_id', 'unknown')}: {e}")
            time.sleep(settings.worker_sleep_seconds)

if __name__ == "__main__":
    run_worker()