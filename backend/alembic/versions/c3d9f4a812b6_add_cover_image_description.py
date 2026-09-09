"""add cover_image_description column to post

Revision ID: c3d9f4a812b6
Revises: a1b7e5f930c2
Create Date: 2026-09-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c3d9f4a812b6'
down_revision: Union[str, Sequence[str], None] = 'a1b7e5f930c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('post', sa.Column('cover_image_description', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('post', 'cover_image_description')
