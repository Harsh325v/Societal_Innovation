from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    # unique ID for every challenge
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # who submitted this challenge
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # basic challenge information
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # location information for Jharkhand-based challenges
    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    block: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    locality: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    # coordinates are optional for now
    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # we'll fill these using our AI later
    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    priority_score: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="OPEN",
        nullable=False,
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

    # lets us do challenge.user to get the person who submitted it
    user = relationship(
        "User",
        back_populates="challenges",
    )

    # lets us do challenge.ai_analysis
    ai_analysis = relationship(
        "ChallengeAIAnalysis",
        back_populates="challenge",
        uselist=False,
    )