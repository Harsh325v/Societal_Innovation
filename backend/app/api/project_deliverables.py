from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal

from app.models.project import Project
from app.models.project_deliverable import ProjectDeliverable
from app.models.project_member import ProjectMember
from app.models.user import User, UserRole

from app.schemas.project_deliverable import (
    ProjectDeliverableCreate,
    ProjectDeliverableResponse,
)


router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Project Deliverables"],
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


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

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


def ensure_project_access(
    project: Project,
    current_user: User,
):
    """
    Check whether the current user can access
    this project's deliverables.

    HEI users:
        Must belong to the same HEI.

    Government / Super Admin:
        Can access projects across HEIs.

    Students:
        Must belong to the project.

    Other roles:
        Not allowed.
    """

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # HEI ADMIN / FACULTY
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
                detail="You can only access your HEI's deliverables",
            )

        return

    # -----------------------------------------------------
    # STUDENT
    # -----------------------------------------------------

    if role == UserRole.STUDENT.value:
        return

    # -----------------------------------------------------
    # GOVERNMENT / SUPER ADMIN
    # -----------------------------------------------------

    if role in {
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        return

    raise HTTPException(
        status_code=403,
        detail="You don't have permission to access deliverables",
    )


def ensure_project_member(
    project_id: int,
    user_id: int,
    db: Session,
):
    """
    Check whether the user is actually a member
    of the project.
    """

    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        .first()
    )

    if member is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this project",
        )

    return member


# ---------------------------------------------------------
# CREATE DELIVERABLE
# ---------------------------------------------------------

@router.post(
    "/{project_id}/deliverables",
    response_model=ProjectDeliverableResponse,
)
def create_deliverable(
    project_id: int,
    deliverable: ProjectDeliverableCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a project deliverable.

    Students:
        Must be project members.

    Faculty / HEI Admin:
        Must belong to the project's HEI.

    Government / Super Admin:
        Can create where required.
    """

    project = get_project(
        project_id,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # STUDENT
    # -----------------------------------------------------

    if role == UserRole.STUDENT.value:

        ensure_project_member(
            project_id,
            current_user.id,
            db,
        )

    # -----------------------------------------------------
    # HEI STAFF
    # -----------------------------------------------------

    elif role in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    }:

        ensure_project_access(
            project,
            current_user,
        )

    # -----------------------------------------------------
    # GOVERNMENT / SUPER ADMIN
    # -----------------------------------------------------

    elif role in {
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to create deliverables",
        )

    # -----------------------------------------------------
    # VALIDATE INPUT
    # -----------------------------------------------------

    if not deliverable.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Deliverable title cannot be empty",
        )

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    new_deliverable = ProjectDeliverable(
        project_id=project_id,
        title=deliverable.title.strip(),
        description=(
            deliverable.description.strip()
            if deliverable.description
            else None
        ),
        status="SUBMITTED",
        submitted_by=current_user.id,
        submitted_at=datetime.utcnow(),
    )

    db.add(new_deliverable)
    db.commit()
    db.refresh(new_deliverable)

    return new_deliverable


# ---------------------------------------------------------
# GET DELIVERABLES
# ---------------------------------------------------------

@router.get(
    "/{project_id}/deliverables",
    response_model=list[ProjectDeliverableResponse],
)
def get_deliverables(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all deliverables for a project.
    """

    project = get_project(
        project_id,
        db,
    )

    role = get_role_value(current_user)

    # Students must actually belong to the project.
    if role == UserRole.STUDENT.value:

        ensure_project_member(
            project_id,
            current_user.id,
            db,
        )

    else:
        ensure_project_access(
            project,
            current_user,
        )

    return (
        db.query(ProjectDeliverable)
        .filter(
            ProjectDeliverable.project_id
            == project_id
        )
        .order_by(
            ProjectDeliverable.created_at
        )
        .all()
    )


# ---------------------------------------------------------
# UPDATE DELIVERABLE STATUS
# ---------------------------------------------------------

@router.patch(
    "/deliverables/{deliverable_id}/status",
    response_model=ProjectDeliverableResponse,
)
def update_deliverable_status(
    deliverable_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Review a project deliverable.

    Only:
        HEI_ADMIN
        FACULTY
        GOVERNMENT
        SUPER_ADMIN

    can review deliverables.
    """

    deliverable = (
        db.query(ProjectDeliverable)
        .filter(
            ProjectDeliverable.id
            == deliverable_id
        )
        .first()
    )

    if deliverable is None:
        raise HTTPException(
            status_code=404,
            detail="Deliverable not found",
        )

    project = get_project(
        deliverable.project_id,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # CHECK REVIEW PERMISSION
    # -----------------------------------------------------

    if role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to review deliverables",
        )

    # -----------------------------------------------------
    # HEI OWNERSHIP
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
                detail="You can only manage your HEI's deliverables",
            )

    # -----------------------------------------------------
    # VALIDATE STATUS
    # -----------------------------------------------------

    status = status.strip().upper()

    allowed_statuses = {
        "PENDING",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Allowed statuses: "
                "PENDING, SUBMITTED, APPROVED, REJECTED"
            ),
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    deliverable.status = status

    if status == "SUBMITTED":
        deliverable.submitted_by = current_user.id
        deliverable.submitted_at = datetime.utcnow()

    deliverable.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(deliverable)

    return deliverable