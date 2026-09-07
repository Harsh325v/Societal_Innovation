from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectMilestoneCreate(BaseModel):
    # basic milestone details
    title: str
    description: str | None = None
    milestone_order: int
    due_date: datetime | None = None


class ProjectMilestoneResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    milestone_order: int
    status: str
    due_date: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    # lets pydantic read directly from our SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)