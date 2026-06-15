import asyncio
from app.models import GraphState
from app.clients.pinecone import retrieve
from app.config import settings

async def retrieve_context(state: GraphState) -> dict:
    """
    Run parallel Pinecone searches for all expanded queries.
    Merge results, deduplicate by content hash, cap at MAX_CONTEXT_CHUNKS.
    """
    queries = state["expanded_queries"]
    project_id = state["project_id"]
    k = settings.max_retrieval_results

    # parallel retrieval for all queries
    results = await asyncio.gather(*[
        retrieve(q, project_id, k) for q in queries
    ])

    # flatten
    all_chunks = [chunk for query_results in results for chunk in query_results]

    # deduplicate by content
    seen = set()
    unique_chunks = []
    for chunk in all_chunks:
        key = chunk["content"][:100]  # first 100 chars as dedup key
        if key not in seen:
            seen.add(key)
            unique_chunks.append(chunk)

    # sort deduplicated chunks by relevance score (descending) and cap
    unique_chunks.sort(key=lambda c: c.get("score", 0), reverse=True)
    top_chunks = unique_chunks[:settings.max_context_chunks]

    # format as context string for the LLM
    context_parts = []
    for i, chunk in enumerate(top_chunks):
        context_parts.append(
            f"### [{i+1}] {chunk['file_path']} ({chunk['language']})\n"
            f"```{chunk['language']}\n{chunk['content']}\n```"
        )
    context = "\n\n".join(context_parts)

    return {"retrieved_chunks": top_chunks, "context": context}