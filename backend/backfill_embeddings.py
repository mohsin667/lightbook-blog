"""
One-time script to backfill embeddings for posts that don't have one yet —
mainly the 202 seeded DSA posts, which were inserted directly via SQL and
never went through the app's create/publish/update routes where
sync_post_embedding normally runs.

Reuses the exact same content_hash()/embed_text() functions the live app
uses, so a post already embedded (matching content hash) is skipped rather
than re-embedded — this script is safe to re-run any time (e.g. after
adding more posts) without wasting Cloudflare calls on posts already done.

Usage (from the backend/ directory, with the venv activated):
    python backfill_embeddings.py
"""
import time

from sqlmodel import Session, select

from app.core.db import engine
from app.core.embeddings import content_hash, embed_text
from app.models.user import User  # noqa: F401 — must be imported so SQLAlchemy can
                                    # resolve Post.author_id's foreign key to user.id
from app.models.post import Post, PostType

# Small delay between calls so we don't burst Cloudflare's free-tier rate
# limits — 202 posts at this pace takes a few minutes, comfortably within
# the daily Neuron budget.
DELAY_SECONDS = 0.3


def main() -> None:
    with Session(engine) as session:
        posts = session.exec(
            select(Post).where(Post.status == PostType.published)
        ).all()

        to_embed = [
            post for post in posts
            if content_hash(post.title, post.content) != post.content_hash
        ]

        print(f"{len(posts)} published posts total, {len(to_embed)} need embedding.\n")

        embedded = 0
        failed = 0

        for i, post in enumerate(to_embed, start=1):
            vector = embed_text(f"{post.title}\n\n{post.content}")
            if vector is None:
                failed += 1
                print(f"[{i}/{len(to_embed)}] FAILED: {post.title!r}")
                time.sleep(DELAY_SECONDS)
                continue

            post.embedding = vector
            post.content_hash = content_hash(post.title, post.content)
            session.add(post)
            session.commit()
            embedded += 1
            print(f"[{i}/{len(to_embed)}] embedded: {post.title!r}")
            time.sleep(DELAY_SECONDS)

        print(
            f"\nDone. Embedded {embedded}, failed {failed}, "
            f"skipped {len(posts) - len(to_embed)} (already up to date)."
        )
        if failed:
            print("Failed posts were left with their old content_hash, so re-running this script will retry them.")


if __name__ == "__main__":
    main()
