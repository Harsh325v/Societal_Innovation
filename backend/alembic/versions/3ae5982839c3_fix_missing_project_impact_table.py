"""fix missing project impact table

Revision ID: 3ae5982839c3
Revises: 81034a444373
Create Date: 2026-09-08 22:21:32.857114

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3ae5982839c3"
down_revision: Union[str, Sequence[str], None] = "81034a444373"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the missing project_impact table."""

    op.create_table(
        "project_impact",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "project_id",
            sa.Integer(),
            sa.ForeignKey("projects.id"),
            nullable=False,
            unique=True,
        ),

        sa.Column(
            "people_benefited",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "villages_covered",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "districts_covered",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "cost_savings",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "environmental_impact",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "outcome",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "deployment_status",
            sa.String(50),
            nullable=False,
        ),

        sa.Column(
            "recorded_at",
            sa.DateTime(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Remove the project_impact table."""

    op.drop_table("project_impact")