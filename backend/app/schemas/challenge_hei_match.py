from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChallengeHEIMatchResponse(BaseModel):
    id: int
    challenge_id: int
    hei_id: int
    match_score: float
    match_reason: str | None
    rank: int | None
    created_at: datetime

    # lets pydantic read directly from sqlalchemy
    model_config = ConfigDict(from_attributes=True)