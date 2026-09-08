"""add hnsw index on post.embedding for fast cosine similarity search

Revision ID: a1b7e5f930c2
Revises: 8f3c2a91d4e7
Create Date: 2026-09-08 00:05:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1b7e5f930c2'
down_revision: Union[str, Sequence[str], None] = '8f3c2a91d4e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # vector_cosine_ops matches BGE-M3, which is trained/optimized for
    # cosine similarity. HNSW gives fast approximate nearest-neighbor
    # search without needing a "how many rows do you have" tuning knob
    # the way IVFFlat does.
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_post_embedding_hnsw "
        "ON post USING hnsw (embedding vector_cosine_ops)"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_post_embedding_hnsw")
