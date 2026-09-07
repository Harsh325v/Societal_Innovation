from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ChallengeAIAnalysis(Base):
    __tablename__ = "challenge_ai_analysis"

    # unique ID for this AI analysis
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # challenge this analysis belongs to
    challenge_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
        unique=True,
    )

    # AI predicted category
    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # how confident the classifier is
    category_confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # calculated priority score
    priority_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # whether a similar challenge was found
    is_duplicate: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # similarity score with the closest challenge
    duplicate_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # ID of the closest matching challenge
    duplicate_challenge_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    # lets us do challenge.ai_analysis later
    challenge = relationship(
        "Challenge",
        back_populates="ai_analysis",
    )