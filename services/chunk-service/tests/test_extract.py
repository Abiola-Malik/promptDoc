import pytest
import zipfile
import io
from app.extract import extract_zip

def make_zip(files: dict) -> bytes:
    """helper — creates an in-memory ZIP from a dict of {filename: content}"""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, content in files.items():
            zf.writestr(name, content)
    return buf.getvalue()


def test_extracts_supported_files():
    z = make_zip({"project/main.py": "print('hello')", "project/index.ts": "const x = 1"})
    result = extract_zip(z)
    paths = [f["path"] for f in result]
    assert "project/main.py" in paths
    assert "project/index.ts" in paths


def test_skips_unsupported_extensions():
    z = make_zip({"project/setup.sh": "#!/bin/bash", "project/main.py": "x = 1"})
    result = extract_zip(z)
    paths = [f["path"] for f in result]
    assert "project/setup.sh" not in paths
    assert "project/main.py" in paths


def test_skips_ignored_directories():
    z = make_zip({
        "project/node_modules/lib.ts": "export const x = 1",
        "project/__pycache__/main.pyc": "bytecode",
        "project/src/app.py": "x = 1",
    })
    result = extract_zip(z)
    paths = [f["path"] for f in result]
    assert not any("node_modules" in p for p in paths)
    assert not any("__pycache__" in p for p in paths)
    assert "project/src/app.py" in paths


def test_blocks_zip_slip():
    z = make_zip({"../etc/passwd": "root:x:0:0", "safe/main.py": "x = 1"})
    result = extract_zip(z)
    paths = [f["path"] for f in result]
    assert "../etc/passwd" not in paths
    assert "safe/main.py" in paths


def test_skips_files_exceeding_size_limit(monkeypatch):
    from app import config
    monkeypatch.setattr(config.settings, "max_file_size_kb", 1)
    large_content = "x = 1\n" * 300  # ~1.8KB
    z = make_zip({"project/big.py": large_content, "project/small.py": "x = 1"})
    result = extract_zip(z)
    paths = [f["path"] for f in result]
    assert "project/big.py" not in paths
    assert "project/small.py" in paths


def test_returns_correct_content():
    z = make_zip({"project/main.py": "def hello():\n    return 'world'"})
    result = extract_zip(z)
    assert result[0]["content"] == "def hello():\n    return 'world'"


def test_empty_zip_returns_empty_list():
    z = make_zip({})
    result = extract_zip(z)
    assert result == []