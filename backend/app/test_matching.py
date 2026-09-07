from app.core.database import SessionLocal

# load all our models so sqlalchemy knows about every relationship
from app.models.user import User
from app.models.challenge import Challenge
from app.models.challenge_ai_analysis import ChallengeAIAnalysis
from app.models.hei import HEI
from app.models.hei_department import HEIDepartment
from app.models.domain import Domain
from app.models.hei_expertise import HEIExpertise
from app.models.faculty import Faculty
from app.models.faculty_expertise import FacultyExpertise
from app.models.challenge_hei_match import ChallengeHEIMatch

from app.services.matching.hei_matcher import match_challenge_with_heis


db = SessionLocal()

try:
    # get the latest challenge
    challenge = (
        db.query(Challenge)
        .order_by(Challenge.id.desc())
        .first()
    )

    if challenge is None:
        print("No challenges found.")
    else:
        # run the HEI matching engine
        matches = match_challenge_with_heis(
            challenge,
            db,
        )

        print("\nHEI MATCHES")
        print("=" * 50)

        for match in matches:
            print(
                f"Rank {match['rank']} | "
                f"HEI ID: {match['hei_id']} | "
                f"Score: {match['match_score']}"
            )

            print(
                f"Reason: {match['match_reason']}"
            )

            print("-" * 50)

finally:
    db.close()