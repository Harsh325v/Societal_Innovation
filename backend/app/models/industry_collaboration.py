from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class IndustryCollaboration(Base):
    __tablename__ = "industry_collaborations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # project the industry wants to support
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    # industry user/company making the offer
    industry_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # FUNDING, MENTORSHIP, PROTOTYPING, TESTING, PILOT
    support_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # optional amount if the support is funding
    funding_amount: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # PENDING, ACCEPTED, REJECTED
    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
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

    # lets us access the related project
    project = relationship("Project")

    # lets us access the industry user
    industry_user = relationship("User")