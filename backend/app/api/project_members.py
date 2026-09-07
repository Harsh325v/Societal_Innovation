from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User, UserRole
from app.schemas.project_member import (
    ProjectMemberCreate,
    ProjectMemberResponse,
)


router = APIRouter(
    prefix="/api/v1/project-members",
    tags=["Project Members"],
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
    response_model=ProjectMemberResponse,
)
def add_project_member(
    project_id: int,
    member: ProjectMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only university users can manage project members
    if current_user.role not in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only university users can manage project members",
        )

    # the current user must actually belong to an HEI
    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    # check that the project exists
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

    # make sure the project belongs to the current user's HEI
    if project.hei_id != current_user.hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage members of your own HEI projects",
        )

    # check that the user being added exists
    user = (
        db.query(User)
        .filter(User.id == member.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # the member should belong to the same HEI as the project
    if user.hei_id != project.hei_id:
        raise HTTPException(
            status_code=400,
            detail="User does not belong to this HEI",
        )

    # only students and faculty can be added as project members
    allowed_member_roles = {
        UserRole.STUDENT.value,
        UserRole.FACULTY.value,
    }

    if member.role not in allowed_member_roles:
        raise HTTPException(
            status_code=400,
            detail="Project members can only have STUDENT or FACULTY roles",
        )

    # make sure the requested role matches the actual user role
    if user.role != member.role:
        raise HTTPException(
            status_code=400,
            detail="Selected member role does not match the user's actual role",
        )

    # don't add the same user to the same project twice
    existing_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member.user_id,
        )
        .first()
    )

    if existing_member is not None:
        raise HTTPException(
            status_code=400,
            detail="User is already a project member",
        )

    # add the user to the project
    new_member = ProjectMember(
        project_id=project_id,
        user_id=member.user_id,
        role=member.role,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.get(
    "/project/{project_id}",
    response_model=list[ProjectMemberResponse],
)
def get_project_members(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only authorised platform users should see project members
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
            detail="You don't have permission to view project members",
        )

    # check that the project exists
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

    # university users can only see members of their own HEI projects
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
                detail="You can only view members of your own HEI projects",
            )

    # get all members of this project
    return (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )