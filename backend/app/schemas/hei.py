from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HEIResponse(BaseModel):
    id: int
    name: str
    code: str | None
    description: str | None
    district: str | None
    state: str
    infrastructure: str | None
    website: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # lets pydantic read directly from our SQLAlchemy HEI object
    model_config = ConfigDict(from_attributes=True)