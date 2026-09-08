"""add project tasks

Revision ID: add_project_tasks
Revises: <PUT_PREVIOUS_REVISION_HERE>
"""

from alembic import op
import sqlalchemy as sa


# migration identifiers
revision = "add_project_tasks"
down_revision = "3bccd21c0db7"
branch_labels = None
depends_on = None


def upgrade():
    # create the project_tasks table
    op.create_table(
        "project_tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "project_id",
            sa.Integer(),
            sa.ForeignKey("projects.id"),
            nullable=False,
        ),
        sa.Column(
            "assigned_to",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # indexes make project/task lookups faster
    op.create_index(
        "ix_project_tasks_id",
        "project_tasks",
        ["id"],
    )

    op.create_index(
        "ix_project_tasks_project_id",
        "project_tasks",
        ["project_id"],
    )


def downgrade():
    # remove indexes first, then the table
    op.drop_index(
        "ix_project_tasks_project_id",
        table_name="project_tasks",
    )

    op.drop_index(
        "ix_project_tasks_id",
        table_name="project_tasks",
    )

    op.drop_table("project_tasks")