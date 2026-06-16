import pytest
from typing import Optional, cast
from unittest.mock import AsyncMock, patch, MagicMock
from app.nodes.retriever import retrieve_context
from app.models import GraphState


def make_state(queries: Optional[list[str]] = None) -> dict:
    return {
        "query": "how does auth work?",
        "project_id": "proj-001",
        "intent_hint": "qa",
        "intent": "qa",
        "expanded_queries": queries or ["how does auth work?", "authentication flow", "session management"],
        "retrieved_chunks": [],
        "context": "",
        "answer": "",
        "outline": "",
        "draft": "",
        "critique": "",
        "refined_doc": "",
        "critique_loops": 0,
    }


def make_chunk(i: int) -> dict:
    return {
        "content": f"def authenticate_{i}(): pass",
        "file_path": f"src/auth_{i}.py",
        "language": "python",
        "score": 0.9 - (i * 0.1),
    }


@pytest.mark.asyncio
@patch("app.nodes.retriever.retrieve", new_callable=AsyncMock)
async def test_retrieve_context_calls_retrieve_for_each_query(mock_retrieve):
    mock_retrieve.return_value = [make_chunk(0)]
    state = make_state(["query1", "query2", "query3"])
    await retrieve_context(cast(GraphState, state))
    assert mock_retrieve.call_count == 3


@pytest.mark.asyncio
@patch("app.nodes.retriever.retrieve", new_callable=AsyncMock)
async def test_retrieve_context_deduplicates_chunks(mock_retrieve):
    # same chunk returned by multiple queries
    duplicate = make_chunk(0)
    mock_retrieve.return_value = [duplicate]
    state = make_state(["query1", "query2"])
    result = await retrieve_context(cast(GraphState, state))
    # despite 2 queries returning same chunk, context should have it once
    assert result["context"].count("authenticate_0") == 1


@pytest.mark.asyncio
@patch("app.nodes.retriever.retrieve", new_callable=AsyncMock)
async def test_retrieve_context_builds_context_string(mock_retrieve):
    mock_retrieve.return_value = [make_chunk(0)]
    state = make_state(["query1"])
    result = await retrieve_context(cast(GraphState, state))
    assert "src/auth_0.py" in result["context"]
    assert "authenticate_0" in result["context"]


@pytest.mark.asyncio
@patch("app.nodes.retriever.retrieve", new_callable=AsyncMock)
async def test_retrieve_context_caps_at_max_chunks(mock_retrieve):
    # return 10 unique chunks per query
    mock_retrieve.side_effect = lambda q, ns, k: [make_chunk(i) for i in range(10)]
    state = make_state(["q1", "q2"])
    with patch("app.nodes.retriever.settings") as mock_settings:
        mock_settings.max_retrieval_results = 10
        mock_settings.max_context_chunks = 5
        result = await retrieve_context(cast(GraphState, state))
    assert len(result["retrieved_chunks"]) <= 5


@pytest.mark.asyncio
@patch("app.nodes.retriever.retrieve", new_callable=AsyncMock)
async def test_retrieve_context_returns_retrieved_chunks(mock_retrieve):
    chunks = [make_chunk(i) for i in range(3)]
    mock_retrieve.return_value = chunks
    state = make_state(["query1"])
    result = await retrieve_context(cast(GraphState, state))
    assert len(result["retrieved_chunks"]) == 3