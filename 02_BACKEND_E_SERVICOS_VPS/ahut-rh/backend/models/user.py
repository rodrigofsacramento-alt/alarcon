from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: Optional[str] = None  # Senha é opcional — rh_users não tem coluna password_hash

class UserResponse(BaseModel):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
