"""add pgvector extension and embedding/content_hash columns to post

Revision ID: 8f3c2a91d4e7
Revises: 5157e206defb
Create Date: 2026-09-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '8f3c2a91d4e7'
down_revision: Union[str, Sequence[str], None] = '5157e206defb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Requires superuser (or a role with CREATE privilege) on the database —
    # if this fails with a permissions error, run
    # `CREATE EXTENSION vector;` manually as a superuser first.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column('post', sa.Column('content_hash', sa.String(), nullable=True))
    op.create_index(op.f('ix_post_content_hash'), 'post', ['content_hash'], unique=False)
    op.add_column('post', sa.Column('embedding', Vector(1024), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('post', 'embedding')
    op.drop_index(op.f('ix_post_content_hash'), table_name='post')
    op.drop_column('post', 'content_hash')
    # Not dropping the vector extension on downgrade — other tables/migrations
    # created after this one may depend on it still being present.
