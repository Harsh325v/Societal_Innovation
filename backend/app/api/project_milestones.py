from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.project import Project
from app.models.project_milestone import ProjectMilestone
from app.models.user import User, UserRole
from app.schemas.project_milestone import (
    ProjectMilestoneCreate,
    ProjectMilestoneResponse,
)

router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Project Milestones"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/{project_id}/milestones",
    response_model=ProjectMilestoneResponse,
)
def create_milestone(
    project_id: int,
    milestone: ProjectMilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only university users can manage milestones
    if current_user.role not in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only university users can manage milestones",
        )

    # the user must belong to an HEI
    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
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

    # only allow users from the project's HEI
    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage milestones for your own HEI projects",
        )

    # create the milestone
    new_milestone = ProjectMilestone(
        project_id=project_id,
        title=milestone.title,
        description=milestone.description,
        milestone_order=milestone.milestone_order,
        due_date=milestone.due_date,
    )

    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)

    return new_milestone


@router.get(
    "/{project_id}/milestones",
    response_model=list[ProjectMilestoneResponse],
)
def get_project_milestones(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only authorised platform users should see milestones
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
            detail="You don't have permission to view milestones",
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

    # university users can only see milestones from their own HEI
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
                detail="You can only view milestones from your own HEI projects",
            )

    # return milestones in the correct order
    return (
        db.query(ProjectMilestone)
        .filter(ProjectMilestone.project_id == project_id)
        .order_by(ProjectMilestone.milestone_order)
        .all()
    )


@router.patch(
    "/milestones/{milestone_id}/status",
    response_model=ProjectMilestoneResponse,
)
def update_milestone_status(
    milestone_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only university users can update milestones
    if current_user.role not in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only university users can update milestones",
        )

    # the user must belong to an HEI
    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    # find the milestone
    milestone = (
        db.query(ProjectMilestone)
        .filter(ProjectMilestone.id == milestone_id)
        .first()
    )

    if milestone is None:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found",
        )

    # find the project this milestone belongs to
    project = (
        db.query(Project)
        .filter(Project.id == milestone.project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # only allow users from the project's HEI
    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update milestones for your own HEI projects",
        )

    # only allow these three statuses
    allowed_statuses = {
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid milestone status",
        )

    milestone.status = status

    # save when the milestone was completed
    if status == "COMPLETED":
        milestone.completed_at = datetime.utcnow()
    else:
        milestone.completed_at = None

    db.commit()
    db.refresh(milestone)

    return milestone