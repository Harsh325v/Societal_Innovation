from datetime import datetime

from pydantic import BaseModel, Field


class ProjectImpactCreate(BaseModel):
    people_benefited: int = Field(default=0, ge=0)
    villages_covered: int = Field(default=0, ge=0)
    districts_covered: int = Field(default=0, ge=0)
    cost_savings: int = Field(default=0, ge=0)
    environmental_impact: str | None = None
    outcome: str | None = None
    deployment_status: str = "NOT_DEPLOYED"


class ProjectImpactResponse(BaseModel):
    id: int
    project_id: int
    people_benefited: int
    villages_covered: int
    districts_covered: int
    cost_savings: int
    environmental_impact: str | None
    outcome: str | None
    deployment_status: str
    recorded_at: datetime

    class Config:
        from_attributes = True