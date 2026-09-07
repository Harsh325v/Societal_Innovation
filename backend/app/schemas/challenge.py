from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChallengeCreate(BaseModel):
    # basic problem details
    title: str
    description: str

    # location of the problem
    district: str | None = None
    block: str | None = None
    locality: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    # citizen gives these ratings from 1 to 5
    severity: int = Field(ge=1, le=5)
    urgency: int = Field(ge=1, le=5)
    people_affected: int = Field(ge=1, le=5)
    geographic_impact: int = Field(ge=1, le=5)


class ChallengeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str

    # location information
    district: str | None
    block: str | None
    locality: str | None
    latitude: float | None
    longitude: float | None

    category: str | None
    priority_score: float | None
    status: str
    created_at: datetime
    updated_at: datetime

    # lets pydantic read data directly from sqlalchemy
    model_config = ConfigDict(from_attributes=True)