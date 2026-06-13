from pydantic import BaseModel
from typing import Optional

class ChunkPayload(BaseModel):
    job_id: str
    project_id: str
    file_path: str
    content: str
    chunk_index: int
    total_chunks: int
    language: str

class JobStatus(BaseModel):
    job_id: str
    project_id: str
    status: str
    total_chunks: int
    processed: int
    failed: int
    progress_pct: float