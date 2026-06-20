import pytest
from typing import cast
from unittest.mock import AsyncMock, patch, MagicMock
from app.nodes.critic import should_refine
from app.models import GraphState


def make_state(critique: str = "", loops: int = 0) -> dict:
    return {
        "query": "how does auth work?",
        "project_id": "proj-001",
        "intent_hint": "qa",
        "intent": "doc_gen",
        "expanded_queries": [],
        "retrieved_chunks": [],
        "context": "some context",
        "answer": "",
        "outline": "# Outline",
        "draft": "# Draft documentation",
        "critique": critique,
        "refined_doc": "",
        "critique_loops": loops,
    }


def test_should_refine_when_critique_has_feedback():
    state = make_state(critique="Missing section on error handling", loops=0)
    result = should_refine(cast(GraphState, state))
    assert result == "refine"


def test_should_finalize_when_approved():
    state = make_state(critique="APPROVED", loops=0)
    result = should_refine(cast(GraphState, state))
    assert result == "finalize"


def test_should_finalize_when_max_loops_reached():
    state = make_state(critique="Still needs work", loops=2)
    with patch("app.nodes.critic.settings") as mock_settings:
        mock_settings.max_critique_loops = 1
        result = should_refine(cast(GraphState, state))
    assert result == "finalize"


def test_should_refine_before_max_loops():
    state = make_state(critique="Needs more examples", loops=1)
    with patch("app.nodes.critic.settings") as mock_settings:
        mock_settings.max_critique_loops = 1
        result = should_refine(cast(GraphState, state))
    assert result == "refine"


def test_approved_overrides_loop_count():
    state = make_state(critique="APPROVED", loops=0)
    result = should_refine(cast(GraphState, state))
    assert result == "finalize"