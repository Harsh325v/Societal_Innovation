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
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=list[ProjectResponse],
)
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # university users should only see projects from their own HEI
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

        return (
            db.query(Project)
            .filter(Project.hei_id == current_user.hei_id)
            .all()
        )

    # industry and government need to discover projects
    # across different HEIs
    if current_user.role in [
        UserRole.INDUSTRY_ADMIN.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    ]:
        return db.query(Project).all()

    # other roles should not access the project list
    raise HTTPException(
        status_code=403,
        detail="You don't have permission to view projects",
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # find the requested project
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

    # university users can only view projects from their own HEI
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
                detail="You can only view projects from your own HEI",
            )

    return project