import os
import sys
from dotenv import load_dotenv
from supabase import create_client

backend_dir = r"e:\RECOURSES_APEX_BACKUP\app\backend"
sys.path.append(backend_dir)
load_dotenv(os.path.join(backend_dir, ".env"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

print("Diagnosticando inserção no Supabase...")

try:
    # Tenta buscar um usuário existente para usar o ID
    users = supabase.table("rh_users").select("id").limit(1).execute()
    if not users.data:
        print("Nenhum usuário em rh_users.")
        sys.exit(1)
        
    user_id = users.data[0]["id"]
    print(f"Usando user_id: {user_id}")
    
    # Tenta inserir em rh_assessments
    data = {
        "user_id": user_id,
        "assessment_type": "INTEGRATED",
        "status": "INITIATED"
    }
    result = supabase.table("rh_assessments").insert(data).execute()
    print("Inserção em rh_assessments FUNCIONOU!")
    print(result.data)
except Exception as e:
    print(f"ERRO DE INSERÇÃO EM rh_assessments:\n{e}")
