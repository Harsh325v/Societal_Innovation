from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # the proposal that created this project
    proposal_id: Mapped[int] = mapped_column(
        ForeignKey("project_proposals.id"),
        nullable=False,
        unique=True,
    )

    # the original challenge
    challenge_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
    )

    # the HEI running the project
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

    status: Mapped[str] = mapped_column(
        String(30),
        default="ACTIVE",
        nullable=False,
    )

    start_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime,
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

    # lets us access the proposal, challenge and HEI
    proposal = relationship("ProjectProposal")
    challenge = relationship("Challenge")
    hei = relationship("HEI")