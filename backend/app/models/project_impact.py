from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectImpact(Base):
    __tablename__ = "project_impact"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        unique=True,
    )

    people_benefited: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    villages_covered: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    districts_covered: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    cost_savings: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    environmental_impact: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    outcome: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    deployment_status: Mapped[str] = mapped_column(
        String(30),
        default="NOT_DEPLOYED",
        nullable=False,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    project = relationship("Project")