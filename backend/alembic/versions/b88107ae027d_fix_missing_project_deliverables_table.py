"""fix missing project deliverables table

Revision ID: b88107ae027d
Revises: 3ae5982839c3
Create Date: 2026-09-08 22:41:01.011882

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b88107ae027d"
down_revision: Union[str, Sequence[str], None] = "3ae5982839c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the missing project_deliverables table."""

    op.create_table(
        "project_deliverables",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "project_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "title",
            sa.String(length=200),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="PENDING",
        ),

        sa.Column(
            "submitted_by",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "submitted_at",
            sa.DateTime(),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),

        sa.ForeignKeyConstraint(
            ["submitted_by"],
            ["users.id"],
        ),

    )

    op.create_index(
        op.f("ix_project_deliverables_id"),
        "project_deliverables",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the project_deliverables table."""

    op.drop_index(
        op.f("ix_project_deliverables_id"),
        table_name="project_deliverables",
    )

    op.drop_table("project_deliverables")