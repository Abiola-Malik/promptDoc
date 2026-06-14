from typing import TypedDict, Annotated
from operator import add

'''
The Annotated[list[dict], add] on retrieved_chunks is LangGraph-specific — it tells the graph to append results rather than overwrite when multiple nodes write to it simultaneously. This is what enables parallel retrieval.
'''


class GraphState(TypedDict):
    # ── inputs ──────────────────────────────────────
    query: str                        # user's original question
    project_id: str                   # Pinecone namespace to search
    intent_hint: str                  # "qa" or "doc_gen" from UI

    # ── routing ─────────────────────────────────────
    intent: str                       # classified intent after classifier node

    # ── retrieval ───────────────────────────────────
    expanded_queries: list[str]       # multi-query expansion results
    retrieved_chunks: Annotated[list[dict], add]  # accumulates across parallel retrievals
    context: str                      # final merged + deduped context string

    # ── generation ──────────────────────────────────
    answer: str                       # Q&A answer (qa path)

    # ── doc generation ──────────────────────────────
    outline: str                      # planned doc structure
    draft: str                        # generated draft
    critique: str                     # critique feedback
    refined_doc: str                  # final refined documentation
    critique_loops: int               # current loop count