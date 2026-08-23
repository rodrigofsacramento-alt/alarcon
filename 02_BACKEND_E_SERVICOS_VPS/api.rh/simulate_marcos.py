
import requests
import json
import uuid
import time
from services.db_service import get_supabase

BASE_URL = "http://127.0.0.1:8001/api/v1"

def run_simulation():
    print("Iniciando simulacao End-to-End para Marcos Rodrigues...")
    supabase = get_supabase()
    
    # 1. Obter ou criar usuario (Marcos Rodrigues) usando Apenas Email e Name!
    users = supabase.table("users").select("id").eq("email", "marcos.rodrigues@email.com").execute()
    if users.data:
        user_id = users.data[0]['id']
        print(f"Usuario encontrado: {user_id}")
    else:
        new_user = {
            "email": "marcos.rodrigues@email.com",
            "name": "Marcos Rodrigues"
        }
        res = supabase.table("users").insert(new_user).execute()
        user_id = res.data[0]['id']
        print(f"Usuario criado com sucesso: {user_id}")
        
    # 2. Criar Assessment
    new_assessment = {
        "user_id": user_id,
        "assessment_type": "FULL_BEHAVIORAL"
    }
    res = supabase.table("assessments").insert(new_assessment).execute()
    assessment_id = res.data[0]['id']
    print(f"Assessment criado: {assessment_id}")
    
    # 3. Responder todas as perguntas!
    questions = supabase.table("questions").select("*").execute()
    if not questions.data:
        print("ERRO: Nenhuma pergunta encontrada no banco.")
        return
        
    print(f"Respondendo {len(questions.data)} perguntas...")
    for q in questions.data:
        ans = {
            "question_id": q['id'],
            "tool_name": q['tool_name'],
            "answer_value": 1,
            "answer_option": "A"
        }
        if q.get("options") and len(q["options"]) > 0:
            ans["answer_option"] = str(q["options"][0].get("value", "A"))
            
        requests.post(f"{BASE_URL}/responses/{assessment_id}", json=ans)
        
    print("Todas as perguntas foram respondidas.")
    
    # 4. Iniciar Geração IA
    print("Iniciando geracao de relatorios por IA...")
    payload = {
        "nome": "Marcos Rodrigues",
        "cargo": "Gestor Comercial",
        "area": "Comercial",
        "empresa": "Apex",
        "consultor": "Sistema Antigravity"
    }
    r = requests.post(f"{BASE_URL}/reports/{assessment_id}/generate-ai", json=payload)
    if r.status_code != 200:
        print(f"Erro ao iniciar geracao IA: {r.text}")
        return
        
    job_id = r.json().get("job_id")
    print(f"Job IA iniciado: {job_id}")
    
    # 5. Polling ate terminar
    print("Aguardando IA (isso pode demorar varios minutos)...")
    while True:
        status_req = requests.get(f"{BASE_URL}/reports/status/{job_id}")
        job_data = status_req.json()
        if job_data.get("status") == "COMPLETED":
            print("Geracao IA concluida!")
            break
        elif job_data.get("status") == "ERROR":
            print(f"Erro no job: {job_data.get('error')}")
            return
            
        print("Aguardando 10 segundos...")
        time.sleep(10)
        
    # 6. Gerar PDF Final
    print("Gerando PDF Final...")
    pdf_req = requests.post(f"{BASE_URL}/reports/generate-pdf/{job_id}", json=job_data.get("results"))
    if pdf_req.status_code != 200:
        print(f"Erro ao gerar PDF: {pdf_req.text}")
        return
        
    pdf_url = pdf_req.json().get("pdf_url")
    print("============== SUCESSO ==============")
    print(f"Relatorio PDF gerado com sucesso para Marcos Rodrigues!")
    print(f"URL: {pdf_url}")
    print("=====================================")

if __name__ == '__main__':
    run_simulation()
