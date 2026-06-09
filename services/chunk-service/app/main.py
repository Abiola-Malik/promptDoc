from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ChunkJobResponse, GithubSource
from app.extract import extract_zip
from app.chunker import chunk_files
from app.github import fetch_github_files
from app.queue import publish_chunks
from app.config import settings
import uuid

app = FastAPI(title="chunk-service", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def verify_secret(x_internal_secret: str = Header(...)):
    if x_internal_secret != settings.internal_api_secret:
        raise HTTPException(status_code=403, detail="Forbidden")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "chunk-service"}

@app.post("/chunk/zip", response_model=ChunkJobResponse)
async def chunk_zip(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    x_internal_secret: str = Header(...),
):
    verify_secret(x_internal_secret)
    contents = await file.read()
    files = extract_zip(contents)
    chunks = chunk_files(files, project_id)
    job_id = str(uuid.uuid4())
    publish_chunks(job_id, project_id, chunks)
    return ChunkJobResponse(job_id=job_id, project_id=project_id, message=f"{len(chunks)} chunks queued")

@app.post("/chunk/github", response_model=ChunkJobResponse)
async def chunk_github(
    source: GithubSource,
    project_id: str,
    x_internal_secret: str = Header(...),
):
    verify_secret(x_internal_secret)
    files = await fetch_github_files(source.repo, source.branch, source.token)
    chunks = chunk_files(files, project_id)
    job_id = str(uuid.uuid4())
    publish_chunks(job_id, project_id, chunks)
    return ChunkJobResponse(job_id=job_id, project_id=project_id, message=f"{len(chunks)} chunks queued")