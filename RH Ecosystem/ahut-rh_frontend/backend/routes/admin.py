from fastapi import APIRouter, HTTPException, Depends
from services.db_service import get_supabase
from services.auth_service import AuthService
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def get_all_users():
    supabase = get_supabase()
    
    # Busca todos os usuarios (que não são admin)
    # Colunas reais em rh_users: id, name, email, role, created_at
    users_res = supabase.table("users").select("id, name, email, role, created_at").neq("role", "admin").execute()
    users = users_res.data if users_res.data else []
    
    # Busca todos os assessments para saber o status
    # Coluna real: assessment_type (não tool_name)
    assessments_res = supabase.table("assessments").select("id, user_id, assessment_type").execute()
    
    # Busca os relatórios gerados
    reports_res = supabase.table("reports").select("user_id, pdf_url").execute()
    
    assessments_map = {}
    last_assessment_map = {}
    if assessments_res.data:
        for a in assessments_res.data:
            uid = a["user_id"]
            if uid not in assessments_map:
                assessments_map[uid] = []
            assessments_map[uid].append(a.get("assessment_type", ""))
            last_assessment_map[uid] = a.get("id")
            
    reports_map = {}
    if reports_res.data:
        for r in reports_res.data:
            uid = r["user_id"]
            reports_map[uid] = r["pdf_url"]
            
    for user in users:
        uid = user["id"]
        completed_tools = assessments_map.get(uid, [])
        user["completed_tests"] = len(completed_tools)
        user["is_ready"] = len(completed_tools) >= 6 # Mínimo de 6 testes para gerar o macro
        user["report_url"] = reports_map.get(uid)
        user["assessment_id"] = last_assessment_map.get(uid)
        
    return users
