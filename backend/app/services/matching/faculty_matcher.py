from sqlalchemy.orm import Session

from app.models.challenge import Challenge
from app.models.domain import Domain
from app.models.faculty import Faculty
from app.models.faculty_expertise import FacultyExpertise
from app.models.hei import HEI
from app.models.hei_department import HEIDepartment


def match_challenge_with_faculty(
    challenge: Challenge,
    db: Session,
) -> list[dict]:
    # we can't match faculty without an AI category
    if not challenge.category:
        return []

    # find the domain that matches the challenge category
    domain = (
        db.query(Domain)
        .filter(
            Domain.name.ilike(challenge.category)
        )
        .first()
    )

    if domain is None:
        return []

    # find faculty who are available and have expertise in this domain
    expertise_entries = (
        db.query(FacultyExpertise)
        .join(
            Faculty,
            Faculty.id == FacultyExpertise.faculty_id,
        )
        .filter(
            FacultyExpertise.domain_id == domain.id,
            Faculty.is_available == True,
        )
        .all()
    )

    matches = []

    for entry in expertise_entries:
        faculty = (
            db.query(Faculty)
            .filter(Faculty.id == entry.faculty_id)
            .first()
        )

        if faculty is None:
            continue

        # get the faculty member's HEI
        hei = (
            db.query(HEI)
            .filter(HEI.id == faculty.hei_id)
            .first()
        )

        # get the faculty department
        department = None

        if faculty.department_id:
            department = (
                db.query(HEIDepartment)
                .filter(
                    HEIDepartment.id == faculty.department_id
                )
                .first()
            )

        # -----------------------------------------
        # 1. EXPERTISE SCORE - 50%
        # -----------------------------------------

        expertise_score = (
            entry.expertise_level / 5
        ) * 100

        # -----------------------------------------
        # 2. LOCATION SCORE - 20%
        # -----------------------------------------

        if challenge.district and hei and hei.district:
            if (
                challenge.district.lower()
                == hei.district.lower()
            ):
                location_score = 100
            else:
                location_score = 25
        else:
            location_score = 50

        # -----------------------------------------
        # 3. DEPARTMENT SCORE - 15%
        # -----------------------------------------

        # having a department means the faculty
        # belongs to an organised academic area
        if department:
            department_score = 100
        else:
            department_score = 50

        # -----------------------------------------
        # 4. RESEARCH AREA SCORE - 15%
        # -----------------------------------------

        research_score = 0

        if faculty.expertise:
            research_text = faculty.expertise.lower()
            category_text = challenge.category.lower()

            # simple keyword check between the AI category
            # and the faculty's research areas
            if category_text in research_text:
                research_score = 100
            else:
                research_score = 50

        # -----------------------------------------
        # FINAL SCORE
        # -----------------------------------------

        match_score = (
            expertise_score * 0.50
            + location_score * 0.20
            + department_score * 0.15
            + research_score * 0.15
        )

        # -----------------------------------------
        # EXPLAIN THE MATCH
        # -----------------------------------------

        reasons = [
            f"Expertise in {domain.name}",
            f"Expertise level: {entry.expertise_level}/5",
        ]

        if challenge.district and hei and hei.district:
            if (
                challenge.district.lower()
                == hei.district.lower()
            ):
                reasons.append(
                    f"Same district: {hei.district}"
                )
            else:
                reasons.append(
                    f"HEI is located in {hei.district}"
                )

        if department:
            reasons.append(
                f"Department: {department.name}"
            )

        if faculty.expertise:
            reasons.append(
                f"Research areas: {faculty.expertise}"
            )

        matches.append(
            {
                "faculty_id": faculty.id,
                "faculty_name": faculty.name,
                "designation": faculty.designation,
                "hei_id": faculty.hei_id,
                "hei_name": hei.name if hei else None,
                "department_id": faculty.department_id,
                "department_name": (
                    department.name
                    if department
                    else None
                ),
                "match_score": round(match_score, 2),
                "match_reason": "; ".join(reasons),
            }
        )

    # strongest faculty matches first
    matches.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    # give every faculty recommendation a rank
    for index, match in enumerate(matches, start=1):
        match["rank"] = index

    # return top 10 faculty
    return matches[:10]