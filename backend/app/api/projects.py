from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.project import Project
from app.models.user import User, UserRole
from app.schemas.project import ProjectResponse


router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Projects"],
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
# ROLE GROUPS
# ---------------------------------------------------------

HEI_PROJECT_ROLES = {
    UserRole.HEI_ADMIN.value,
    UserRole.FACULTY.value,
    UserRole.STUDENT.value,
}

GLOBAL_PROJECT_ROLES = {
    UserRole.INDUSTRY_ADMIN.value,
    UserRole.GOVERNMENT.value,
    UserRole.SUPER_ADMIN.value,
}


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def get_role_value(user: User):
    """
    Return the user's role as a string.
    """
    if isinstance(user.role, UserRole):
        return user.role.value

    return str(user.role)


def ensure_hei_access(
    project: Project,
    current_user: User,
):
    """
    Make sure a university-side user can access
    this project.

    HEI users can only access projects belonging
    to their own HEI.
    """

    role = get_role_value(current_user)

    if role not in HEI_PROJECT_ROLES:
        return

    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access projects from your own HEI",
        )


# ---------------------------------------------------------
# GET ALL PROJECTS
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[ProjectResponse],
)
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get projects available to the current role.

    HEI users:
        Only projects from their own HEI.

    Industry / Government / Super Admin:
        Can discover projects across HEIs.
    """

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # UNIVERSITY SIDE
    # -----------------------------------------------------

    if role in HEI_PROJECT_ROLES:

        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        return (
            db.query(Project)
            .filter(
                Project.hei_id == current_user.hei_id
            )
            .all()
        )

    # -----------------------------------------------------
    # GLOBAL PROJECT VIEW
    # -----------------------------------------------------

    if role in GLOBAL_PROJECT_ROLES:
        return db.query(Project).all()

    # -----------------------------------------------------
    # EVERYTHING ELSE
    # -----------------------------------------------------

    raise HTTPException(
        status_code=403,
        detail="You don't have permission to view projects",
    )


# ---------------------------------------------------------
# GET SINGLE PROJECT
# ---------------------------------------------------------

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a single project.

    University-side users can only access projects
    belonging to their own HEI.
    """

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    ensure_hei_access(
        project,
        current_user,
    )

    role = get_role_value(current_user)

    # Only approved project roles can access projects.
    if (
        role not in HEI_PROJECT_ROLES
        and role not in GLOBAL_PROJECT_ROLES
    ):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view projects",
        )

    return project


# ---------------------------------------------------------
# UPDATE PROJECT STATUS
# ---------------------------------------------------------

@router.patch(
    "/{project_id}/status",
    response_model=ProjectResponse,
)
def update_project_status(
    project_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the project's lifecycle stage.

    Allowed:
        HEI_ADMIN
        FACULTY
        SUPER_ADMIN

    Students, citizens, industry and government
    cannot change the project lifecycle.
    """

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # CHECK ROLE
    # -----------------------------------------------------

    if role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.SUPER_ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update project status",
        )

    # -----------------------------------------------------
    # CHECK HEI OWNERSHIP
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

        if project.hei_id != current_user.hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only update projects from your own HEI",
            )

    # -----------------------------------------------------
    # VALIDATE STATUS
    # -----------------------------------------------------

    allowed_statuses = {
        "PROPOSAL",
        "APPROVED",
        "RESEARCH",
        "PROTOTYPE",
        "TESTING",
        "PILOT",
        "DEPLOYED",
        "COMPLETED",
    }

    status = status.strip().upper()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid project status. "
                "Allowed statuses: "
                + ", ".join(sorted(allowed_statuses))
            ),
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    project.status = status

    # Automatically record completion date.
    if status == "COMPLETED":
        project.end_date = datetime.utcnow()

    db.commit()
    db.refresh(project)

    return project