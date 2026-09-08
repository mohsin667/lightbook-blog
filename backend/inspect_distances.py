"""
Diagnostic script — prints the actual cosine distance between a query and
the nearest posts, so we can pick a real SEMANTIC_DISTANCE_THRESHOLD value
based on evidence instead of guessing.

Usage (from the backend/ directory, with the venv activated):
    python inspect_distances.py "Modern fashion"
"""
import sys

from sqlmodel import Session, select

from app.core.db import engine
from app.core.embeddings import embed_text
from app.models.user import User  # noqa: F401 — needed to resolve Post's FK
from app.models.post import Post, PostType


def main() -> None:
    query = sys.argv[1] if len(sys.argv) > 1 else "Modern fashion"
    print(f"Query: {query!r}\n")

    vector = embed_text(query)
    if vector is None:
        print("Embedding the query failed — check Cloudflare credentials/logs.")
        return

    with Session(engine) as session:
        distance = Post.embedding.cosine_distance(vector)
        statement = (
            select(Post.title, Post.category_id, distance.label("distance"))
            .where(Post.status == PostType.published, Post.embedding.is_not(None))
            .order_by(distance)
            .limit(15)
        )
        rows = session.exec(statement).all()

    print(f"{'distance':>10}  title")
    for title, _category_id, dist in rows:
        print(f"{dist:>10.4f}  {title}")


if __name__ == "__main__":
    main()
