from pydantic import BaseModel
from typing import Optional

class GithubSource(BaseModel):
    repo: str           # e.g. "Abiola-Malik/promptdoc"
    branch: str = "main"
    token: str          # GitHub OAuth token from frontend

class ChunkRequest(BaseModel):
    project_id: str
    source: str                        # "zip" | "github"
    github: Optional[GithubSource] = None
    # ZIP comes as multipart, not JSON — handled separately in route

class Chunk(BaseModel):
    project_id: str
    file_path: str
    content: str
    chunk_index: int
    total_chunks: int
    language: str

class ChunkJobResponse(BaseModel):
    job_id: str
    project_id: str
    status: str = "queued"
    message: str