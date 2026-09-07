from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ChallengeHEIMatch(Base):
    __tablename__ = "challenge_hei_matches"

    # unique ID for every match
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # which challenge this match is for
    challenge_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
    )

    # which HEI was matched
    hei_id: Mapped[int] = mapped_column(
        ForeignKey("heis.id"),
        nullable=False,
    )

    # final matching score from 0-100
    match_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # explain why this HEI was recommended
    match_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # useful later for ranking/filtering recommendations
    rank: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    # lets us access the challenge from a match
    challenge = relationship("Challenge")

    # lets us access the HEI from a match
    hei = relationship("HEI")