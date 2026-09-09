"""add multilingual challenge fields

Revision ID: c47aec1491fa
Revises: b88107ae027d
Create Date: 2026-09-09 04:39:25.111118

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c47aec1491fa"
down_revision: Union[str, Sequence[str], None] = "b88107ae027d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add multilingual fields to challenges."""
    op.add_column(
        "challenges",
        sa.Column(
            "source_language",
            sa.String(length=10),
            nullable=False,
            server_default="en",
        ),
    )

    op.add_column(
        "challenges",
        sa.Column(
            "title_en",
            sa.String(length=200),
            nullable=True,
        ),
    )

    op.add_column(
        "challenges",
        sa.Column(
            "title_hi",
            sa.String(length=200),
            nullable=True,
        ),
    )

    op.add_column(
        "challenges",
        sa.Column(
            "description_en",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "challenges",
        sa.Column(
            "description_hi",
            sa.Text(),
            nullable=True,
        ),
    )

    # Remove the default after existing rows have been populated.
    op.alter_column(
        "challenges",
        "source_language",
        server_default=None,
    )


def downgrade() -> None:
    """Remove multilingual fields from challenges."""
    op.drop_column("challenges", "description_hi")
    op.drop_column("challenges", "description_en")
    op.drop_column("challenges", "title_hi")
    op.drop_column("challenges", "title_en")
    op.drop_column("challenges", "source_language")