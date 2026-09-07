from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectProposalCreate(BaseModel):
    # basic proposal details
    title: str
    description: str
    proposed_solution: str


class ProjectProposalResponse(BaseModel):
    id: int
    challenge_id: int
    hei_id: int
    title: str
    description: str
    proposed_solution: str
    status: str
    created_at: datetime
    updated_at: datetime

    # lets pydantic read directly from our SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)