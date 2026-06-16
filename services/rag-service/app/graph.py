from langgraph.graph import StateGraph, END
from app.models import GraphState
from app.nodes.classifier import classify_intent
from app.nodes.expander import expand_queries
from app.nodes.retriever import retrieve_context
from app.nodes.generator import generate_answer
from app.nodes.planner import plan_documentation
from app.nodes.drafter import generate_draft
from app.nodes.critic import critique_draft, should_refine
import threading

def build_graph() -> StateGraph:
    graph = StateGraph(GraphState)

    # ── register nodes ──────────────────────────────────────────
    graph.add_node("classify",  classify_intent)
    graph.add_node("expand",    expand_queries)
    graph.add_node("retrieve",  retrieve_context)
    graph.add_node("generate",  generate_answer)
    graph.add_node("plan",      plan_documentation)
    graph.add_node("draft",     generate_draft)
    graph.add_node("critique",  critique_draft)

    # ── entry point ──────────────────────────────────────────
    #every user query first goes through the classify node to determine whether it's a Q&A or doc generation request. This is the entry point of the graph.
    graph.set_entry_point("classify")

    # ── classify → expand (both paths need retrieval) ───────────
    # the classify node determines the intent of the query, and then both Q&A and doc generation paths require expanding the query into multiple variants before retrieval. Therefore, both paths converge at the expand node.
    
    graph.add_edge("classify", "expand")
    graph.add_edge("expand",   "retrieve")

    # ── conditional routing after retrieval ─────────────────────
    #conditional routing is used to direct the flow based on the classified intent. If the intent is Q&A, it goes to the generate node; if it's doc generation, it goes to the plan node.
    def _retrieve_route(state):
        # safe intent retrieval with fallback; normalize values
        intent = state.get("intent") if isinstance(state, dict) else None
        if not isinstance(intent, str):
            return "default"
        intent_key = intent.lower().strip()
        return intent_key if intent_key in ("qa", "doc_gen") else "default"

    graph.add_conditional_edges(
        "retrieve",
        _retrieve_route,
        {
            "qa":      "generate",
            "doc_gen": "plan",
            "default": "generate",
        }
    )

    # ── Q&A path ────────────────────────────────────────────────
    graph.add_edge("generate", END)

    # ── doc gen path ────────────────────────────────────────────
    graph.add_edge("plan",    "draft")
    graph.add_edge("draft",   "critique")

    # ── critique loop or finalize ────────────────────────────────
    graph.add_conditional_edges(
        "critique",
        should_refine,   #should_refine (Conditional): A routing function checks the critique. If it needs work, it loops back to draft to rewrite it. If it passes, it moves to END.
        
        {
            "refine":   "draft",   # loop back
            "finalize": END,
        }
    )

    return graph.compile()

# singleton compiled graph
_graph = None
_graph_lock = threading.Lock()

def get_graph():
    global _graph
    if _graph is None: #fast check without lock for performance
        with _graph_lock:
            if _graph is None:
                _graph = build_graph()
    return _graph