from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class HEI(Base):
    __tablename__ = "heis"

    # unique ID for every university/college
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # basic HEI information
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    code: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # location information
    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        default="Jharkhand",
        nullable=False,
    )

    # basic infrastructure information
    infrastructure: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
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

    # an HEI can have multiple departments
    departments = relationship(
        "HEIDepartment",
        back_populates="hei",
    )

    # an HEI can have multiple users
    # like admins, faculty and students
    users = relationship(
        "User",
        back_populates="hei",
    )