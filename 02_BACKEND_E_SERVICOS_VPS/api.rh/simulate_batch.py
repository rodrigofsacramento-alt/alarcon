
import requests
import json
import time
import random
from services.db_service import get_supabase

BASE_URL = "http://127.0.0.1:8001/api/v1"

PROFILES = [
    {"name": "Teste", "email": "teste@empresa.com", "cargo": "Diretor de Vendas", "empresa": "Empresa Teste"},
    {"name": "Rogerio", "email": "rogerio@empresa.com", "cargo": "Gerente de Projetos", "empresa": "Nao informada"},
    {"name": "Vitor", "email": "vitor@empresa.com", "cargo": "Analista de Sistemas", "empresa": "Empresa V8"},
    {"name": "JR Calha", "email": "jr@empresa.com", "cargo": "Comprador", "empresa": "JR Calhas"}
]

def simulate_profile(profile):
    print(f"\n--- Iniciando E2E para {profile['name']} ---")
    supabase = get_supabase()
    
    # 1. User
    users = supabase.table("users").select("id").eq("email", profile["email"]).execute()
    if users.data:
        user_id = users.data[0]['id']
    else:
        new_user = {"email": profile["email"], "name": profile["name"]}
        res = supabase.table("users").insert(new_user).execute()
        user_id = res.data[0]['id']
        
    # 2. Assessment
    new_assessment = {"user_id": user_id, "assessment_type": "FULL_BEHAVIORAL"}
    res = supabase.table("assessments").insert(new_assessment).execute()
    assessment_id = res.data[0]['id']
    
    # 3. Respostas Aleatorias (para perfis diferentes)
    questions = supabase.table("questions").select("*").execute()
    options_pool = ["A", "B", "C", "D", "E"]
    
    for q in questions.data:
        ans = {
            "question_id": q['id'],
            "tool_name": q['tool_name'],
            "answer_value": random.randint(1, 5),
            "answer_option": random.choice(options_pool)
        }
        if q.get("options") and len(q["options"]) > 0:
            opts = [o.get("value") for o in q["options"]]
            ans["answer_option"] = str(random.choice(opts))
            
        requests.post(f"{BASE_URL}/responses/{assessment_id}", json=ans)
        
    print(f"Perguntas respondidas para {profile['name']}.")
    
    # 4. Trigger IA
    payload = {
        "nome": profile["name"],
        "cargo": profile["cargo"],
        "area": "Geral",
        "empresa": profile["empresa"],
        "consultor": "Sistema Antigravity"
    }
    r = requests.post(f"{BASE_URL}/reports/{assessment_id}/generate-ai", json=payload)
    if r.status_code == 200:
        job_id = r.json().get("job_id")
        return {"profile": profile, "job_id": job_id, "status": "PENDING"}
    else:
        print(f"Erro IA {profile['name']}: {r.text}")
        return None

def run_batch():
    jobs = []
    # Dispara todos em paralelo
    for p in PROFILES:
        job = simulate_profile(p)
        if job:
            jobs.append(job)
            
    print("\n=== Todos os Jobs de IA Iniciados ===")
    
    # Polling de todos os jobs
    completed = []
    while len(completed) < len(jobs):
        print("Aguardando 15s para checar status...")
        time.sleep(15)
        
        for job in jobs:
            if job["job_id"] in completed: continue
            
            status_req = requests.get(f"{BASE_URL}/reports/status/{job['job_id']}")
            if status_req.status_code == 200:
                job_data = status_req.json()
                st = job_data.get("status")
                
                if st == "COMPLETED":
                    print(f"[{job['profile']['name']}] IA Concluida! Gerando PDF...")
                    pdf_req = requests.post(f"{BASE_URL}/reports/generate-pdf/{job['job_id']}", json=job_data.get("results"))
                    if pdf_req.status_code == 200:
                        pdf_url = pdf_req.json().get("pdf_url")
                        print(f"[{job['profile']['name']}] PDF Gerado: {pdf_url}")
                    else:
                        print(f"[{job['profile']['name']}] ERRO ao gerar PDF: {pdf_req.text}")
                    completed.append(job["job_id"])
                elif st == "ERROR":
                    print(f"[{job['profile']['name']}] ERRO na IA: {job_data.get('error')}")
                    completed.append(job["job_id"])
                    
    print("\n=== Batch Simulation Finalizada ===")

if __name__ == '__main__':
    run_batch()
