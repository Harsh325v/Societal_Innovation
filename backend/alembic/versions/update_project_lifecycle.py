from alembic import op
import sqlalchemy as sa


revision = "update_project_lifecycle"
down_revision = "add_project_tasks"
branch_labels = None
depends_on = None


def upgrade():
    # old projects used ACTIVE, move them into the new lifecycle
    op.execute(
        "UPDATE projects SET status = 'PROPOSAL' WHERE status = 'ACTIVE'"
    )

    op.alter_column(
        "projects",
        "status",
        existing_type=sa.String(length=30),
        server_default="PROPOSAL",
        existing_nullable=False,
    )


def downgrade():
    op.execute(
        "UPDATE projects SET status = 'ACTIVE' WHERE status = 'PROPOSAL'"
    )

    op.alter_column(
        "projects",
        "status",
        existing_type=sa.String(length=30),
        server_default="ACTIVE",
        existing_nullable=False,
    )