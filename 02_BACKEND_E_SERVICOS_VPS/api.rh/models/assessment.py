from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssessmentCreate(BaseModel):
    assessment_type: str  # 'DISC', 'MBTI', 'BIG_FIVE', 'ANCORAS', 'OPQ', 'VALORES'

class AssessmentResponse(BaseModel):
    id: str
    user_id: str
    assessment_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
