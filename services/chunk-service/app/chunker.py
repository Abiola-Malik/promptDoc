import re
from app.models import Chunk
from app.config import settings

LANGUAGE_MAP = {
    ".py": "python", ".ts": "typescript", ".tsx": "typescript",
    ".js": "javascript", ".jsx": "javascript", ".go": "go",
    ".java": "java", ".rs": "rust", ".cpp": "cpp", ".c": "c",
    ".cs": "csharp", ".rb": "ruby", ".md": "markdown",
    ".json": "json", ".yaml": "yaml", ".yml": "yaml",
}

# patterns that signal a good split boundary
SPLIT_PATTERNS = re.compile(
    r"(?=\n(?:def |class |function |const |export |async function |"
    r"public |private |protected |fn |func |interface |type |enum ))"
)

def detect_language(path: str) -> str:
    ext = "." + path.rsplit(".", 1)[-1] if "." in path else ""
    return LANGUAGE_MAP.get(ext, "plaintext")

def split_into_chunks(content: str, max_size: int) -> list[str]:
    # try structure-aware split first
    parts = SPLIT_PATTERNS.split(content)
    chunks = []
    current = ""

    for part in parts:
        if len(current) + len(part) <= max_size:
            current += part
        else:
            if current.strip():
                chunks.append(current.strip())
            # if single part exceeds max, split by lines
            if len(part) > max_size:
                lines = part.split("\n")
                for line in lines:
                    if len(current) + len(line) <= max_size:
                        current += line + "\n"
                    else:
                        if current.strip():
                            chunks.append(current.strip())
                        current = line + "\n"
            else:
                current = part

    if current.strip():
        chunks.append(current.strip())

    return chunks

def chunk_files(files: list[dict], project_id: str) -> list[Chunk]:
    all_chunks = []
    for file in files:
        path = file["path"]
        content = file["content"]
        language = detect_language(path)

        if len(content) < settings.min_chunk_size:
            continue

        raw_chunks = split_into_chunks(content, settings.max_chunk_size)
        total = len(raw_chunks)

        for i, chunk_content in enumerate(raw_chunks):
            all_chunks.append(Chunk(
                project_id=project_id,
                file_path=path,
                content=chunk_content,
                chunk_index=i,
                total_chunks=total,
                language=language,
            ))

    return all_chunks