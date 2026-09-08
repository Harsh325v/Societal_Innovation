from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ScientistReview(Base):
    __tablename__ = "scientist_reviews"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Problem being reviewed
    challenge_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
    )

    # Scientist who reviewed the problem
    scientist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # Scientist's findings
    observation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Recommended action
    recommendation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # How confident the scientist is
    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # Optional scientific domain
    expertise_area: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    challenge = relationship(
        "Challenge",
    )

    scientist = relationship(
        "User",
    )