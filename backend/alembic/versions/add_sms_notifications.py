"""add sms notifications

Revision ID: add_sms_notifications
Revises: c47aec1491fa
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa


revision = "add_sms_notifications"
down_revision = "c47aec1491fa"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "sms_notifications",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),

        sa.Column(
            "phone",
            sa.String(length=20),
            nullable=False,
        ),

        sa.Column(
            "message",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "notification_type",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "sent",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_sms_notifications_id",
        "sms_notifications",
        ["id"],
    )


def downgrade():
    op.drop_index(
        "ix_sms_notifications_id",
        table_name="sms_notifications",
    )

    op.drop_table("sms_notifications")