from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    COMMUNITY_ORG = "COMMUNITY_ORG"
    GOVERNMENT = "GOVERNMENT"
    HEI_ADMIN = "HEI_ADMIN"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"
    INDUSTRY_ADMIN = "INDUSTRY_ADMIN"
    MENTOR = "MENTOR"
    SUPER_ADMIN = "SUPER_ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    role: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # university this user belongs to
    # only HEI users will normally have this filled
    hei_id: Mapped[int | None] = mapped_column(
        ForeignKey("heis.id"),
        nullable=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
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

    # all challenges submitted by this user
    challenges = relationship(
        "Challenge",
        back_populates="user",
    )

    # lets us do user.hei to get their university
    hei = relationship(
        "HEI",
        back_populates="users",
    )