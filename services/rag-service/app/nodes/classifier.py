from app.models import GraphState

DOC_GEN_SIGNALS = [
    "generate documentation",
    "create docs",
    "write documentation",
    "document this",
    "generate docs",
    "create documentation",
    "write docs",
]

def classify_intent(state: GraphState) -> dict:
    """
    Classify the user's intent as Q&A or doc generation.
    Trusts the UI hint unless the query contains explicit doc-gen signals.
    Zero API calls in 95% of cases.
    """
    query = state["query"].lower()
    hint = state.get("intent_hint", "qa")

    if any(signal in query for signal in DOC_GEN_SIGNALS):
        return {"intent": "doc_gen"}

    return {"intent": hint}