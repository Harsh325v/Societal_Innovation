from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FacultyResponse(BaseModel):
    id: int
    hei_id: int
    department_id: int | None
    name: str
    designation: str | None
    expertise: str | None
    is_available: bool
    created_at: datetime

    # lets pydantic read directly from our SQLAlchemy Faculty object
    model_config = ConfigDict(from_attributes=True)


class FacultyMatchResponse(BaseModel):
    faculty_id: int
    faculty_name: str
    designation: str | None
    hei_id: int
    hei_name: str | None
    department_id: int | None
    department_name: str | None
    match_score: float
    match_reason: str
    rank: int