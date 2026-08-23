import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Usar as variáveis corretas do .env (sem prefixo VITE_)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ptochsyoyatsydfysacc.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT_SUPABASE_REDIGIDO.7VKER8NpJz5F9l0TOd6AWTg5U8f2IyXfcrIXCE0KwkQ")

_supabase_client: Client = None

class RHTableWrapper:
    """
    Camada de tradução de nomes de tabelas.
    O código usa nomes genéricos, este wrapper traduz para os nomes reais no Supabase:
    
        Código              → Tabela Real no Supabase
        ─────────────────────────────────────────────
        "users"             → rh_users
        "assessments"       → rh_behavioral_assessments
        "responses"         → rh_behavioral_responses
        "results"           → rh_behavioral_results
        "questions"         → rh_behavioral_questions
        "reports"           → rh_behavioral_reports
        "rh_behavioral_*"   → rh_behavioral_* (passthrough)
    """
    def __init__(self, client: Client):
        self._client = client
        
    def table(self, table_name: str):
        # Tabela de usuários tem nome especial
        if table_name == "users" or table_name == "rh_users":
            return self._client.table("rh_users")
        
        # Se já tem o prefixo completo, passa direto
        if table_name.startswith("rh_behavioral_"):
            return self._client.table(table_name)
        
        # Remove qualquer prefixo rh_ parcial
        clean_name = table_name.replace("rh_", "")
        
        return self._client.table(f"rh_behavioral_{clean_name}")

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return RHTableWrapper(_supabase_client)
