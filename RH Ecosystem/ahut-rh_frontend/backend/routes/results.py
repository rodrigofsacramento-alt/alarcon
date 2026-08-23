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
        supabase = get_supabase()
        # Usar .limit(1) em vez de .single() para evitar erro 406 do PostgREST
        existing = supabase.table("results").select("id").eq("assessment_id", assessment_id).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            supabase.table("results").update(result).eq("assessment_id", assessment_id).execute()
        else:
            supabase.table("results").insert(result).execute()
        return {"status": "success", "data": result}
    raise HTTPException(status_code=500, detail="Failed to calculate results")

@router.get("/debug/mbti/{assessment_id}")
async def debug_mbti(assessment_id: str):
    from services.assessment_service import AssessmentService
    responses = AssessmentService.get_responses(assessment_id)
    mbti_res = [r for r in (responses or []) if r.get("tool_name") == "MBTI"]
    
    counts = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
    for r in mbti_res:
        counts[r.get("construct", "")] = counts.get(r.get("construct", ""), 0) + 1
        
    return {
        "assessment_id": assessment_id,
        "total_respostas": len(mbti_res),
        "soma_construtos": counts,
        "respostas_brutas": mbti_res
    }

@router.get("/{assessment_id}")
async def get_results(assessment_id: str):
    supabase = get_supabase()
    # Usar .limit(1) em vez de .single() para evitar erro 406 do PostgREST
    # quando nenhum registro é encontrado ou há múltiplos registros
    result = supabase.table("results").select("*").eq("assessment_id", assessment_id).limit(1).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Results not found")
    return result.data[0]
