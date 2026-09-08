from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal

from app.models.challenge import Challenge
from app.models.hei import HEI
from app.models.industry_collaboration import IndustryCollaboration
from app.models.project import Project
from app.models.project_impact import ProjectImpact
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/api/v1/government",
    tags=["Government"],
)


def get_db():
    """
    Create a database session and close it afterwards.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_role_value(user: User):
    """
    Return the user's role as a normal string.
    """
    if isinstance(user.role, UserRole):
        return user.role.value

    return str(user.role)


def check_government_access(current_user: User):
    """
    Only Government and Super Admin users can access
    government analytics and district information.
    """

    role = get_role_value(current_user)

    if role not in {
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="Only government users can access this data",
        )


# ---------------------------------------------------------
# GOVERNMENT DASHBOARD
# ---------------------------------------------------------

@router.get("/dashboard")
def get_government_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_government_access(current_user)

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
        .filter(
            Project.status.notin_(
                ["COMPLETED", "DEPLOYED"]
            )
        )
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
        .group_by(
            HEI.id,
            HEI.name,
        )
        .order_by(
            func.count(Project.id).desc()
        )
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
            IndustryCollaboration.industry_user_id
            == User.id,
        )
        .group_by(
            User.id,
            User.name,
        )
        .order_by(
            func.count(
                IndustryCollaboration.id
            ).desc()
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
        db.query(
            IndustryCollaboration.industry_user_id
        )
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
        .order_by(
            func.count(Challenge.id).desc()
        )
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
    # project lifecycle
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

    district_rows = (
        db.query(
            Challenge.district,
            func.count(Challenge.id),
        )
        .filter(Challenge.district.isnot(None))
        .filter(Challenge.district != "")
        .group_by(Challenge.district)
        .order_by(
            func.count(Challenge.id).desc()
        )
        .all()
    )

    challenge_density = [
        {
            "district": district,
            "challenges": count,
        }
        for district, count in district_rows
    ]

    # -------------------------
    # real project impact
    # -------------------------

    impact_totals = (
        db.query(
            func.coalesce(
                func.sum(
                    ProjectImpact.people_benefited
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ProjectImpact.villages_covered
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ProjectImpact.districts_covered
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ProjectImpact.cost_savings
                ),
                0,
            ),
        )
        .first()
    )

    people_benefited = int(impact_totals[0])
    villages_covered = int(impact_totals[1])
    impact_districts = int(impact_totals[2])
    cost_savings = int(impact_totals[3])

    # -------------------------
    # funding
    # -------------------------

    total_funding = (
        db.query(
            func.coalesce(
                func.sum(
                    IndustryCollaboration.funding_amount
                ),
                0,
            )
        )
        .scalar()
    )

    total_funding = int(total_funding or 0)

    # -------------------------
    # final government response
    # -------------------------

    return {
        "stats": {
            "totalChallenges": total_challenges,
            "activeChallenges": active_challenges,
            "resolvedChallenges": resolved_challenges,
            "totalProjects": total_projects,
            "activeProjects": active_projects,
            "completedProjects": completed_projects,
            "universitiesParticipating": universities_participating,
            "industryPartners": industry_partners,
            "solutionsDeployed": deployed_projects,
            "peopleBenefited": people_benefited,
            "villagesCovered": villages_covered,
            "districtsCovered": impact_districts,
            "totalFunding": total_funding,
        },

        "domainData": challenges_by_domain,

        "statusData": challenges_by_status,

        "projectData": projects_by_status,

        "challengeDensity": challenge_density,

        "universityParticipation": university_participation,

        "industryParticipation": industry_participation,

        "impact": {
            "peopleBenefited": people_benefited,
            "villagesCovered": villages_covered,
            "districtsCovered": impact_districts,
            "projectsDeployed": deployed_projects,
            "problemsResolved": resolved_challenges,
            "costSavings": cost_savings,
        },
    }


# ---------------------------------------------------------
# DISTRICT OVERVIEW
# ---------------------------------------------------------

@router.get("/districts")
def get_districts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_government_access(current_user)

    rows = (
        db.query(
            Challenge.district,
            func.count(Challenge.id),
        )
        .filter(
            Challenge.district.isnot(None)
        )
        .filter(
            Challenge.district != ""
        )
        .group_by(
            Challenge.district
        )
        .order_by(
            Challenge.district
        )
        .all()
    )

    return [
        {
            "district": district,
            "challenges": count,
        }
        for district, count in rows
    ]


# ---------------------------------------------------------
# DISTRICT DETAILS
# ---------------------------------------------------------

@router.get("/districts/{district}")
def get_district_details(
    district: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_government_access(current_user)

    district = district.strip()

    if not district:
        raise HTTPException(
            status_code=400,
            detail="District cannot be empty",
        )

    challenge_count = (
        db.query(Challenge)
        .filter(
            Challenge.district.ilike(district)
        )
        .count()
    )

    project_count = (
        db.query(Project)
        .join(
            Challenge,
            Project.challenge_id
            == Challenge.id,
        )
        .filter(
            Challenge.district.ilike(district)
        )
        .count()
    )

    return {
        "district": district,
        "challenges": challenge_count,
        "projects": project_count,
    }


# ---------------------------------------------------------
# DISTRICT CHALLENGES
# ---------------------------------------------------------

@router.get("/districts/{district}/challenges")
def get_district_challenges(
    district: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_government_access(current_user)

    district = district.strip()

    if not district:
        raise HTTPException(
            status_code=400,
            detail="District cannot be empty",
        )

    return (
        db.query(Challenge)
        .filter(
            Challenge.district.ilike(district)
        )
        .all()
    )


# ---------------------------------------------------------
# DISTRICT PROJECTS
# ---------------------------------------------------------

@router.get("/districts/{district}/projects")
def get_district_projects(
    district: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_government_access(current_user)

    district = district.strip()

    if not district:
        raise HTTPException(
            status_code=400,
            detail="District cannot be empty",
        )

    return (
        db.query(Project)
        .join(
            Challenge,
            Project.challenge_id
            == Challenge.id,
        )
        .filter(
            Challenge.district.ilike(district)
        )
        .all()
    )