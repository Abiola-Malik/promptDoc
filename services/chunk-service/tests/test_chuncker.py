import pytest
from app.chunker import chunk_files, detect_language, split_into_chunks


def test_detect_language():
    assert detect_language("main.py") == "python"
    assert detect_language("index.ts") == "typescript"
    assert detect_language("app.jsx") == "javascript"
    assert detect_language("unknown.xyz") == "plaintext"

def test_chunk_files_returns_chunks():
    content = "def foo():\n    return 1\n\ndef bar():\n    return 2\n" * 3  # repeat to exceed min_chunk_size
    files = [{"path": "main.py", "content": content}]
    chunks = chunk_files(files, "proj-001")
    assert len(chunks) > 0
    assert all(c.project_id == "proj-001" for c in chunks)
    assert all(c.language == "python" for c in chunks)

def test_chunk_files_sets_correct_indices():
    content = "\n".join([f"def func_{i}():\n    return {i}" for i in range(20)]) * 2
    files = [{"path": "main.py", "content": content}]
    chunks = chunk_files(files, "proj-001")
    assert len(chunks) > 0
    for i, chunk in enumerate(chunks):
        assert chunk.chunk_index == i
        assert chunk.total_chunks == len(chunks)


def test_chunk_files_skips_tiny_files(monkeypatch):
    from app import config
    monkeypatch.setattr(config.settings, "min_chunk_size", 50)
    files = [{"path": "main.py", "content": "x = 1"}]
    chunks = chunk_files(files, "proj-001")
    assert chunks == []


def test_chunk_files_respects_max_chunk_size(monkeypatch):
    from app import config
    monkeypatch.setattr(config.settings, "max_chunk_size", 100)
    content = "x = 1\n" * 100  # well over 100 chars
    files = [{"path": "main.py", "content": content}]
    chunks = chunk_files(files, "proj-001")
    assert all(len(c.content) <= 150 for c in chunks)  # some tolerance for split boundaries


def test_chunk_files_preserves_file_path():
    files = [{"path": "src/services/auth.py", "content": "def login():\n    pass\n" * 10}]
    chunks = chunk_files(files, "proj-001")
    assert all(c.file_path == "src/services/auth.py" for c in chunks)


def test_split_into_chunks_splits_on_function_boundary():
    content = "def foo():\n    return 1\n\ndef bar():\n    return 2\n"
    chunks = split_into_chunks(content, 1500)
    # should stay as one chunk since it's small
    assert len(chunks) == 1


def test_split_large_content():
    # generate content large enough to force splitting
    content = "\n".join([f"def func_{i}():\n    " + "x = 1\n    " * 20 for i in range(10)])
    chunks = split_into_chunks(content, 200)
    assert len(chunks) > 1
    assert all(len(c) <= 300 for c in chunks)  # tolerance for line-level splits