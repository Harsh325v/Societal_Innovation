from alembic import op
import sqlalchemy as sa


revision = "add_project_deliverables"
down_revision = "update_project_lifecycle"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_deliverables",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("submitted_by", sa.Integer(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),

        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["submitted_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_project_deliverables_id"),
        "project_deliverables",
        ["id"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_project_deliverables_id"),
        table_name="project_deliverables",
    )

    op.drop_table("project_deliverables")