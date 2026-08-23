from fastapi import APIRouter, HTTPException, Depends
from models.user import UserCreate, UserResponse
from services.auth_service import AuthService
from services.db_service import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user_data: UserCreate):
    supabase = get_supabase()
    
    # Check if user exists — se já existe, reutiliza (candidato refazendo teste)
    existing = supabase.table("rh_users").select("*").eq("email", user_data.email).execute()
    if existing.data:
        user = existing.data[0]
        access_token = AuthService.create_access_token(data={"sub": user["id"]})
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    
    # Inserir apenas as colunas que EXISTEM na tabela rh_users:
    # id (auto), name (text, NOT NULL), email (text), role (text), created_at (auto)
    data = {
        "name": user_data.full_name,
        "email": user_data.email,
        "role": "Candidato"
    }
    
    try:
        result = supabase.table("rh_users").insert(data).execute()
        if result.data:
            user = result.data[0]
            access_token = AuthService.create_access_token(data={"sub": user["id"]})
            return {"access_token": access_token, "token_type": "bearer", "user": user}
        raise HTTPException(status_code=500, detail="Failed to create user")
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"Supabase Insert Error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"DB Error: {error_msg}")

@router.post("/login")
async def login(user_data: dict):
    supabase = get_supabase()
    email = user_data.get("email")
    password = user_data.get("password")
    
    result = supabase.table("rh_users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    user = result.data[0]
    
    # A tabela rh_users NÃO tem coluna password_hash.
    # Para admin login, usamos uma senha fixa de ambiente ou hardcoded para o protótipo.
    # Para candidatos, o login é feito via register (sem senha).
    if user.get("role") == "admin" or user.get("role") == "Admin":
        # Admin: verifica contra senha fixa do protótipo
        if password != "admin123":
            raise HTTPException(status_code=400, detail="Invalid email or password")
    else:
        # Candidato: qualquer senha aceita (eles não fazem login, usam register)
        pass
        
    access_token = AuthService.create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me")
async def get_me():
    # Placeholder — em produção, extrairia o user_id do JWT
    return {"id": "1e14c8fa-275b-4bed-ad4b-d7184d00fc68", "email": "", "name": "Anônimo (Test)"}
