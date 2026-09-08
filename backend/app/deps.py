import uuid
from datetime import datetime, timezone
from fastapi import Depends, Cookie, HTTPException
from app.models.user import User, Follow
from app.core.security import decode_token
from app.core.db import get_session
from app.core.embeddings import content_hash, embed_text
from sqlmodel import Session, select, func
from app.models.post import Post, PostType, Category, Tag, PostTag, PostLike, Bookmark
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
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been restricted")
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
    user = session.get(User, payload["sub"])
    # A restricted account reads the site as an anonymous visitor.
    return None if (user and user.is_banned) else user

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

def sync_post_embedding(post: Post, session: Session) -> None:
    """Re-embed a post's title+content if it's published and the content
    actually changed since the last embed (content-hash cache). Drafts are
    skipped — no point spending an API call on content nobody can search
    for yet."""
    if post.status != PostType.published:
        return

    new_hash = content_hash(post.title, post.content)
    if new_hash == post.content_hash:
        return 

    vector = embed_text(f"{post.title}\n\n{post.content}")
    if vector is None:
        return  # call failed — leave content_hash as-is so the next save retries

    post.embedding = vector
    post.content_hash = new_hash
    session.add(post)
    session.commit()

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

def serialize_post(
    post: Post,
    session: Session,
    current_user: User | None = None,
    liked_ids: set[uuid.UUID] | None = None,
    bookmarked_ids: set[uuid.UUID] | None = None,
) -> dict:
    tags = get_post_tags(post.id, session)
    author = session.get(User, post.author_id)
    category = session.get(Category, post.category_id) if post.category_id else None
    data = post.model_dump()
    data["tags"] = [{"id": t.id, "name": t.name, "slug": t.slug} for t in tags]
    data["author_name"] = author.display_name if author else "Unknown"
    data["category_name"] = category.name if category else None

    if not current_user:
        data["liked_by_me"] = False
        data["bookmarked_by_me"] = False
        return data

    # `liked_ids`/`bookmarked_ids` are prefetched by serialize_posts for list
    # routes; fall back to a primary-key lookup for the single-post case.
    if liked_ids is not None:
        data["liked_by_me"] = post.id in liked_ids
    else:
        data["liked_by_me"] = session.get(
            PostLike, {"post_id": post.id, "user_id": current_user.id}) is not None

    if bookmarked_ids is not None:
        data["bookmarked_by_me"] = post.id in bookmarked_ids
    else:
        data["bookmarked_by_me"] = session.get(
            Bookmark, {"user_id": current_user.id, "post_id": post.id}) is not None

    return data

def serialize_user_summary(
    user: User, session: Session, current_user: User | None = None
) -> dict:
    followers = session.exec(
        select(func.count()).select_from(Follow).where(Follow.followed_id == user.id)).one()
    following = session.exec(
        select(func.count()).select_from(Follow).where(Follow.follower_id == user.id)).one()
    data = user.model_dump()
    data["follower_count"] = followers
    data["following_count"] = following
    data["followed_by_me"] = bool(current_user) and session.get(
        Follow, {"follower_id": current_user.id, "followed_id": user.id}) is not None
    return data

def serialize_comment(comment, session: Session) -> dict:
    author = session.get(User, comment.author_id)
    data = comment.model_dump()
    data["author_name"] = author.display_name if author else "Unknown"
    return data

def serialize_posts(posts, session: Session, current_user: User | None = None) -> list[dict]:
    """Serialize a list of posts, prefetching the viewer's likes/bookmarks in two queries."""
    if not current_user:
        return [serialize_post(p, session) for p in posts]

    liked_ids = set(session.exec(
        select(PostLike.post_id).where(PostLike.user_id == current_user.id)).all())
    bookmarked_ids = set(session.exec(
        select(Bookmark.post_id).where(Bookmark.user_id == current_user.id)).all())

    return [
        serialize_post(p, session, current_user, liked_ids, bookmarked_ids)
        for p in posts
    ]

