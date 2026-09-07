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
        .join(Faculty, Faculty.id == FacultyExpertise.faculty_id)
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

        hei = (
            db.query(HEI)
            .filter(HEI.id == faculty.hei_id)
            .first()
        )

        department = None

        if faculty.department_id:
            department = (
                db.query(HEIDepartment)
                .filter(
                    HEIDepartment.id == faculty.department_id
                )
                .first()
            )

        # expertise is stored from 1-5, convert it to a percentage
        match_score = (entry.expertise_level / 5) * 100

        # explain why this faculty member was recommended
        reasons = [
            f"Expertise in {domain.name}",
            f"Expertise level: {entry.expertise_level}/5",
        ]

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

    # strongest faculty matches should appear first
    matches.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    # give every faculty recommendation a rank
    for index, match in enumerate(matches, start=1):
        match["rank"] = index

    return matches[:10]