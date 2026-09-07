from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Faculty(Base):
    __tablename__ = "faculty"

    # unique ID for every faculty member
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # which HEI this faculty member belongs to
    hei_id: Mapped[int] = mapped_column(
        ForeignKey("heis.id"),
        nullable=False,
    )

    # which department they belong to
    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("hei_departments.id"),
        nullable=True,
    )

    # basic faculty information
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    designation: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # research areas / expertise description
    expertise: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # useful later when matching available faculty
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    # lets us access the HEI from a faculty member
    hei = relationship("HEI")

    # lets us access the department
    department = relationship("HEIDepartment")

    # a faculty member can have multiple areas of expertise
    expertise_entries = relationship(
        "FacultyExpertise",
        back_populates="faculty",
    )