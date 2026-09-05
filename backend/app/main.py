import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, Response, Cookie, Query
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserLogin
from app.schemas.upload import PresignRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.db import get_session
from app.core.s3 import s3_client
from app.deps import (
    get_current_user, generate_slug, generate_username, get_current_user_optional,
    get_owned_post, apply_publish, require_admin, generate_category_slug,
    get_or_create_tags, sync_post_tags, serialize_post,
)
from app.schemas.post import PostPublic, PostCreate, PostUpdate, CategoryCreate, CategoryPublic, TagPublic
from app.models.post import Post, PostType, Category, Tag, PostTag, PostLike
import math


app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allow specified origins
    allow_credentials=True,          # Support cookies and auth headers
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all request headers
)

@app.post("/api/auth/register", response_model=UserPublic, status_code=201)
def register_user(data: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(
        select(User).where(
            (User.username == data.username) | (User.email == data.email)
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Username or email already taken")

    username = generate_username(data.display_name, session)
    user = User(
        username=username,
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.post("/api/auth/login")
def login_user(data: UserLogin, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid_credentials")

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )

    return {"message": "Login successful"}

@app.get("/api/auth/me", response_model=UserPublic)
def read_current_user(response: Response,current_user: User = Depends(get_current_user)):
    response.headers["Cache-Control"] = "no-store"
    return current_user

@app.post("/api/auth/logout")
def logout_user(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@app.post("/api/posts", response_model=PostPublic, status_code=201)
def create_post(data: PostCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    post = Post(
    slug=generate_slug(data.title, session),
    title=data.title,
    excerpt=data.excerpt,
    content=data.content,
    author_id=current_user.id,
    category_id=data.category_id,
    read_time_minutes=0,
    view_count=0,
    created_at=now,
    updated_at=now,
    published_at=None,
    cover_image_url=data.cover_image_url,
)
    if data.publish:
        apply_publish(post)

    session.add(post)
    session.commit()
    session.refresh(post)

    if data.tags:
        tag_objs = get_or_create_tags(data.tags, session)
        sync_post_tags(post, tag_objs, session)

    return serialize_post(post, session)

@app.get("/api/posts/drafts", response_model=list[PostPublic])
def get_draft_posts(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Post).where(
    (Post.status == PostType.draft) & (Post.author_id == current_user.id)).order_by(Post.updated_at.desc())

    posts = session.exec(statement).all()
    return [serialize_post(p, session) for p in posts]

@app.get("/api/posts/{slug}", response_model=PostPublic)
def get_post_by_slug(
    slug: str,
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    post = session.exec(select(Post).where(Post.slug == slug)).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.status == PostType.published:
        post.view_count += 1
        session.add(post)
        session.commit()
        session.refresh(post)
        return serialize_post(post, session)

    is_owner = current_user and post.author_id == current_user.id
    is_admin = current_user and current_user.role == "admin"
    if is_owner or is_admin:
        return serialize_post(post, session)

    raise HTTPException(status_code=404, detail="Post not found")

@app.get("/api/posts", response_model=list[PostPublic])
def get_posts(session: Session = Depends(get_session)):
    statement = select(Post).where(Post.status == PostType.published).order_by(Post.published_at.desc())
    posts = session.exec(statement).all()
    return [serialize_post(p, session) for p in posts]

@app.get("/api/search", response_model=list[PostPublic])
def search_posts(
    q: str = Query(min_length=1),
    session: Session = Depends(get_session),
):
    pattern = f"%{q}%"
    statement = (
        select(Post)
        .where(
            Post.status == PostType.published,
            (Post.title.ilike(pattern)) | (Post.excerpt.ilike(pattern)) | (Post.content.ilike(pattern)),
        )
        .order_by(Post.published_at.desc())
    )
    posts = session.exec(statement).all()
    return [serialize_post(p, session) for p in posts]

@app.get("/api/categories", response_model=list[CategoryPublic])
def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@app.post("/api/categories", response_model=CategoryPublic, status_code=201)
def create_category(
    data: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    existing = session.exec(select(Category).where(Category.name == data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    category = Category(name=data.name, slug=generate_category_slug(data.name, session))
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@app.patch("/api/categories/{category_id}", response_model=CategoryPublic)
def update_category(
    category_id: uuid.UUID,
    data: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.name = data.name
    category.slug = generate_category_slug(data.name, session)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(
    category_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    session.delete(category)
    session.commit()
    return None

@app.get("/api/tags", response_model=list[TagPublic])
def list_tags(session: Session = Depends(get_session)):
    return session.exec(select(Tag)).all()

@app.get("/api/tags/{slug}/posts", response_model=list[PostPublic])
def get_posts_by_tag(slug: str, session: Session = Depends(get_session)):
    tag = session.exec(select(Tag).where(Tag.slug == slug)).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    statement = (
        select(Post)
        .join(PostTag, PostTag.post_id == Post.id)
        .where(PostTag.tag_id == tag.id, Post.status == PostType.published)
        .order_by(Post.published_at.desc())
    )
    posts = session.exec(statement).all()
    return [serialize_post(p, session) for p in posts]

@app.patch("/api/posts/{post_id}", response_model=PostPublic)
def update_post(
    post_id: uuid.UUID,
    data: PostUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    post = get_owned_post(post_id, current_user, session)

    updates = data.model_dump(exclude_unset=True)
    tag_names = updates.pop("tags", None)
    for field, value in updates.items():
        setattr(post, field, value)

    post.updated_at = datetime.now(timezone.utc)

    session.add(post)
    session.commit()
    session.refresh(post)

    if tag_names is not None:
        tag_objs = get_or_create_tags(tag_names, session)
        sync_post_tags(post, tag_objs, session)

    return serialize_post(post, session)

@app.post("/api/posts/{post_id}/publish", response_model=PostPublic)
def publish_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    post = get_owned_post(post_id, current_user, session)
    apply_publish(post)
    post.updated_at = datetime.now(timezone.utc)

    session.add(post)
    session.commit()
    session.refresh(post)
    return serialize_post(post, session)

@app.delete("/api/posts/{post_id}", status_code=204)
def delete_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    post = get_owned_post(post_id, current_user, session)

    links = session.exec(select(PostTag).where(PostTag.post_id == post.id)).all()
    for link in links:
        session.delete(link)
    session.flush()  # force the post_tag deletes to hit the DB before we delete the post

    session.delete(post)
    session.commit()
    return None

@app.post("/api/posts/{post_id}/like")
def like_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    post = session.get(Post, post_id)
    if not post or post.status != PostType.published:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = session.get(PostLike, {"post_id": post_id, "user_id": current_user.id})
    if existing:
        return {"liked": True, "like_count": post.like_count}

    session.add(PostLike(post_id=post_id, user_id=current_user.id))
    post.like_count += 1
    session.add(post)
    session.commit()
    session.refresh(post)
    return {"liked": True, "like_count": post.like_count}

@app.delete("/api/posts/{post_id}/like")
def unlike_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = session.get(PostLike, {"post_id": post_id, "user_id": current_user.id})
    if not existing:
        return {"liked": False, "like_count": post.like_count}

    session.delete(existing)
    session.flush()
    post.like_count = max(0, post.like_count - 1)
    session.add(post)
    session.commit()
    session.refresh(post)
    return {"liked": False, "like_count": post.like_count}

@app.post('/api/auth/refresh')
def refresh_access_token(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access_token = create_access_token(subject=payload["sub"])

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60,
    )

    return {"message": "Token refreshed"}

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

@app.post("/api/uploads/presign")
def presign_upload(
    data: PresignRequest, current_user: User = Depends(get_current_user),
):
    if data.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    extension = data.filename.rsplit(".", 1)[-1] if "." in data.filename else "bin"
    key = f"posts/{uuid.uuid4()}.{extension}"

    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket_name,
            "Key": key,
            "ContentType": data.content_type,
        },
        ExpiresIn=300,
    )

    file_url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{key}"

    return {"upload_url": upload_url, "file_url": file_url}

@app.get("/api/users", response_model=list[UserPublic])
def list_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()
