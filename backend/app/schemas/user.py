import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str


class UserPublic(BaseModel):
    """The full user record — only ever returned to the user themselves, or to an admin."""
    id: uuid.UUID
    username: str
    email: EmailStr
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    is_banned: bool = False
    created_at: datetime


class UserSummary(BaseModel):
    """The public view of a user. Deliberately omits `email`."""
    id: uuid.UUID
    username: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    created_at: datetime
    follower_count: int = 0
    following_count: int = 0
    followed_by_me: bool = False


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    bio: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = None


class TopAuthorPublic(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    total_likes: int


class UserLogin(BaseModel):
    email: EmailStr
    password: str
