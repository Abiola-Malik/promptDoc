import zipfile
import io
from app.config import settings

SUPPORTED_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java",
    ".rs", ".cpp", ".c", ".cs", ".rb", ".php", ".swift",
    ".kt", ".md", ".json", ".yaml", ".yml"
}

IGNORED_DIRS = {"node_modules", ".git", "__pycache__", ".next", "dist", "build", ".venv", "venv"}

def extract_zip(contents: bytes) -> list[dict]:
    files = []
    with zipfile.ZipFile(io.BytesIO(contents)) as zf:
        for filepath in zf.namelist():
            print(f"checking: {filepath}")
            if ".." in filepath or filepath.startswith("/"):
                print(f"  skipped: zip slip")
                continue
            parts = filepath.split("/")
            if any(part in IGNORED_DIRS for part in parts):
                print(f"  skipped: ignored dir")
                continue
            ext = "." + filepath.rsplit(".", 1)[-1] if "." in filepath else ""
            if ext not in SUPPORTED_EXTENSIONS:
                print(f"  skipped: unsupported ext '{ext}'")
                continue
            info = zf.getinfo(filepath)
            if info.file_size > settings.max_file_size_kb * 1024:
                print(f"  skipped: too large {info.file_size}")
                continue
            print(f"  accepted: {filepath}")
            with zf.open(filepath) as f:
                try:
                    content = f.read().decode("utf-8", errors="ignore")
                    files.append({"path": filepath, "content": content})
                except Exception:
                    continue
    return files