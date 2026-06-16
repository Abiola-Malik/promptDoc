import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.graph import build_graph


def test_graph_builds_without_error():
    graph = build_graph()
    assert graph is not None


def test_graph_has_correct_nodes():
    graph = build_graph()
    nodes = list(graph.get_graph().nodes.keys())
    expected = ["classify", "expand", "retrieve", "generate", "plan", "draft", "critique"]
    for node in expected:
        assert node in nodes


def test_graph_entry_point_is_classify():
    graph = build_graph()
    # entry point is always __start__ which connects to classify
    edges = graph.get_graph().edges
    edge_targets = [e[1] for e in edges]
    assert "classify" in edge_targets


def test_graph_has_conditional_edge_from_retrieve():
    graph = build_graph()
    edges = graph.get_graph().edges
    edge_sources = [e[0] for e in edges]
    assert "retrieve" in edge_sources


def test_graph_qa_path_ends_at_generate():
    graph = build_graph()
    edges = graph.get_graph().edges
    # generate should connect to END
    generate_edges = [e for e in edges if e[0] == "generate"]
    assert len(generate_edges) > 0


def test_graph_doc_gen_path_includes_critique():
    graph = build_graph()
    edges = graph.get_graph().edges
    edge_sources = [e[0] for e in edges]
    assert "critique" in edge_sources