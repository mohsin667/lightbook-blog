import uuid
from datetime import datetime, timezone
from fastapi import Depends, Cookie, HTTPException
from app.models.user import User
from app.core.security import decode_token
from app.core.db import get_session
from sqlmodel import Session, select
from app.models.post import Post, PostType, Category, Tag, PostTag
import re, secrets, math

def get_current_user(access_token: str = Cookie(None),session: Session = Depends(get_session)) -> User: 
    if not access_token: 
        raise HTTPException(status_code=401, detail="Not Authenticated")
    payload = decode_token(access_token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="invalid or expired token")
    user = session.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not Found")
    return user
    

def generate_slug(title: str, session: Session) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') or "post"
    base = base[:60]

    slug = base
    while session.exec(select(Post).where(Post.slug == slug)).first():
        suffix = secrets.token_hex(2)
        slug = f"{base}-{suffix}"

    return slug

def generate_username(display_name: str, session: Session) -> str:
    base = re.sub(r'[^a-z0-9]+', '', display_name.lower()) or "user"
    base = base[:20]

    username = base
    while session.exec(select(User).where(User.username == username)).first():
        suffix = secrets.token_hex(2)  # e.g. "a1b2"
        username = f"{base}{suffix}"

    return username

def get_current_user_optional(access_token: str = Cookie(None), session: Session = Depends(get_session)) -> User | None:
    if not access_token:
        return None
    payload = decode_token(access_token)
    if not payload or payload.get("type") != "access":
        return None
    return session.get(User, payload["sub"])

def get_owned_post(post_id: uuid.UUID, current_user: User, session: Session) -> Post:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    is_owner = post.author_id == current_user.id
    is_admin = current_user.role == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Not your post")

    return post

def apply_publish(post: Post) -> None:
    word_count = len(post.content.split())
    post.status = PostType.published
    post.read_time_minutes = max(1, math.ceil(word_count / 200))
    if post.published_at is None:
        post.published_at = datetime.now(timezone.utc)

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

def generate_category_slug(name: str, session: Session) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or "category"
    base = base[:60]

    slug = base
    while session.exec(select(Category).where(Category.slug == slug)).first():
        suffix = secrets.token_hex(2)
        slug = f"{base}-{suffix}"

    return slug

def generate_tag_slug(name: str, session: Session) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or "tag"
    base = base[:60]

    slug = base
    while session.exec(select(Tag).where(Tag.slug == slug)).first():
        suffix = secrets.token_hex(2)
        slug = f"{base}-{suffix}"

    return slug

def get_or_create_tags(names: list[str], session: Session) -> list[Tag]:
    tags: list[Tag] = []
    for raw_name in names:
        name = raw_name.strip()
        if not name:
            continue
        tag = session.exec(select(Tag).where(Tag.name == name)).first()
        if not tag:
            tag = Tag(name=name, slug=generate_tag_slug(name, session))
            session.add(tag)
            session.commit()
            session.refresh(tag)
        tags.append(tag)
    return tags

def sync_post_tags(post: Post, tags: list[Tag], session: Session) -> None:
    existing_links = session.exec(select(PostTag).where(PostTag.post_id == post.id)).all()
    for link in existing_links:
        session.delete(link)
    for tag in tags:
        session.add(PostTag(post_id=post.id, tag_id=tag.id))
    session.commit()

def get_post_tags(post_id: uuid.UUID, session: Session) -> list[Tag]:
    statement = select(Tag).join(PostTag, PostTag.tag_id == Tag.id).where(PostTag.post_id == post_id)
    return session.exec(statement).all()

def serialize_post(post: Post, session: Session) -> dict:
    tags = get_post_tags(post.id, session)
    data = post.model_dump()
    data["tags"] = [{"id": t.id, "name": t.name, "slug": t.slug} for t in tags]
    return data