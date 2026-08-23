from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResponseCreate(BaseModel):
    question_id: str
    tool_name: str
    answer_option: str
    answer_value: int
    response_time: Optional[int] = None

class ResponseUpdate(BaseModel):
    answer_option: str
    answer_value: int

class ResponseDetail(BaseModel):
    id: str
    assessment_id: str
    question_id: str
    tool_name: str
    answer_option: str
    answer_value: int
    created_at: datetime
    
    class Config:
        from_attributes = True
