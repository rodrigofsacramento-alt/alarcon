from fastapi import APIRouter, HTTPException
from models.response import ResponseCreate, ResponseDetail
from services.assessment_service import AssessmentService

router = APIRouter(prefix="/responses", tags=["responses"])

@router.post("/{assessment_id}")
async def submit_response(assessment_id: str, response_data: ResponseCreate):
    result = AssessmentService.save_response(
        assessment_id=assessment_id,
        tool_name=response_data.tool_name,
        question_id=response_data.question_id,
        answer_option=response_data.answer_option,
        answer_value=response_data.answer_value
    )
    if result:
        return {"status": "success", "data": result}
    raise HTTPException(status_code=500, detail="Failed to save response")

@router.get("/{assessment_id}")
async def get_responses(assessment_id: str, tool_name: str = None):
    responses = AssessmentService.get_responses(assessment_id, tool_name)
    return responses
