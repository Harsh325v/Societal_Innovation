from sqlalchemy.orm import Session

from app.models.challenge import Challenge
from app.models.hei import HEI
from app.models.hei_expertise import HEIExpertise
from app.models.domain import Domain
from app.models.faculty import Faculty
from app.services.matching.scoring import calculate_hei_match


def match_challenge_with_heis(
    challenge: Challenge,
    db: Session,
) -> list[dict]:
    # get every active HEI
    heis = (
        db.query(HEI)
        .filter(HEI.is_active == True)
        .all()
    )

    matches = []

    for hei in heis:
        # find this HEI's expertise entries
        expertise_entries = (
            db.query(HEIExpertise)
            .filter(HEIExpertise.hei_id == hei.id)
            .all()
        )

        # start with no domain/expertise match
        domain_score = 0
        expertise_score = 0

        for entry in expertise_entries:
            domain = (
                db.query(Domain)
                .filter(Domain.id == entry.domain_id)
                .first()
            )

            if domain is None:
                continue

            # compare the challenge category with the HEI domain
            if (
                challenge.category
                and domain.name.lower()
                == challenge.category.lower()
            ):
                domain_score = 100

                # expertise level is 1-5, convert it to 0-100
                expertise_score = (
                    entry.expertise_level / 5
                ) * 100

        # find available faculty in this HEI
        faculty_count = (
            db.query(Faculty)
            .filter(
                Faculty.hei_id == hei.id,
                Faculty.is_available == True,
            )
            .count()
        )

        # basic faculty score
        faculty_score = min(
            faculty_count * 20,
            100,
        )

        # infrastructure score
        infrastructure_score = (
            100
            if hei.infrastructure
            else 0
        )

        # compare the challenge district with the HEI district
        if challenge.district and hei.district:
            if challenge.district.lower() == hei.district.lower():
                location_score = 100
            else:
                location_score = 25
        else:
            # if location data is missing, don't assume a match
            location_score = 50

        # calculate the final match score
        match_score = calculate_hei_match(
            domain_score=domain_score,
            expertise_score=expertise_score,
            faculty_score=faculty_score,
            infrastructure_score=infrastructure_score,
            location_score=location_score,
        )

        # explain why this HEI received this score
        reasons = []

        if domain_score > 0:
            reasons.append(
                f"Strong match in {challenge.category}"
            )

        if expertise_score > 0:
            reasons.append(
                f"Expertise level: {expertise_score / 20:.0f}/5"
            )

        if faculty_score > 0:
            reasons.append(
                f"{faculty_count} available faculty member(s)"
            )

        if infrastructure_score > 0:
            reasons.append(
                "Relevant infrastructure information available"
            )

        if location_score == 100:
            reasons.append(
                f"Located in the same district: {hei.district}"
            )
        elif location_score == 25:
            reasons.append(
                f"HEI is located in {hei.district}, while the challenge is in {challenge.district}"
            )
        else:
            reasons.append(
                "Location data was not fully available"
            )

        matches.append(
            {
                "hei_id": hei.id,
                "match_score": round(match_score, 2),
                "match_reason": "; ".join(reasons),
            }
        )

    # highest score first
    matches.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    # give each HEI a rank
    for index, match in enumerate(matches, start=1):
        match["rank"] = index

    return matches