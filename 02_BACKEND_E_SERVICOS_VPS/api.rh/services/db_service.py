import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://ptochsyoyatsydfysacc.supabase.co")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT_SUPABASE_REDIGIDO.7VKER8NpJz5F9l0TOd6AWTg5U8f2IyXfcrIXCE0KwkQ")

_supabase_client: Client = None

class RHTableWrapper:
    def __init__(self, client: Client):
        self._client = client
        
    def table(self, table_name: str):
        if table_name == "users" or table_name == "rh_users":
            return self._client.table("rh_users")
        
        # Remove any existing rh_ prefix just to be safe
        clean_name = table_name.replace("rh_", "")
        
        return self._client.table(f"rh_behavioral_{clean_name}")

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return RHTableWrapper(_supabase_client)
