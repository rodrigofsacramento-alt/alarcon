from fastapi import APIRouter, HTTPException, Depends
from models.user import UserCreate, UserResponse
from services.auth_service import AuthService
from services.db_service import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    supabase = get_supabase()
    
    # Check if user exists
    existing = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = AuthService.hash_password(user_data.password)
    
    data = {
        "email": user_data.email,
        "password_hash": hashed_password,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "company": user_data.company,
        "department": user_data.department
    }
    
    result = supabase.table("users").insert(data).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=500, detail="Failed to create user")

@router.post("/login")
async def login(user_data: dict): # Expecting {"email": "...", "password": "..."}
    supabase = get_supabase()
    email = user_data.get("email")
    password = user_data.get("password")
    
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    user = result.data[0]
    if not AuthService.verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    access_token = AuthService.create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": user}
