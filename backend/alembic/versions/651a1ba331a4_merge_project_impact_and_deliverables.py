"""merge project impact and deliverables

Revision ID: 651a1ba331a4
Revises: add_project_impact, add_project_deliverables
Create Date: 2026-09-08 14:25:24.594085

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '651a1ba331a4'
down_revision: Union[str, Sequence[str], None] = ('add_project_impact', 'add_project_deliverables')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
