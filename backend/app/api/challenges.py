from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal

from app.models.challenge import Challenge
from app.models.challenge_ai_analysis import ChallengeAIAnalysis
from app.models.challenge_hei_match import ChallengeHEIMatch
from app.models.user import User, UserRole

from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeResponse,
)
from app.schemas.challenge_ai_analysis import (
    ChallengeAIAnalysisResponse,
)
from app.schemas.challenge_hei_match import (
    ChallengeHEIMatchResponse,
)
from app.schemas.faculty import FacultyMatchResponse

from app.services.ai.category import classify_challenge
from app.services.ai.duplicate import find_duplicate
from app.services.ai.priority import calculate_priority

from app.services.matching.hei_matcher import (
    match_challenge_with_heis,
)
from app.services.matching.faculty_matcher import (
    match_challenge_with_faculty,
)


router = APIRouter(
    prefix="/api/v1/challenges",
    tags=["Challenges"],
)


def get_db():
    """
    Create a database session for the request
    and close it afterwards.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# ROLE HELPERS
# ---------------------------------------------------------

CHALLENGE_CREATOR_ROLES = {
    UserRole.CITIZEN.value,
    UserRole.COMMUNITY_ORG.value,
    UserRole.GOVERNMENT.value,
}


CHALLENGE_VIEWER_ROLES = {
    UserRole.CITIZEN.value,
    UserRole.COMMUNITY_ORG.value,
    UserRole.GOVERNMENT.value,
    UserRole.HEI_ADMIN.value,
    UserRole.FACULTY.value,
    UserRole.STUDENT.value,
    UserRole.INDUSTRY_ADMIN.value,
    UserRole.SCIENTIST.value,
    UserRole.SUPER_ADMIN.value,
}


def get_role_value(user: User):
    """
    Return the user's role as a string.

    This keeps authorization checks safe whether SQLAlchemy
    gives us the enum object or its string value.
    """
    if isinstance(user.role, UserRole):
        return user.role.value

    return str(user.role)


def ensure_can_view_challenge(
    challenge: Challenge,
    current_user: User,
):
    """
    Make sure the current user is allowed to view
    this challenge.

    Citizens can only access challenges they submitted.

    Other authorized platform roles can discover challenges
    because they may need them for matching, research,
    project work, monitoring, collaboration, or scientific review.
    """

    role = get_role_value(current_user)

    if role not in CHALLENGE_VIEWER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view challenges",
        )

    if role == UserRole.CITIZEN.value:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own challenges",
            )


# ---------------------------------------------------------
# CREATE CHALLENGE
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=ChallengeResponse,
)
def create_challenge(
    challenge: ChallengeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new societal challenge.

    Allowed:
    - Citizen
    - Community organisation
    - Government
    """

    role = get_role_value(current_user)

    if role not in CHALLENGE_CREATOR_ROLES:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to submit challenges",
        )

    # -----------------------------------------------------
    # BASIC INPUT VALIDATION
    # -----------------------------------------------------

    if not challenge.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Challenge title cannot be empty",
        )

    if not challenge.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Challenge description cannot be empty",
        )

    # -----------------------------------------------------
    # AI CATEGORY
    # -----------------------------------------------------

    challenge_text = (
        f"{challenge.title}. "
        f"{challenge.description}"
    )

    category, category_confidence = classify_challenge(
        challenge_text
    )

    # -----------------------------------------------------
    # PRIORITY
    # -----------------------------------------------------

    priority_score = calculate_priority(
        severity=challenge.severity,
        urgency=challenge.urgency,
        people_affected=challenge.people_affected,
        geographic_impact=challenge.geographic_impact,
    )

    # -----------------------------------------------------
    # DUPLICATE CHECK
    # -----------------------------------------------------

    existing_challenges = (
        db.query(Challenge)
        .filter(
            Challenge.description.isnot(None)
        )
        .all()
    )

    existing_texts = [
        f"{item.title}. {item.description}"
        for item in existing_challenges
    ]

    (
        is_duplicate,
        duplicate_score,
        duplicate_index,
    ) = find_duplicate(
        challenge_text,
        existing_texts,
    )

    duplicate_challenge_id = None

    if duplicate_index is not None:
        duplicate_challenge_id = (
            existing_challenges[
                duplicate_index
            ].id
        )

    # -----------------------------------------------------
    # CREATE CHALLENGE
    # -----------------------------------------------------

    new_challenge = Challenge(
        user_id=current_user.id,
        title=challenge.title.strip(),
        description=challenge.description.strip(),

        district=challenge.district,
        block=challenge.block,
        locality=challenge.locality,

        latitude=challenge.latitude,
        longitude=challenge.longitude,

        category=str(category),
        priority_score=priority_score,
    )

    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)

    # -----------------------------------------------------
    # SAVE AI ANALYSIS
    # -----------------------------------------------------

    ai_analysis = ChallengeAIAnalysis(
        challenge_id=new_challenge.id,
        category=str(category),
        category_confidence=float(
            category_confidence
        ),
        priority_score=priority_score,
        is_duplicate=is_duplicate,
        duplicate_score=duplicate_score,
        duplicate_challenge_id=duplicate_challenge_id,
    )

    db.add(ai_analysis)

    # -----------------------------------------------------
    # HEI MATCHING
    # -----------------------------------------------------

    matches = match_challenge_with_heis(
        new_challenge,
        db,
    )

    for match in matches:
        hei_match = ChallengeHEIMatch(
            challenge_id=new_challenge.id,
            hei_id=match["hei_id"],
            match_score=match["match_score"],
            match_reason=match["match_reason"],
            rank=match["rank"],
        )

        db.add(hei_match)

    db.commit()

    return new_challenge


# ---------------------------------------------------------
# GET CHALLENGES
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[ChallengeResponse],
)
def get_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get challenges available to the current role.

    Citizens:
        Only their own challenges.

    Other authorized platform roles:
        Can discover challenges for their work.
    """

    role = get_role_value(current_user)

    if role not in CHALLENGE_VIEWER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view challenges",
        )

    query = db.query(Challenge)

    if role == UserRole.CITIZEN.value:
        query = query.filter(
            Challenge.user_id == current_user.id
        )

    return query.all()


# ---------------------------------------------------------
# GET SINGLE CHALLENGE
# ---------------------------------------------------------

@router.get(
    "/{challenge_id}",
    response_model=ChallengeResponse,
)
def get_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get one challenge.

    Citizens can only access their own challenge.
    """

    challenge = (
        db.query(Challenge)
        .filter(
            Challenge.id == challenge_id
        )
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    ensure_can_view_challenge(
        challenge,
        current_user,
    )

    return challenge


# ---------------------------------------------------------
# GET AI ANALYSIS
# ---------------------------------------------------------

@router.get(
    "/{challenge_id}/ai-analysis",
    response_model=ChallengeAIAnalysisResponse,
)
def get_ai_analysis(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get AI analysis for a challenge.
    """

    challenge = (
        db.query(Challenge)
        .filter(
            Challenge.id == challenge_id
        )
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    ensure_can_view_challenge(
        challenge,
        current_user,
    )

    analysis = (
        db.query(ChallengeAIAnalysis)
        .filter(
            ChallengeAIAnalysis.challenge_id
            == challenge_id
        )
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found",
        )

    return analysis


# ---------------------------------------------------------
# GET HEI MATCHES
# ---------------------------------------------------------

@router.get(
    "/{challenge_id}/hei-matches",
    response_model=list[ChallengeHEIMatchResponse],
)
def get_hei_matches(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get university recommendations for a challenge.
    """

    challenge = (
        db.query(Challenge)
        .filter(
            Challenge.id == challenge_id
        )
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    ensure_can_view_challenge(
        challenge,
        current_user,
    )

    matches = (
        db.query(ChallengeHEIMatch)
        .filter(
            ChallengeHEIMatch.challenge_id
            == challenge_id
        )
        .order_by(
            ChallengeHEIMatch.rank
        )
        .all()
    )

    return matches


# ---------------------------------------------------------
# GET FACULTY MATCHES
# ---------------------------------------------------------

@router.get(
    "/{challenge_id}/faculty-matches",
    response_model=list[FacultyMatchResponse],
)
def get_faculty_matches(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get faculty recommendations for a challenge.
    """

    challenge = (
        db.query(Challenge)
        .filter(
            Challenge.id == challenge_id
        )
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    ensure_can_view_challenge(
        challenge,
        current_user,
    )

    return match_challenge_with_faculty(
        challenge,
        db,
    )