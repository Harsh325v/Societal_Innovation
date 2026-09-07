from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class HEIExpertise(Base):
    __tablename__ = "hei_expertise"

    # unique ID for this expertise entry
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # which HEI has this expertise
    hei_id: Mapped[int] = mapped_column(
        ForeignKey("heis.id"),
        nullable=False,
    )

    # which domain the expertise belongs to
    domain_id: Mapped[int] = mapped_column(
        ForeignKey("domains.id"),
        nullable=False,
    )

    # how strong the HEI is in this domain (1-5)
    expertise_level: Mapped[int] = mapped_column(
        nullable=False,
    )

    # lets us access the HEI and domain from this record
    hei = relationship("HEI")
    domain = relationship(
        "Domain",
        back_populates="hei_expertise",
    )