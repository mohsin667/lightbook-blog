import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str