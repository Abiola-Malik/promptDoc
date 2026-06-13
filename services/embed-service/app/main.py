from fastapi import FastAPI, Header, HTTPException
from app.models import JobStatus
from app.queue import get_job_status
from app.config import settings

app = FastAPI(title="embed-service", version="1.0.0")

def verify_secret(x_internal_secret: str = Header(...)):
    if x_internal_secret != settings.internal_api_secret:
        raise HTTPException(status_code=403, detail="Forbidden")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "embed-service"}

@app.get("/job/{job_id}", response_model=JobStatus)
async def job_status(job_id: str, x_internal_secret: str = Header(...)):
    verify_secret(x_internal_secret)
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status