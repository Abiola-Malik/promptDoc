import pytest
from unittest.mock import MagicMock, patch

@patch("app.embedder._embedder", None)
@patch("app.embedder.VoyageAIEmbeddings")
def test_get_embedder_initializes_once(mock_voyage):
    from app.embedder import get_embedder
    import app.embedder as embedder_module
    embedder_module._embedder = None

    e1 = get_embedder()
    e2 = get_embedder()

    assert mock_voyage.call_count == 1
    assert e1 is e2


@patch("app.embedder.VoyageAIEmbeddings")
def test_get_embedder_uses_correct_model(mock_voyage):
    from app import embedder as embedder_module
    embedder_module._embedder = None

    get_embedder = embedder_module.get_embedder
    get_embedder()

    call_kwargs = mock_voyage.call_args.kwargs
    assert call_kwargs.get("model") == "voyage-code-3"