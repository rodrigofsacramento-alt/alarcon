from services.db_service import get_supabase
import uuid
from typing import List, Dict, Any

class AssessmentService:
    @staticmethod
    def create_assessment(user_id: str, assessment_type: str) -> dict:
        supabase = get_supabase()
        data = {
            "user_id": user_id,
            "assessment_type": assessment_type,
            "status": "INITIATED"
        }
        result = supabase.table("rh_assessments").insert(data).execute()
        return result.data[0] if result.data else None

    @staticmethod
    def get_assessment(assessment_id: str) -> dict:
        supabase = get_supabase()
        result = supabase.table("rh_assessments").select("*").eq("id", assessment_id).execute()
        return result.data[0] if result.data else None

    @staticmethod
    def save_response(assessment_id: str, tool_name: str, question_id: int, answer_option: str, answer_value: int) -> dict:
        supabase = get_supabase()
        
        # Garante que o assessment existe para não dar erro de Foreign Key
        check = supabase.table("rh_assessments").select("id").eq("id", assessment_id).execute()
        if not check.data:
            raise ValueError(f"Assessment ID {assessment_id} não encontrado no banco de dados. A sessão precisa ser criada antes de enviar respostas.")

        data = {
            "assessment_id": assessment_id,
            "tool_name": tool_name,
            "question_id": question_id,
            "answer_option": answer_option,
            "answer_value": answer_value
        }
        result = supabase.table("rh_responses").insert(data).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    def get_responses(assessment_id: str, tool_name: str = None) -> List[dict]:
        supabase = get_supabase()
        query = supabase.table("rh_responses").select("*").eq("assessment_id", assessment_id)
        if tool_name:
            query = query.eq("tool_name", tool_name)
        result = query.execute()
        return result.data
