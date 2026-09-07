from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.challenge import Challenge
from app.models.challenge_ai_analysis import ChallengeAIAnalysis
from app.models.challenge_hei_match import ChallengeHEIMatch
from app.models.user import User, UserRole
from app.schemas.challenge import ChallengeCreate, ChallengeResponse
from app.schemas.challenge_ai_analysis import ChallengeAIAnalysisResponse
from app.schemas.challenge_hei_match import ChallengeHEIMatchResponse
from app.services.ai.category import classify_challenge
from app.services.ai.duplicate import find_duplicate
from app.services.ai.priority import calculate_priority
from app.services.matching.hei_matcher import match_challenge_with_heis
from app.schemas.faculty import FacultyMatchResponse
from app.services.matching.faculty_matcher import match_challenge_with_faculty


router = APIRouter(
    prefix="/api/v1/challenges",
    tags=["Challenges"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ChallengeResponse)
def create_challenge(
    challenge: ChallengeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only citizens, community organisations and government can submit challenges
    if current_user.role not in [
        UserRole.CITIZEN.value,
        UserRole.COMMUNITY_ORG.value,
        UserRole.GOVERNMENT.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to submit challenges",
        )

    # combine title + description so the AI gets the full problem
    challenge_text = f"{challenge.title}. {challenge.description}"

    # predict the category and get the confidence
    category, category_confidence = classify_challenge(challenge_text)

    # calculate the priority score
    priority_score = calculate_priority(
        severity=challenge.severity,
        urgency=challenge.urgency,
        people_affected=challenge.people_affected,
        geographic_impact=challenge.geographic_impact,
    )

    # get existing challenges for duplicate checking
    existing_challenges = (
        db.query(Challenge)
        .filter(Challenge.description.isnot(None))
        .all()
    )

    existing_texts = [
        f"{item.title}. {item.description}"
        for item in existing_challenges
    ]

    # check if this problem is similar to an existing one
    is_duplicate, duplicate_score, duplicate_index = find_duplicate(
        challenge_text,
        existing_texts,
    )

    duplicate_challenge_id = None

    if duplicate_index is not None:
        duplicate_challenge_id = existing_challenges[duplicate_index].id

    # create the actual challenge
    new_challenge = Challenge(
        user_id=current_user.id,
        title=challenge.title,
        description=challenge.description,

        # save the location submitted by the citizen
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

    # save the AI analysis
    ai_analysis = ChallengeAIAnalysis(
        challenge_id=new_challenge.id,
        category=str(category),
        category_confidence=float(category_confidence),
        priority_score=priority_score,
        is_duplicate=is_duplicate,
        duplicate_score=duplicate_score,
        duplicate_challenge_id=duplicate_challenge_id,
    )

    db.add(ai_analysis)

    # get the best HEI matches
    matches = match_challenge_with_heis(new_challenge, db)

    # save every HEI recommendation
    for match in matches:
        hei_match = ChallengeHEIMatch(
            challenge_id=new_challenge.id,
            hei_id=match["hei_id"],
            match_score=match["match_score"],
            match_reason=match["match_reason"],
            rank=match["rank"],
        )

        db.add(hei_match)

    # save the AI analysis + HEI matches
    db.commit()

    return new_challenge


@router.get("/", response_model=list[ChallengeResponse])
def get_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # citizens should only see challenges they submitted
    if current_user.role == UserRole.CITIZEN.value:
        return (
            db.query(Challenge)
            .filter(Challenge.user_id == current_user.id)
            .all()
        )

    # universities, industry and government need to discover challenges
    if current_user.role in [
        UserRole.COMMUNITY_ORG.value,
        UserRole.GOVERNMENT.value,
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
        UserRole.INDUSTRY_ADMIN.value,
        UserRole.SUPER_ADMIN.value,
    ]:
        return db.query(Challenge).all()

    raise HTTPException(
        status_code=403,
        detail="You don't have permission to view challenges",
    )


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # find one real challenge by its database ID
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # citizens can only view their own challenges
    if current_user.role == UserRole.CITIZEN.value:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own challenges",
            )

    return challenge


@router.get(
    "/{challenge_id}/ai-analysis",
    response_model=ChallengeAIAnalysisResponse,
)
def get_ai_analysis(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # make sure the challenge exists
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # citizens can only see AI analysis for their own challenges
    if current_user.role == UserRole.CITIZEN.value:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own challenge analysis",
            )

    # find the AI analysis for this challenge
    analysis = (
        db.query(ChallengeAIAnalysis)
        .filter(
            ChallengeAIAnalysis.challenge_id == challenge_id
        )
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found",
        )

    return analysis


@router.get(
    "/{challenge_id}/hei-matches",
    response_model=list[ChallengeHEIMatchResponse],
)
def get_hei_matches(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # make sure the challenge exists
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # citizens can only see HEI matches for their own challenges
    if current_user.role == UserRole.CITIZEN.value:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view matches for your own challenges",
            )

    # get all HEI recommendations for this challenge
    matches = (
        db.query(ChallengeHEIMatch)
        .filter(
            ChallengeHEIMatch.challenge_id == challenge_id
        )
        .order_by(ChallengeHEIMatch.rank)
        .all()
    )

    return matches

@router.get(
    "/{challenge_id}/faculty-matches",
    response_model=list[FacultyMatchResponse],
)
def get_faculty_matches(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # make sure the challenge exists
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # citizens can only see faculty matches for their own challenges
    if current_user.role == UserRole.CITIZEN.value:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view matches for your own challenges",
            )

    # find the best faculty for this challenge
    return match_challenge_with_faculty(
        challenge,
        db,
    )