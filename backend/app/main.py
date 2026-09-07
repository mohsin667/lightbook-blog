import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, Response, Cookie, Query
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.user import User, Follow
from app.schemas.user import (
    UserCreate, UserPublic, UserLogin, UserUpdate, UserSummary, TopAuthorPublic,
)
from app.schemas.upload import PresignRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.db import get_session
from app.core.s3 import s3_client
from app.deps import (
    get_current_user, generate_slug, generate_username, get_current_user_optional,
    get_owned_post, apply_publish, require_admin, generate_category_slug,
    get_or_create_tags, sync_post_tags, serialize_post, serialize_posts,
    serialize_user_summary, serialize_comment,
)
from app.schemas.post import (
    PostPublic, PostCreate, PostUpdate, CategoryCreate, CategoryPublic, TagPublic,
    CommentCreate, CommentPublic, PostReportCreate, ReportedPostPublic,
)
from app.models.post import (
    Post, PostType, Category, Tag, PostTag, PostLike, Bookmark, Comment, PostReport,
)
from sqlmodel import func
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

    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been restricted")

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

    return serialize_post(post, session, current_user)

@app.get("/api/posts/drafts", response_model=list[PostPublic])
def get_draft_posts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(Post)
        .where((Post.status == PostType.draft) & (Post.author_id == current_user.id))
        .order_by(Post.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )

    posts = session.exec(statement).all()
    return serialize_posts(posts, session, current_user)

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
        return serialize_post(post, session, current_user)

    is_owner = current_user and post.author_id == current_user.id
    is_admin = current_user and current_user.role == "admin"
    if is_owner or is_admin:
        return serialize_post(post, session, current_user)

    raise HTTPException(status_code=404, detail="Post not found")

@app.get("/api/posts", response_model=list[PostPublic])
def get_posts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    statement = (
        select(Post)
        .where(Post.status == PostType.published)
        .order_by(Post.published_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = session.exec(statement).all()
    return serialize_posts(posts, session, current_user)

@app.get("/api/search", response_model=list[PostPublic])
def search_posts(
    q: str = Query(min_length=1),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    pattern = f"%{q}%"
    statement = (
        select(Post)
        .where(
            Post.status == PostType.published,
            (Post.title.ilike(pattern)) | (Post.excerpt.ilike(pattern)) | (Post.content.ilike(pattern)),
        )
        .order_by(Post.published_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = session.exec(statement).all()
    return serialize_posts(posts, session, current_user)

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
def get_posts_by_tag(
    slug: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    tag = session.exec(select(Tag).where(Tag.slug == slug)).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    statement = (
        select(Post)
        .join(PostTag, PostTag.post_id == Post.id)
        .where(PostTag.tag_id == tag.id, Post.status == PostType.published)
        .order_by(Post.published_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = session.exec(statement).all()
    return serialize_posts(posts, session, current_user)

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

    return serialize_post(post, session, current_user)

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
    return serialize_post(post, session, current_user)

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

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.patch("/api/auth/me", response_model=UserPublic)
def update_current_user(
    data: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(current_user, field, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@app.get("/api/users", response_model=list[UserSummary])
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Public user directory. Returns UserSummary, which deliberately omits email."""
    users = session.exec(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)).all()
    return [serialize_user_summary(u, session, current_user) for u in users]

@app.get("/api/admin/users", response_model=list[UserPublic])
def admin_list_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Full user records, including email and ban status. Admin only."""
    return session.exec(select(User).order_by(User.created_at.desc())).all()

@app.get("/api/users/{user_id}", response_model=UserSummary)
def get_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user_summary(user, session, current_user)

@app.get("/api/authors/top", response_model=list[TopAuthorPublic])
def get_top_authors(session: Session = Depends(get_session)):
    """The five authors whose published posts have accumulated the most likes."""
    statement = (
        select(User, func.sum(Post.like_count).label("total_likes"))
        .join(Post, Post.author_id == User.id)
        .where(Post.status == PostType.published)
        .group_by(User.id)
        .order_by(func.sum(Post.like_count).desc())
        .limit(5)
    )
    results = session.exec(statement).all()
    return [
        TopAuthorPublic(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            total_likes=total or 0,
        )
        for user, total in results
    ]

@app.patch("/api/users/{user_id}/ban", response_model=UserPublic)
def set_user_ban(
    user_id: uuid.UUID,
    banned: bool = Query(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself")

    user.is_banned = banned
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete yourself")

    # Clear everything that references this user before removing the row itself.
    post_ids = session.exec(select(Post.id).where(Post.author_id == user.id)).all()
    for post_id in post_ids:
        for model, column in (
            (PostTag, PostTag.post_id), (PostLike, PostLike.post_id),
            (Bookmark, Bookmark.post_id), (Comment, Comment.post_id),
            (PostReport, PostReport.post_id),
        ):
            for row in session.exec(select(model).where(column == post_id)).all():
                session.delete(row)

    for model, column in (
        (PostLike, PostLike.user_id), (Bookmark, Bookmark.user_id),
        (Comment, Comment.author_id), (PostReport, PostReport.reporter_id),
    ):
        for row in session.exec(select(model).where(column == user.id)).all():
            session.delete(row)

    for row in session.exec(
        select(Follow).where(
            (Follow.follower_id == user.id) | (Follow.followed_id == user.id))).all():
        session.delete(row)

    session.flush()

    for post in session.exec(select(Post).where(Post.author_id == user.id)).all():
        session.delete(post)
    session.flush()

    session.delete(user)
    session.commit()
    return None

# ---------------------------------------------------------------------------
# Follow / unfollow
# ---------------------------------------------------------------------------

@app.post("/api/users/{user_id}/follow")
def follow_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    target = session.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = session.get(
        Follow, {"follower_id": current_user.id, "followed_id": user_id})
    if not existing:
        session.add(Follow(follower_id=current_user.id, followed_id=user_id))
        session.commit()

    followers = session.exec(
        select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)).one()
    return {"following": True, "follower_count": followers}

@app.delete("/api/users/{user_id}/follow")
def unfollow_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    existing = session.get(
        Follow, {"follower_id": current_user.id, "followed_id": user_id})
    if existing:
        session.delete(existing)
        session.commit()

    followers = session.exec(
        select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)).one()
    return {"following": False, "follower_count": followers}

# ---------------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------------

@app.post("/api/posts/{post_id}/comments", response_model=CommentPublic, status_code=201)
def create_comment(
    post_id: uuid.UUID,
    data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post or post.status != PostType.published:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=data.content.strip(),
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return serialize_comment(comment, session)

@app.get("/api/posts/{post_id}/comments", response_model=list[CommentPublic])
def list_comments(
    post_id: uuid.UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session),
):
    statement = (
        select(Comment)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    comments = session.exec(statement).all()
    return [serialize_comment(c, session) for c in comments]

@app.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    is_author = comment.author_id == current_user.id
    is_admin = current_user.role == "admin"
    if not (is_author or is_admin):
        raise HTTPException(status_code=403, detail="Not your comment")

    session.delete(comment)
    session.commit()
    return None

# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

@app.post("/api/posts/{post_id}/bookmark")
def bookmark_post(
    post_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post or post.status != PostType.published:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = session.get(Bookmark, {"user_id": current_user.id, "post_id": post_id})
    if not existing:
        session.add(Bookmark(user_id=current_user.id, post_id=post_id))
        session.commit()

    return {"bookmarked": True}

@app.delete("/api/posts/{post_id}/bookmark")
def remove_bookmark(
    post_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    existing = session.get(Bookmark, {"user_id": current_user.id, "post_id": post_id})
    if existing:
        session.delete(existing)
        session.commit()

    return {"bookmarked": False}

@app.get("/api/users/me/bookmarks", response_model=list[PostPublic])
def list_my_bookmarks(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = session.exec(statement).all()
    return serialize_posts(posts, session, current_user)

# ---------------------------------------------------------------------------
# Moderation
# ---------------------------------------------------------------------------

@app.post("/api/posts/{post_id}/report", status_code=201)
def report_post(
    post_id: uuid.UUID,
    data: PostReportCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = session.exec(
        select(PostReport).where(
            PostReport.post_id == post_id,
            PostReport.reporter_id == current_user.id,
        )
    ).first()
    if existing:
        return {"reported": True}

    session.add(PostReport(
        post_id=post_id, reporter_id=current_user.id, reason=data.reason))
    session.commit()
    return {"reported": True}

@app.get("/api/admin/reports", response_model=list[ReportedPostPublic])
def list_reported_posts(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    statement = (
        select(PostReport.post_id, func.count().label("report_count"))
        .group_by(PostReport.post_id)
        .order_by(func.count().desc())
    )
    rows = session.exec(statement).all()

    reported = []
    for post_id, report_count in rows:
        post = session.get(Post, post_id)
        if post:
            reported.append({
                "post": serialize_post(post, session, current_user),
                "report_count": report_count,
            })
    return reported

@app.delete("/api/posts/{post_id}/reports", status_code=204)
def dismiss_post_reports(
    post_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    reports = session.exec(
        select(PostReport).where(PostReport.post_id == post_id)).all()
    for report in reports:
        session.delete(report)
    session.commit()
    return None

@app.post("/api/posts/{post_id}/unpublish", response_model=PostPublic)
def unpublish_post(
    post_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Revert a published post to draft. Owner or admin — the inverse of /publish."""
    post = get_owned_post(post_id, current_user, session)

    post.status = PostType.draft
    post.is_featured = False
    post.updated_at = datetime.now(timezone.utc)

    session.add(post)
    session.commit()
    session.refresh(post)
    return serialize_post(post, session, current_user)

@app.patch("/api/posts/{post_id}/feature", response_model=PostPublic)
def feature_post(
    post_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Make this the single homepage-featured post, clearing any previous one."""
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.status != PostType.published:
        raise HTTPException(status_code=400, detail="Only a published post can be featured")

    for other in session.exec(select(Post).where(Post.is_featured == True)).all():  # noqa: E712
        other.is_featured = False
        session.add(other)

    post.is_featured = True
    session.add(post)
    session.commit()
    session.refresh(post)
    return serialize_post(post, session, current_user)
