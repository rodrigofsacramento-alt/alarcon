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

print("Check users:")
try:
    print(supabase.table("users").select("count", count="exact").execute())
except Exception as e:
    print("users erro:", e)
    
print("Check rh_users:")
try:
    print(supabase.table("rh_users").select("count", count="exact").execute())
except Exception as e:
    print("rh_users erro:", e)

print("Check assessments:")
try:
    print(supabase.table("assessments").select("count", count="exact").execute())
except Exception as e:
    print("assessments erro:", e)
    
print("Check rh_assessments:")
try:
    print(supabase.table("rh_assessments").select("count", count="exact").execute())
except Exception as e:
    print("rh_assessments erro:", e)

print("Check responses:")
try:
    print(supabase.table("responses").select("count", count="exact").execute())
except Exception as e:
    print("responses erro:", e)
    
print("Check rh_responses:")
try:
    print(supabase.table("rh_responses").select("count", count="exact").execute())
except Exception as e:
    print("rh_responses erro:", e)
