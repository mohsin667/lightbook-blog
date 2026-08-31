import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field

class PostType(str, Enum):
    draft: str = "draft"
    published: str = "published"

class Post(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title: str
    excerpt: str = ""
    content: str = ""
    author_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id", index=True)
    status: PostType = Field(default=PostType.draft)
    read_time_minutes: int = Field(default=0)
    view_count: int = Field(default=0)
    like_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    cover_image_url: Optional[str] = None

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True)
    slug: str = Field(unique=True, index=True)

class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True)
    slug: str = Field(unique=True, index=True)

class PostTag(SQLModel, table=True):
    post_id: uuid.UUID = Field(foreign_key="post.id", primary_key=True)
    tag_id: uuid.UUID = Field(foreign_key="tag.id", primary_key=True)

class PostLike(SQLModel, table=True):
    post_id: uuid.UUID = Field(foreign_key="post.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)