from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IndustryCollaborationCreate(BaseModel):
    # what kind of support the industry wants to provide
    support_type: str

    # only needed when support_type is FUNDING
    funding_amount: int | None = Field(
        default=None,
        ge=0,
    )

    # explain what the industry can provide
    description: str


class IndustryCollaborationResponse(BaseModel):
    id: int
    project_id: int
    industry_user_id: int
    support_type: str
    funding_amount: int | None
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    # lets pydantic convert the SQLAlchemy object to JSON
    model_config = ConfigDict(from_attributes=True)