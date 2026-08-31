import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    admin: str = "admin"
    user: str = "user"


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = Field(default=UserRole.user)
    is_banned: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
