from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal

from app.models.industry_collaboration import IndustryCollaboration
from app.models.project import Project
from app.models.user import User, UserRole

from app.schemas.industry_collaboration import (
    IndustryCollaborationCreate,
    IndustryCollaborationResponse,
)


router = APIRouter(
    prefix="/api/v1/industry-collaborations",
    tags=["Industry Collaborations"],
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


# ---------------------------------------------------------
# CREATE COLLABORATION
# ---------------------------------------------------------

@router.post(
    "/project/{project_id}",
    response_model=IndustryCollaborationResponse,
)
def create_collaboration(
    project_id: int,
    collaboration: IndustryCollaborationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Industry users can offer support to a project.
    """

    role = get_role_value(current_user)

    # Only industry users can make offers.
    if role != UserRole.INDUSTRY_ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Only industry users can offer collaboration",
        )

    project = get_project(
        project_id,
        db,
    )

    # -----------------------------------------------------
    # SUPPORT TYPE
    # -----------------------------------------------------

    support_type = (
        collaboration.support_type.strip().upper()
    )

    allowed_types = {
        "FUNDING",
        "MENTORSHIP",
        "PROTOTYPING",
        "TESTING",
        "PILOT",
        "DEPLOYMENT",
    }

    if support_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid collaboration support type. "
                "Allowed types: "
                "FUNDING, MENTORSHIP, PROTOTYPING, "
                "TESTING, PILOT, DEPLOYMENT"
            ),
        )

    # -----------------------------------------------------
    # FUNDING VALIDATION
    # -----------------------------------------------------

    if support_type == "FUNDING":

        if collaboration.funding_amount is None:
            raise HTTPException(
                status_code=400,
                detail="Funding amount is required for funding support",
            )

        if collaboration.funding_amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Funding amount must be greater than zero",
            )

    elif (
        collaboration.funding_amount is not None
        and collaboration.funding_amount < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Funding amount cannot be negative",
        )

    # -----------------------------------------------------
    # CREATE OFFER
    # -----------------------------------------------------

    new_collaboration = IndustryCollaboration(
        project_id=project.id,
        industry_user_id=current_user.id,
        support_type=support_type,
        funding_amount=collaboration.funding_amount,
        description=(
            collaboration.description.strip()
            if collaboration.description
            else None
        ),
    )

    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)

    return new_collaboration


# ---------------------------------------------------------
# GET PROJECT COLLABORATIONS
# ---------------------------------------------------------

@router.get(
    "/project/{project_id}",
    response_model=list[IndustryCollaborationResponse],
)
def get_project_collaborations(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get collaboration offers for a project.

    HEI users:
        Only their own HEI's projects.

    Students:
        Only projects belonging to their HEI.

    Industry / Government / Super Admin:
        Can discover collaboration information.
    """

    role = get_role_value(current_user)

    allowed_roles = {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
        UserRole.INDUSTRY_ADMIN.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }

    if role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view collaborations",
        )

    project = get_project(
        project_id,
        db,
    )

    # -----------------------------------------------------
    # UNIVERSITY SIDE
    # -----------------------------------------------------

    if role in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    }:

        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        if project.hei_id != current_user.hei_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only view collaborations "
                    "for your own HEI projects"
                ),
            )

    # -----------------------------------------------------
    # RETURN OFFERS
    # -----------------------------------------------------

    return (
        db.query(IndustryCollaboration)
        .filter(
            IndustryCollaboration.project_id
            == project_id
        )
        .order_by(
            IndustryCollaboration.created_at.desc()
        )
        .all()
    )


# ---------------------------------------------------------
# UPDATE COLLABORATION STATUS
# ---------------------------------------------------------

@router.patch(
    "/{collaboration_id}/status",
    response_model=IndustryCollaborationResponse,
)
def update_collaboration_status(
    collaboration_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept, reject or update an industry collaboration.

    Only:
        HEI_ADMIN
        FACULTY

    from the project's own HEI can do this.
    """

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # ROLE CHECK
    # -----------------------------------------------------

    if role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    }:
        raise HTTPException(
            status_code=403,
            detail=(
                "Only HEI users can update "
                "collaboration status"
            ),
        )

    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    # -----------------------------------------------------
    # FIND COLLABORATION
    # -----------------------------------------------------

    collaboration = (
        db.query(IndustryCollaboration)
        .filter(
            IndustryCollaboration.id
            == collaboration_id
        )
        .first()
    )

    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found",
        )

    # -----------------------------------------------------
    # FIND PROJECT
    # -----------------------------------------------------

    project = get_project(
        collaboration.project_id,
        db,
    )

    # -----------------------------------------------------
    # HEI OWNERSHIP CHECK
    # -----------------------------------------------------

    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only manage collaborations "
                "for your own HEI projects"
            ),
        )

    # -----------------------------------------------------
    # STATUS VALIDATION
    # -----------------------------------------------------

    status = status.strip().upper()

    allowed_statuses = {
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "REJECTED",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid collaboration status. "
                "Allowed statuses: "
                "PENDING, ACCEPTED, IN_PROGRESS, "
                "COMPLETED, REJECTED"
            ),
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    collaboration.status = status

    db.commit()
    db.refresh(collaboration)

    return collaboration