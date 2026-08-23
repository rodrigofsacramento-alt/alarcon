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
    
    if responses:
        from services.db_service import get_supabase
        supabase = get_supabase()
        
        # Buscar as perguntas no banco para mesclar o texto
        questions_resp = supabase.table("questions").select("*").execute()
        q_map = {str(q['id']): q for q in questions_resp.data} if questions_resp.data else {}
        
        for r in responses:
            q_id = str(r.get('question_id'))
            if q_id in q_map:
                q = q_map[q_id]
                r['question_text'] = q.get('text', 'Texto não encontrado no banco')
                
                # Buscar o texto da opção selecionada
                options = q.get('options', [])
                ans_opt = str(r.get('answer_option', ''))
                matched_option = next((o for o in options if str(o.get('value')) == ans_opt or str(o.get('id')) == ans_opt), None)
                if matched_option:
                    r['selected_option_label'] = matched_option.get('label', '')
                    r['construct_scored'] = matched_option.get('construct', '')
    
    return responses
