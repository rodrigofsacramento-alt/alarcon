from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class DiscResult(BaseModel):
    d: float
    i: float
    s: float
    c: float
    primary: str
    secondary: str

class MbtiResult(BaseModel):
    type: str
    e_i: float
    s_n: float
    t_f: float
    j_p: float

class BigFiveResult(BaseModel):
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float

class AncorasResult(BaseModel):
    tecnica: float
    gerencial: float
    autonomia: float
    seguranca: float
    criatividade: float
    servico: float
    desafio: float
    equilibrio: float

class ResultsResponse(BaseModel):
    id: str
    assessment_id: str
    user_id: str
    disc: DiscResult
    mbti: MbtiResult
    big_five: BigFiveResult
    ancoras: AncorasResult
    opq_scores: Dict[str, Any]
    valores: Dict[str, float]
    confidence_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True
