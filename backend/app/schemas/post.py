import uuid
from datetime import datetime
from typing import Optional
from app.models.post import PostType
from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    excerpt: str = ""
    content: str = ""
    cover_image_url: Optional[str] = None
    publish: bool = False
    category_id: Optional[uuid.UUID] = None
    tags: list[str] = []

class TagPublic(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

class PostPublic(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    excerpt: str
    content: str
    author_id: uuid.UUID
    category_id: Optional[uuid.UUID] = None
    status: PostType
    read_time_minutes: int
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    tags: list[TagPublic] = []

class PostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None

class CategoryCreate(BaseModel):
    name: str

class CategoryPublic(BaseModel):
    id: uuid.UUID
    name: str
    slug: str