from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_role
from app.models.user import User, UserRole
from app.models.challenge import Challenge
from app.models.scientist_review import ScientistReview


router = APIRouter(
    prefix="/api/v1/scientist-reviews",
    tags=["Scientist Reviews"],
)


class ScientistReviewCreate(BaseModel):
    challenge_id: int = Field(..., gt=0)
    observation: str = Field(..., min_length=5, max_length=5000)
    recommendation: str = Field(..., min_length=5, max_length=5000)
    confidence: float = Field(..., ge=0, le=1)
    expertise_area: str | None = Field(
        default=None,
        max_length=150,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_scientist_review(
    data: ScientistReviewCreate,
    current_user: User = Depends(
        require_role(
            UserRole.SCIENTIST,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    Allow a scientist to review a citizen-reported problem.
    """

    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == data.challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    observation = data.observation.strip()
    recommendation = data.recommendation.strip()
    expertise_area = (
        data.expertise_area.strip()
        if data.expertise_area
        else None
    )

    if not observation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Observation cannot be empty",
        )

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recommendation cannot be empty",
        )

    review = ScientistReview(
        challenge_id=challenge.id,
        scientist_id=current_user.id,
        observation=observation,
        recommendation=recommendation,
        confidence=data.confidence,
        expertise_area=expertise_area,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "message": "Scientist review submitted successfully",
        "review": {
            "id": review.id,
            "challenge_id": review.challenge_id,
            "scientist_id": review.scientist_id,
            "observation": review.observation,
            "recommendation": review.recommendation,
            "confidence": review.confidence,
            "expertise_area": review.expertise_area,
            "created_at": review.created_at,
        },
    }


@router.get("/challenge/{challenge_id}")
def get_scientist_reviews(
    challenge_id: int,
    current_user: User = Depends(
        require_role(
            UserRole.CITIZEN,
            UserRole.SCIENTIST,
            UserRole.FACULTY,
            UserRole.HEI_ADMIN,
            UserRole.GOVERNMENT,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    View expert reviews for a challenge.
    """

    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    reviews = (
        db.query(ScientistReview)
        .filter(
            ScientistReview.challenge_id == challenge_id
        )
        .order_by(ScientistReview.created_at.desc())
        .all()
    )

    return [
        {
            "id": review.id,
            "challenge_id": review.challenge_id,
            "scientist_id": review.scientist_id,
            "observation": review.observation,
            "recommendation": review.recommendation,
            "confidence": review.confidence,
            "expertise_area": review.expertise_area,
            "created_at": review.created_at,
        }
        for review in reviews
    ]