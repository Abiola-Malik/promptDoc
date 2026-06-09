import pytest
import json
from unittest.mock import MagicMock, patch, call
from app.queue import publish_chunks
from app.models import Chunk


def make_chunks(n=3) -> list[Chunk]:
    return [
        Chunk(
            project_id="proj-001",
            file_path=f"src/file_{i}.py",
            content=f"def func_{i}(): pass",
            chunk_index=i,
            total_chunks=n,
            language="python",
        )
        for i in range(n)
    ]


@patch("app.queue.get_redis")
def test_publish_creates_job_metadata(mock_get_redis):
    mock_redis = MagicMock()
    mock_get_redis.return_value = mock_redis
    chunks = make_chunks(3)
    publish_chunks("job-123", "proj-001", chunks)
    mock_redis.hset.assert_called_once_with(
        "job:job-123",
        mapping={
            "project_id": "proj-001",
            "status": "queued",
            "total_chunks": 3,
            "processed": 0,
        }
    )


@patch("app.queue.get_redis")
def test_publish_pushes_all_chunks(mock_get_redis):
    mock_redis = MagicMock()
    mock_get_redis.return_value = mock_redis
    chunks = make_chunks(3)
    publish_chunks("job-123", "proj-001", chunks)
    assert mock_redis.rpush.call_count == 3


@patch("app.queue.get_redis")
def test_publish_chunk_json_is_valid(mock_get_redis):
    mock_redis = MagicMock()
    mock_get_redis.return_value = mock_redis
    chunks = make_chunks(1)
    publish_chunks("job-123", "proj-001", chunks)
    call_args = mock_redis.rpush.call_args[0]
    payload = json.loads(call_args[1])
    assert payload["job_id"] == "job-123"
    assert payload["project_id"] == "proj-001"
    assert payload["file_path"] == "src/file_0.py"
    assert payload["language"] == "python"
    assert payload["chunk_index"] == 0


@patch("app.queue.get_redis")
def test_publish_sets_ttl(mock_get_redis):
    mock_redis = MagicMock()
    mock_get_redis.return_value = mock_redis
    publish_chunks("job-123", "proj-001", make_chunks(1))
    mock_redis.expire.assert_called_once_with("job:job-123", 60 * 60 * 24)


@patch("app.queue.get_redis")
def test_publish_empty_chunks(mock_get_redis):
    mock_redis = MagicMock()
    mock_get_redis.return_value = mock_redis
    publish_chunks("job-123", "proj-001", [])
    mock_redis.hset.assert_called_once()
    mock_redis.rpush.assert_not_called()