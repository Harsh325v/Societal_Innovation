from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectMemberCreate(BaseModel):
    # user who is joining the project
    user_id: int

    # role inside the project: STUDENT, FACULTY, etc.
    role: str


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: str
    joined_at: datetime

    # lets pydantic read directly from our SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)