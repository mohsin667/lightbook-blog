import uuid
from datetime import datetime
from typing import Optional
from app.models.post import PostType
from pydantic import BaseModel, Field

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
    author_name: str
    category_id: Optional[uuid.UUID] = None
    category_name: Optional[str] = None
    status: PostType
    read_time_minutes: int
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    is_featured: bool = False
    liked_by_me: bool = False
    bookmarked_by_me: bool = False
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

class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)

class CommentPublic(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    content: str
    created_at: datetime

class PostReportCreate(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=500)

class ReportedPostPublic(BaseModel):
    post: PostPublic
    report_count: int