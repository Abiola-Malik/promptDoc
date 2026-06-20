import time
import logging
import uuid
from app.queue import pop_doc_gen_job, update_doc_gen_status, get_redis
from app.graph import get_graph
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("doc-gen-worker")


async def run_doc_gen_job(job_id: str, project_id: str, query: str) -> None:
    """
    Runs the full LangGraph doc_gen path for one job and persists the result.
    Status transitions: queued → running → complete | failed
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

        # store the markdown result directly in Redis — small enough to not
        # need Appwrite storage, and avoids the BFF needing storage credentials
        # in this worker. Next.js fetches it via the status endpoint and
        # persists it as a generated file using its own Appwrite client.
        r = get_redis()
        r.set(f"job_result:{job_id}", draft, ex=60 * 60 * 24)

        update_doc_gen_status(job_id, status="complete", result_path=f"job_result:{job_id}")
        logger.info(f"✓ doc_gen job complete — {job_id}")

    except Exception as e:
        logger.error(f"doc_gen job failed — {job_id}: {e}")
        update_doc_gen_status(job_id, status="failed", error=str(e))


def run_worker():
    import asyncio
    logger.info("rag-doc-worker started — waiting for doc_gen jobs...")

    async def loop():
        while True:
            raw = pop_doc_gen_job(timeout=5)
            if raw is None:
                continue

            # Defensive validation: ensure required keys exist before use.
            if not isinstance(raw, dict):
                logger.error("Popped job is not a dict, skipping: %r", raw)
                continue

            required_keys = ("job_id", "project_id", "query")
            missing = [k for k in required_keys if k not in raw]
            if missing:
                logger.error(
                    "Doc-gen job missing required keys %s, skipping. payload=%r",
                    missing,
                    raw,
                )
                continue

            await run_doc_gen_job(raw["job_id"], raw["project_id"], raw["query"])

    asyncio.run(loop())


if __name__ == "__main__":
    run_worker()