import logging
import asyncio
import json
from datetime import datetime
from app.queue import pop_doc_gen_job, update_doc_gen_status, get_redis
from app.graph import get_graph

logger = logging.getLogger("doc-gen-worker")


async def run_doc_gen_job(job_id: str, project_id: str, query: str) -> None:
    """
    Runs the full LangGraph doc_gen path for one job and persists the result.
    Status transitions: queued running complete | failed
    """
    update_doc_gen_status(job_id, status="running")
    try:
        graph = get_graph()
        initial_state = {
            "query": query,
            "project_id": project_id,
            "intent_hint": "doc_gen",
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
        final_state = await graph.ainvoke(
            initial_state, config={"recursion_limit": 50}
        )
        draft = final_state.get("draft", "")
        if not draft:
            raise ValueError("Graph completed but produced no draft content")

        # Store the markdown result directly in Redis
        r = get_redis()
        r.set(f"job_result:{job_id}", draft, ex=60 * 60 * 24)
        update_doc_gen_status(job_id, status="complete", result_path=f"job_result:{job_id}")
        logger.info(f" doc_gen job complete {job_id}")

    except Exception as e:
        logger.error(f"doc_gen job failed {job_id}: {e}")
        update_doc_gen_status(job_id, status="failed", error=str(e))


async def run_doc_gen_loop():
    """
    Background loop that pops jobs from Redis (via blocking blpop in a thread)
    and dispatches them to `run_doc_gen_job`. Malformed popped payloads are
    pushed to a Redis dead-letter list for later inspection instead of being
    silently discarded.
    """
    logger.info("doc-gen background worker started (in-process)")
    while True:
        try:
            raw = await asyncio.to_thread(pop_doc_gen_job, 2)
            if raw is None:
                continue

            # If pop_doc_gen_job returned something that's not a dict, capture it
            # and push to a dead-letter queue for debugging.
            if not isinstance(raw, dict):
                logger.error("Popped job is not a dict, pushing to dead-letter: %r", raw)
                try:
                    r = get_redis()
                    try:
                        raw_text = json.dumps(raw)
                    except Exception:
                        raw_text = repr(raw)
                    dead_entry = {
                        "error": "popped job not a dict",
                        "raw": raw_text,
                        "queue": "doc_gen_queue",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                    }
                    try:
                        r.rpush("doc_gen_dead_letter", json.dumps(dead_entry))
                        r.incr("doc_gen_dead_letter_count")
                        logger.info("Malformed popped job pushed to dead-letter queue")
                    except Exception:
                        logger.exception("Failed to push malformed popped job to dead-letter queue")
                except Exception:
                    logger.exception("Unexpected error while handling malformed popped job")
                continue

            # Validate required keys
            required_keys = ("job_id", "project_id", "query")
            missing = [k for k in required_keys if k not in raw]
            if missing:
                logger.error("Doc-gen job missing required keys %s, pushing to dead-letter. payload=%r", missing, raw)
                try:
                    r = get_redis()
                    try:
                        raw_text = json.dumps(raw)
                    except Exception:
                        raw_text = repr(raw)
                    dead_entry = {
                        "error": f"missing keys: {missing}",
                        "raw": raw_text,
                        "queue": "doc_gen_queue",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                    }
                    try:
                        r.rpush("doc_gen_dead_letter", json.dumps(dead_entry))
                        r.incr("doc_gen_dead_letter_count")
                        logger.info("Malformed popped job (missing keys) pushed to dead-letter queue")
                    except Exception:
                        logger.exception("Failed to push malformed popped job to dead-letter queue")
                except Exception:
                    logger.exception("Unexpected error while handling malformed popped job")
                continue

            # All good — run the job
            await run_doc_gen_job(raw["job_id"], raw["project_id"], raw["query"])

        except asyncio.CancelledError:
            logger.info("doc-gen worker shutting down")
            break
        except Exception as e:
            logger.error(f"worker loop error: {e}")
            await asyncio.sleep(2)
