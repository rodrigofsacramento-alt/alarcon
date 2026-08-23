from fastapi import APIRouter, HTTPException, Depends
from models.assessment import AssessmentCreate, AssessmentResponse
from services.assessment_service import AssessmentService
from services.db_service import get_supabase

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/start", response_model=AssessmentResponse)
async def create_assessment(assessment_data: AssessmentCreate):
    # In a real app, user_id would come from Depends(get_current_user)
    result = AssessmentService.create_assessment(assessment_data.user_id, assessment_data.assessment_type)
    if result:
        return result
    raise HTTPException(status_code=500, detail="Failed to create assessment")

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str):
    result = AssessmentService.get_assessment(assessment_id)
    if result:
        return result
    raise HTTPException(status_code=404, detail="Assessment not found")

@router.get("/questions/{tool_name}")
async def get_questions(tool_name: str):
    supabase = get_supabase()
    result = supabase.table("questions").select("*").eq("tool_name", tool_name).order("question_number").execute()
    if result.data:
        return result.data
    return []
