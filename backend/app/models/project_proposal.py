from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectProposal(Base):
    __tablename__ = "project_proposals"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # the challenge this proposal is responding to
    challenge_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
    )

    # the HEI submitting the proposal
    hei_id: Mapped[int] = mapped_column(
        ForeignKey("heis.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    proposed_solution: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="SUBMITTED",
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

    # lets us access the challenge and HEI from the proposal
    challenge = relationship("Challenge")
    hei = relationship("HEI")