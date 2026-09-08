from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.project import Project
from app.models.project_impact import ProjectImpact
from app.models.user import User, UserRole
from app.schemas.project_impact import (
    ProjectImpactCreate,
    ProjectImpactResponse,
)


router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Project Impact"],
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


def get_project(
    project_id: int,
    db: Session,
):
    """
    Find a project or return 404.
    """

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


def check_project_access(
    project_id: int,
    current_user: User,
    db: Session,
):
    """
    Check whether the current user is allowed to access
    impact information for this project.
    """

    project = get_project(
        project_id,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # HEI USERS
    # -----------------------------------------------------

    if role in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    }:

        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        if current_user.hei_id != project.hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access impact for your own HEI projects",
            )

    # -----------------------------------------------------
    # GOVERNMENT / SUPER ADMIN
    # -----------------------------------------------------

    elif role in {
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        pass

    # -----------------------------------------------------
    # EVERYONE ELSE
    # -----------------------------------------------------

    else:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access project impact",
        )

    return project


@router.post(
    "/{project_id}/impact",
    response_model=ProjectImpactResponse,
)
def create_impact(
    project_id: int,
    impact: ProjectImpactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record impact for a project.

    Only HEI_ADMIN, FACULTY, GOVERNMENT and SUPER_ADMIN
    can create impact data.
    """

    project = check_project_access(
        project_id,
        current_user,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # CREATE PERMISSION
    # -----------------------------------------------------

    allowed_roles = {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }

    if role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to record impact",
        )

    # -----------------------------------------------------
    # ONE IMPACT RECORD PER PROJECT
    # -----------------------------------------------------

    existing = (
        db.query(ProjectImpact)
        .filter(
            ProjectImpact.project_id == project.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Impact already exists for this project",
        )

    # -----------------------------------------------------
    # NUMBER VALIDATION
    # -----------------------------------------------------

    numeric_fields = {
        "people_benefited": impact.people_benefited,
        "villages_covered": impact.villages_covered,
        "districts_covered": impact.districts_covered,
        "cost_savings": impact.cost_savings,
    }

    for field_name, value in numeric_fields.items():

        if value is not None and value < 0:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} cannot be negative",
            )

    # -----------------------------------------------------
    # DEPLOYMENT STATUS
    # -----------------------------------------------------

    deployment_status = (
        impact.deployment_status.strip().upper()
    )

    allowed_statuses = {
        "NOT_DEPLOYED",
        "DEPLOYED",
    }

    if deployment_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid deployment status. "
                "Allowed statuses: "
                "NOT_DEPLOYED, DEPLOYED"
            ),
        )

    # -----------------------------------------------------
    # CREATE IMPACT
    # -----------------------------------------------------

    new_impact = ProjectImpact(
        project_id=project.id,
        people_benefited=impact.people_benefited,
        villages_covered=impact.villages_covered,
        districts_covered=impact.districts_covered,
        cost_savings=impact.cost_savings,
        environmental_impact=(
            impact.environmental_impact.strip()
            if impact.environmental_impact
            else None
        ),
        outcome=(
            impact.outcome.strip()
            if impact.outcome
            else None
        ),
        deployment_status=deployment_status,
    )

    db.add(new_impact)
    db.commit()
    db.refresh(new_impact)

    return new_impact


@router.get(
    "/{project_id}/impact",
    response_model=ProjectImpactResponse,
)
def get_impact(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get impact information for a project.
    """

    check_project_access(
        project_id,
        current_user,
        db,
    )

    impact = (
        db.query(ProjectImpact)
        .filter(
            ProjectImpact.project_id == project_id
        )
        .first()
    )

    if impact is None:
        raise HTTPException(
            status_code=404,
            detail="Impact data not found",
        )

    return impact