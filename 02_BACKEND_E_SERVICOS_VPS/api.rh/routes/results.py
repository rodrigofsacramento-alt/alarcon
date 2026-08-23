from fastapi import APIRouter, HTTPException
from models.result import ResultsResponse
from services.calculation_service import CalculationService
from services.assessment_service import AssessmentService
from services.db_service import get_supabase

router = APIRouter(prefix="/results", tags=["results"])

@router.post("/{assessment_id}/calculate")
async def calculate_results(assessment_id: str):
    responses = AssessmentService.get_responses(assessment_id)
    if not responses:
        raise HTTPException(status_code=400, detail="No responses found for this assessment")
        
    result = CalculationService.calculate_all(assessment_id, responses)
    if result:
        # Save result to database so it can be fetched by the dashboard and reports generator
        supabase = get_supabase()
        supabase.table("results").upsert(result).execute()
        return {"status": "success", "data": result}
    raise HTTPException(status_code=500, detail="Failed to calculate results")

@router.get("/{assessment_id}")
async def get_results(assessment_id: str):
    supabase = get_supabase()
    result = supabase.table("results").select("*").eq("assessment_id", assessment_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Results not found")
    return result.data
