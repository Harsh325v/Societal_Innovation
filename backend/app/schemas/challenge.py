from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChallengeCreate(BaseModel):
    # basic problem details
    title: str
    description: str

    # language used by the citizen
    language: str = Field(
        default="en",
        pattern="^(en|hi)$",
    )

    # location
    district: str | None = None
    block: str | None = None
    locality: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    # citizen impact ratings
    severity: int = Field(ge=1, le=5)
    urgency: int = Field(ge=1, le=5)
    people_affected: int = Field(ge=1, le=5)
    geographic_impact: int = Field(ge=1, le=5)


class ChallengeResponse(BaseModel):
    id: int
    user_id: int

    # original content
    title: str
    description: str
    source_language: str

    # multilingual versions
    title_en: str | None
    title_hi: str | None
    description_en: str | None
    description_hi: str | None

    # location
    district: str | None
    block: str | None
    locality: str | None
    latitude: float | None
    longitude: float | None

    # AI information
    category: str | None
    priority_score: float | None
    status: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )