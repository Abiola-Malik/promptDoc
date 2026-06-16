from typing import cast
from app.nodes.classifier import classify_intent
from app.models import GraphState


def make_state(query: str, hint: str = "qa") -> dict:
    return {
        "query": query,
        "project_id": "proj-001",
        "intent_hint": hint,
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


def test_trusts_qa_hint_for_normal_question():
    state = make_state("how does authentication work?", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "qa"


def test_trusts_doc_gen_hint():
    state = make_state("explain the codebase", hint="doc_gen")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "doc_gen"


def test_overrides_hint_when_doc_gen_signal_present():
    state = make_state("generate documentation for this project", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "doc_gen"


def test_overrides_hint_create_docs_signal():
    state = make_state("create docs for the auth module", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "doc_gen"


def test_overrides_hint_write_documentation_signal():
    state = make_state("write documentation for this codebase", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "doc_gen"


def test_defaults_to_qa_when_no_hint():
    state = make_state("what does the middleware do?")
    state.pop("intent_hint")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "qa"


def test_case_insensitive_signal_detection():
    state = make_state("GENERATE DOCUMENTATION for the project", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "doc_gen"


def test_normal_question_not_overridden():
    state = make_state("how do I configure the database?", hint="qa")
    result = classify_intent(cast(GraphState, state))
    assert result["intent"] == "qa"