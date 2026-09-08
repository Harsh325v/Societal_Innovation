from datetime import datetime

from pydantic import BaseModel, Field


class ProjectDeliverableCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class ProjectDeliverableResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: str
    submitted_by: int | None
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True