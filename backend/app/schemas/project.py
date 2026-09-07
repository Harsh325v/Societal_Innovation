from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectResponse(BaseModel):
    id: int
    proposal_id: int
    challenge_id: int
    hei_id: int
    title: str
    description: str
    status: str
    start_date: datetime | None
    end_date: datetime | None
    created_at: datetime
    updated_at: datetime

    # lets pydantic read directly from our SQLAlchemy Project object
    model_config = ConfigDict(from_attributes=True)