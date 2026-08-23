import uuid
from datetime import datetime

class JobService:
    _jobs = {}

    @classmethod
    def create_job(cls, assessment_id: str) -> str:
        job_id = str(uuid.uuid4())
        cls._jobs[job_id] = {
            "job_id": job_id,
            "assessment_id": assessment_id,
            "status": "PENDING",
            "progress": 0.0,
            "reports_generated": 0,
            "total_reports": 8,
            "message": "Inicializando geração...",
            "results": {},
            "pdf_url": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        return job_id

    @classmethod
    def get_job(cls, job_id: str) -> dict:
        return cls._jobs.get(job_id)

    @classmethod
    def update_job(cls, job_id: str, updates: dict):
        if job_id in cls._jobs:
            cls._jobs[job_id].update(updates)
            cls._jobs[job_id]["updated_at"] = datetime.now().isoformat()
