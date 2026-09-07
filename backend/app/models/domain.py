from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Domain(Base):
    __tablename__ = "domains"

    # unique ID for every domain
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # example: Agriculture, Healthcare, Education
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    # HEIs can have expertise in multiple domains
    hei_expertise = relationship(
        "HEIExpertise",
        back_populates="domain",
    )