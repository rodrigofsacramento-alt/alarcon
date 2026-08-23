import os
from dotenv import load_dotenv
import supabase

# Carrega variáveis de ambiente
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Credenciais Supabase não encontradas no .env")
    exit(1)

client = supabase.create_client(supabase_url, supabase_key)

print("Consultando últimos relatórios salvos em rh_behavioral_reports...")
try:
    # A tabela tem o sufixo rh_behavioral_reports
    response = client.table("rh_behavioral_reports").select("id, user_id, title, pdf_url, created_at").order("created_at", desc=True).limit(3).execute()
    
    reports = response.data
    if reports:
        print("\n=== ÚLTIMOS RELATÓRIOS GERADOS ===")
        for r in reports:
            print(f"ID: {r.get('id')}")
            print(f"User: {r.get('user_id')}")
            print(f"Título: {r.get('title')}")
            print(f"PDF URL: {r.get('pdf_url')}")
            print(f"Criado em: {r.get('created_at')}")
            print("-" * 30)
    else:
        print("Nenhum relatório encontrado ainda. A IA ainda deve estar processando!")
except Exception as e:
    print(f"Erro ao consultar banco: {e}")
