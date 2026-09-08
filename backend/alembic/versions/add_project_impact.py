from alembic import op
import sqlalchemy as sa


revision = "add_project_impact"
down_revision = "update_project_lifecycle"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_impact",
        sa.Column("id", sa.Integer(), primary_key=True),
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
            server_default="0",
        ),
        sa.Column(
            "villages_covered",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "districts_covered",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "cost_savings",
            sa.Integer(),
            nullable=False,
            server_default="0",
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
            sa.String(length=30),
            nullable=False,
            server_default="NOT_DEPLOYED",
        ),
        sa.Column(
            "recorded_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_project_impact_id",
        "project_impact",
        ["id"],
    )


def downgrade():
    op.drop_index(
        "ix_project_impact_id",
        table_name="project_impact",
    )
    op.drop_table("project_impact")