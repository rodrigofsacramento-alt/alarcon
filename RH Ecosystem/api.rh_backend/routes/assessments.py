from fastapi import APIRouter, HTTPException, Depends
from models.assessment import AssessmentCreate, AssessmentResponse
from services.assessment_service import AssessmentService
from services.db_service import get_supabase

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(assessment_data: AssessmentCreate, user_id: str):
    # In a real app, user_id would come from Depends(get_current_user)
    result = AssessmentService.create_assessment(user_id, assessment_data.assessment_type)
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
    tool_upper = tool_name.upper().replace("-", "_")
    if tool_upper in ["BIGFIVE", "BIG_5"]:
        tool_upper = "BIG_FIVE"

    result = supabase.table("questions").select("*").eq("tool_name", tool_upper).order("question_number").execute()
    data = result.data or []
    for q in data:
        if q.get("options") and isinstance(q["options"], list):
            for opt in q["options"]:
                if isinstance(opt, dict):
                    val = opt.get("value") or opt.get("id") or "A"
                    lbl = opt.get("label") or opt.get("text") or ""
                    opt["value"] = str(val)
                    opt["id"] = str(val)
                    opt["label"] = str(lbl)
                    opt["text"] = str(lbl)
    return data
