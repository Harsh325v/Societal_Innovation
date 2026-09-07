from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HEIDepartmentResponse(BaseModel):
    id: int
    hei_id: int
    name: str
    description: str | None
    created_at: datetime

    # lets pydantic read directly from our SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)