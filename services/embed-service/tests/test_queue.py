import pytest
import json
from unittest.mock import MagicMock, patch, call
from typing import cast


@patch("app.queue.get_redis")
def test_pop_chunk_returns_none_on_timeout(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.blpop.return_value = None
    mock_get_redis.return_value = mock_redis

    from app.queue import pop_chunk
    result = pop_chunk(timeout=1)
    assert result is None


@patch("app.queue.get_redis")
def test_pop_chunk_returns_parsed_json(mock_get_redis):
    mock_redis = MagicMock()
    payload = {"job_id": "job-123", "project_id": "proj-001"}
    mock_redis.blpop.return_value = (b"embed_queue", json.dumps(payload).encode())
    mock_get_redis.return_value = mock_redis

    from app.queue import pop_chunk
    result = pop_chunk()
    assert result == payload


@patch("app.queue.get_redis")
def test_pop_chunk_nowait_returns_none_when_empty(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.lpop.return_value = None
    mock_get_redis.return_value = mock_redis

    from app.queue import pop_chunk_nowait
    result = pop_chunk_nowait()
    assert result is None


@patch("app.queue.get_redis")
def test_update_job_progress_success(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        b"total_chunks": b"10",
        b"processed": b"5",
        b"failed": b"0",
    }
    mock_get_redis.return_value = mock_redis

    from app.queue import update_job_progress
    update_job_progress("job-123", success=True)
    mock_redis.hincrby.assert_called_with("job:job-123", "processed", 1)


@patch("app.queue.get_redis")
def test_update_job_progress_failure(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        b"total_chunks": b"10",
        b"processed": b"5",
        b"failed": b"1",
    }
    mock_get_redis.return_value = mock_redis

    from app.queue import update_job_progress
    update_job_progress("job-123", success=False)
    mock_redis.hincrby.assert_called_with("job:job-123", "failed", 1)


@patch("app.queue.get_redis")
def test_update_job_marks_complete_when_done(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        b"total_chunks": b"3",
        b"processed": b"3",
        b"failed": b"0",
    }
    mock_get_redis.return_value = mock_redis

    from app.queue import update_job_progress
    update_job_progress("job-123", success=True)
    mock_redis.hset.assert_called_with("job:job-123", "status", "complete")


@patch("app.queue.get_redis")
def test_get_job_status_returns_none_for_missing_job(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {}
    mock_get_redis.return_value = mock_redis

    from app.queue import get_job_status
    result = get_job_status("nonexistent")
    assert result is None


@patch("app.queue.get_redis")
def test_get_job_status_calculates_progress(mock_get_redis):
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        b"total_chunks": b"100",
        b"processed": b"75",
        b"failed": b"0",
        b"project_id": b"proj-001",
        b"status": b"queued",
    }
    mock_get_redis.return_value = mock_redis

    from app.queue import get_job_status
    result = get_job_status("job-123")
    assert result is not None
    assert result["progress_pct"] == 75.0
    assert result["processed"] == 75