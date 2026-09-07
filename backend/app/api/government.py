from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.challenge import Challenge
from app.models.hei import HEI
from app.models.industry_collaboration import IndustryCollaboration
from app.models.project import Project
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/api/v1/government",
    tags=["Government"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def get_government_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only government and super admins can see this dashboard
    if current_user.role not in {
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="Only government users can access this dashboard",
        )

    # -------------------------
    # challenge statistics
    # -------------------------

    total_challenges = db.query(Challenge).count()

    active_challenges = (
        db.query(Challenge)
        .filter(Challenge.status == "OPEN")
        .count()
    )

    resolved_challenges = (
        db.query(Challenge)
        .filter(Challenge.status == "RESOLVED")
        .count()
    )

    # -------------------------
    # project statistics
    # -------------------------

    total_projects = db.query(Project).count()

    active_projects = (
        db.query(Project)
        .filter(Project.status == "ACTIVE")
        .count()
    )

    completed_projects = (
        db.query(Project)
        .filter(Project.status == "COMPLETED")
        .count()
    )

    deployed_projects = (
        db.query(Project)
        .filter(Project.status == "DEPLOYED")
        .count()
    )

    # -------------------------
    # university participation
    # -------------------------

    universities_participating = (
        db.query(Project.hei_id)
        .distinct()
        .count()
    )

    university_rows = (
        db.query(
            HEI.name,
            func.count(Project.id),
        )
        .join(
            Project,
            Project.hei_id == HEI.id,
        )
        .group_by(HEI.id, HEI.name)
        .order_by(func.count(Project.id).desc())
        .all()
    )

    university_participation = [
        {
            "name": name,
            "projects": project_count,
        }
        for name, project_count in university_rows
    ]

    # -------------------------
    # industry participation
    # -------------------------

    industry_rows = (
        db.query(
            User.name,
            func.count(IndustryCollaboration.id),
        )
        .join(
            IndustryCollaboration,
            IndustryCollaboration.industry_user_id == User.id,
        )
        .group_by(User.id, User.name)
        .order_by(
            func.count(IndustryCollaboration.id).desc()
        )
        .all()
    )

    industry_participation = [
        {
            "name": name,
            "collaborations": collaboration_count,
        }
        for name, collaboration_count in industry_rows
    ]

    industry_partners = (
        db.query(IndustryCollaboration.industry_user_id)
        .distinct()
        .count()
    )

    # -------------------------
    # challenge domains
    # -------------------------

    domain_rows = (
        db.query(
            Challenge.category,
            func.count(Challenge.id),
        )
        .group_by(Challenge.category)
        .order_by(func.count(Challenge.id).desc())
        .all()
    )

    challenges_by_domain = [
        {
            "name": category or "Uncategorized",
            "value": count,
        }
        for category, count in domain_rows
    ]

    # -------------------------
    # challenge status
    # -------------------------

    status_rows = (
        db.query(
            Challenge.status,
            func.count(Challenge.id),
        )
        .group_by(Challenge.status)
        .all()
    )

    challenges_by_status = [
        {
            "name": status,
            "value": count,
        }
        for status, count in status_rows
    ]

    # -------------------------
    # project progress
    # -------------------------

    project_status_rows = (
        db.query(
            Project.status,
            func.count(Project.id),
        )
        .group_by(Project.status)
        .all()
    )

    projects_by_status = [
        {
            "name": status,
            "value": count,
        }
        for status, count in project_status_rows
    ]

    # -------------------------
    # district challenge data
    # -------------------------

    # count challenges for each district
    district_rows = (
        db.query(
            Challenge.district,
            func.count(Challenge.id),
        )
        .filter(Challenge.district.isnot(None))
        .filter(Challenge.district != "")
        .group_by(Challenge.district)
        .order_by(func.count(Challenge.id).desc())
        .all()
    )

    challenge_density = [
        {
            "district": district,
            "challenges": count,
        }
        for district, count in district_rows
    ]

    # count unique districts that have submitted challenges
    districts_covered = (
        db.query(Challenge.district)
        .filter(Challenge.district.isnot(None))
        .filter(Challenge.district != "")
        .distinct()
        .count()
    )

    return {
        "stats": {
            "totalChallenges": total_challenges,
            "activeChallenges": active_challenges,
            "resolvedChallenges": resolved_challenges,
            "activeProjects": active_projects,
            "universitiesParticipating": universities_participating,
            "industryPartners": industry_partners,
            "solutionsDeployed": deployed_projects,
            "peopleBenefited": 0,
            "totalProjects": total_projects,
            "completedProjects": completed_projects,
        },
        "domainData": challenges_by_domain,
        "statusData": challenges_by_status,
        "projectData": projects_by_status,
        "challengeDensity": challenge_density,
        "universityParticipation": university_participation,
        "industryParticipation": industry_participation,
        "impact": {
            "peopleBenefited": 0,
            "projectsDeployed": deployed_projects,
            "problemsResolved": resolved_challenges,
            "districtsCovered": districts_covered,
        },
    }