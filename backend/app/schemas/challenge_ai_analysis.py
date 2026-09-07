from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChallengeAIAnalysisResponse(BaseModel):
    id: int
    challenge_id: int
    category: str | None
    category_confidence: float | None
    priority_score: float | None
    is_duplicate: bool
    duplicate_score: float | None
    duplicate_challenge_id: int | None
    created_at: datetime

    # lets pydantic read directly from sqlalchemy
    model_config = ConfigDict(from_attributes=True)