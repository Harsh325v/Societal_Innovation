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
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


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
    # only industry users should be able to offer collaboration
    if current_user.role != UserRole.INDUSTRY_ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Only industry users can offer collaboration",
        )

    # make sure the project exists
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

    # only allow our supported collaboration types
    allowed_types = {
        "FUNDING",
        "MENTORSHIP",
        "PROTOTYPING",
        "TESTING",
        "PILOT",
    }

    support_type = collaboration.support_type.upper()

    if support_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid collaboration support type",
        )

    # funding amount only makes sense for funding offers
    if support_type == "FUNDING" and collaboration.funding_amount is None:
        raise HTTPException(
            status_code=400,
            detail="Funding amount is required for funding support",
        )

    new_collaboration = IndustryCollaboration(
        project_id=project_id,
        industry_user_id=current_user.id,
        support_type=support_type,
        funding_amount=collaboration.funding_amount,
        description=collaboration.description,
    )

    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)

    return new_collaboration


@router.get(
    "/project/{project_id}",
    response_model=list[IndustryCollaborationResponse],
)
def get_project_collaborations(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only authorised users should see collaboration offers
    if current_user.role not in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
        UserRole.INDUSTRY_ADMIN.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view collaborations",
        )

    # make sure the project exists
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

    # university users can only see collaborations for their own HEI
    if current_user.role in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    ]:
        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        if project.hei_id != current_user.hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view collaborations for your own HEI projects",
            )

    # return all collaboration offers for this project
    return (
        db.query(IndustryCollaboration)
        .filter(
            IndustryCollaboration.project_id == project_id
        )
        .order_by(IndustryCollaboration.created_at.desc())
        .all()
    )


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
    # only the HEI/project side should accept or reject offers
    if current_user.role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="Only HEI users can update collaboration status",
        )

    # HEI users must belong to an HEI
    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    # find the collaboration offer
    collaboration = (
        db.query(IndustryCollaboration)
        .filter(IndustryCollaboration.id == collaboration_id)
        .first()
    )

    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found",
        )

    # find the project this collaboration belongs to
    project = (
        db.query(Project)
        .filter(Project.id == collaboration.project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # only users from the project's HEI can accept/reject offers
    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage collaborations for your own HEI projects",
        )

    allowed_statuses = {
        "PENDING",
        "ACCEPTED",
        "REJECTED",
    }

    status = status.upper()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid collaboration status",
        )

    collaboration.status = status

    db.commit()
    db.refresh(collaboration)

    return collaboration