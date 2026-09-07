from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FacultyExpertise(Base):
    __tablename__ = "faculty_expertise"

    # unique ID for this expertise entry
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # which faculty member has this expertise
    faculty_id: Mapped[int] = mapped_column(
        ForeignKey("faculty.id"),
        nullable=False,
    )

    # which domain this expertise belongs to
    domain_id: Mapped[int] = mapped_column(
        ForeignKey("domains.id"),
        nullable=False,
    )

    # how strong the faculty member is in this domain (1-5)
    expertise_level: Mapped[int] = mapped_column(
        nullable=False,
    )

    # lets us access the faculty member
    faculty = relationship(
        "Faculty",
        back_populates="expertise_entries",
    )

    # lets us access the domain
    domain = relationship("Domain")