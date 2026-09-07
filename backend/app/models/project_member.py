from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectMember(Base):
    __tablename__ = "project_members"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # project this member belongs to
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
    )

    # user participating in the project
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # role inside the project: STUDENT, FACULTY, etc.
    role: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    # lets us access the project and user
    project = relationship("Project")
    user = relationship("User")