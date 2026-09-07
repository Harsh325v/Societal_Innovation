from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class HEIDepartment(Base):
    __tablename__ = "hei_departments"

    # unique ID for every department
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # which HEI this department belongs to
    hei_id: Mapped[int] = mapped_column(
        ForeignKey("heis.id"),
        nullable=False,
    )

    # department information
    name: Mapped[str] = mapped_column(
        String(200),
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

    # lets us do department.hei
    hei = relationship(
        "HEI",
        back_populates="departments",
    )