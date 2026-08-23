from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportCreate(BaseModel):
    report_type: str
    title: str

class ReportResponse(BaseModel):
    id: str
    assessment_id: str
    user_id: str
    report_type: str
    title: str
    pdf_url: Optional[str] = None
    html_url: Optional[str] = None
    generated_at: datetime
    
    class Config:
        from_attributes = True
