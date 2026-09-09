"""
One-time script to generate cover image captions (via a Cloudflare Workers AI
vision model) for existing posts that have a cover image but no caption yet —
mainly posts published before image captioning was added, plus the seeded
DSA posts inserted directly via SQL.

After captioning, also re-syncs each post's embedding via sync_post_embedding
so the new caption text is folded into what chat/semantic-search can match
on. Safe to re-run any time — posts that already have a caption are skipped.

Usage (from the backend/ directory, with the venv activated):
    python backfill_image_captions.py
"""
import time

from sqlmodel import Session, select

from app.core.db import engine
from app.core.image_caption import caption_image
from app.deps import sync_post_embedding
from app.models.user import User  # noqa: F401 — must be imported so SQLAlchemy can
                                    # resolve Post.author_id's foreign key to user.id
from app.models.post import Post, PostType, Category  # noqa: F401 — Category needed for
                                                         # sync_post_embedding's FK lookup

# Small delay between calls — each post costs one image fetch + one vision
# model call, comfortably slower than the plain text embedding backfill, so
# this is a bit more generous to stay within Cloudflare's free-tier limits.
DELAY_SECONDS = 0.5


def main() -> None:
    with Session(engine) as session:
        posts = session.exec(
            select(Post).where(
                Post.status == PostType.published,
                Post.cover_image_url.is_not(None),
                Post.cover_image_description.is_(None),
            )
        ).all()

        print(f"{len(posts)} published posts have a cover image but no caption yet.\n")

        captioned = 0
        failed = 0

        for i, post in enumerate(posts, start=1):
            description = caption_image(post.cover_image_url)
            if description is None:
                failed += 1
                print(f"[{i}/{len(posts)}] FAILED: {post.title!r}")
                time.sleep(DELAY_SECONDS)
                continue

            post.cover_image_description = description
            session.add(post)
            session.commit()
            session.refresh(post)
            sync_post_embedding(post, session)
            captioned += 1
            print(f"[{i}/{len(posts)}] captioned: {post.title!r} -> {description!r}")
            time.sleep(DELAY_SECONDS)

        print(f"\nDone. Captioned {captioned}, failed {failed}.")
        if failed:
            print("Failed posts were left with no caption, so re-running this script will retry them.")


if __name__ == "__main__":
    main()
