import pytest
from unittest.mock import MagicMock, patch, call
from app.models import ChunkPayload

def make_chunk(i=0) -> ChunkPayload:
    return ChunkPayload(
        job_id="job-123",
        project_id="proj-001",
        file_path=f"src/file_{i}.py",
        content=f"def func_{i}(): pass",
        chunk_index=i,
        total_chunks=3,
        language="python",
    )

@patch("app.store._pinecone_client", None)
@patch("app.store._index", None)
@patch("app.store.Pinecone")
def test_get_index_initializes_once(mock_pinecone):
    import app.store as store_module
    store_module._pinecone_client = None
    store_module._index = None

    mock_pc = MagicMock()
    mock_pinecone.return_value = mock_pc

    store_module.get_index()
    store_module.get_index()

    assert mock_pinecone.call_count == 1


@patch("app.store.get_index")
@patch("app.store.get_embedder")
@patch("app.store.PineconeVectorStore")
def test_upsert_chunks_batch_calls_add_documents(mock_vs_class, mock_embedder, mock_index):
    from app.store import upsert_chunks_batch

    mock_vs = MagicMock()
    mock_vs_class.return_value = mock_vs

    chunks = [make_chunk(i) for i in range(3)]
    upsert_chunks_batch(chunks)

    mock_vs.add_documents.assert_called_once()
    docs = mock_vs.add_documents.call_args[0][0]
    assert len(docs) == 3


@patch("app.store.get_index")
@patch("app.store.get_embedder")
@patch("app.store.PineconeVectorStore")
def test_upsert_chunks_batch_correct_namespace(mock_vs_class, mock_embedder, mock_index):
    from app.store import upsert_chunks_batch

    chunks = [make_chunk(i) for i in range(2)]
    upsert_chunks_batch(chunks)

    call_kwargs = mock_vs_class.call_args.kwargs
    assert call_kwargs.get("namespace") == "proj-001"


@patch("app.store.get_index")
@patch("app.store.get_embedder")
@patch("app.store.PineconeVectorStore")
def test_upsert_chunks_batch_correct_metadata(mock_vs_class, mock_embedder, mock_index):
    from app.store import upsert_chunks_batch

    mock_vs = MagicMock()
    mock_vs_class.return_value = mock_vs

    chunks = [make_chunk(0)]
    upsert_chunks_batch(chunks)

    docs = mock_vs.add_documents.call_args[0][0]
    assert docs[0].metadata["file_path"] == "src/file_0.py"
    assert docs[0].metadata["language"] == "python"
    assert docs[0].metadata["job_id"] == "job-123"


def test_upsert_chunks_batch_empty_is_noop():
    from app.store import upsert_chunks_batch
    # should not raise
    upsert_chunks_batch([])