from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.project import Project
from app.models.project_task import ProjectTask
from app.models.project_member import ProjectMember
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Project Tasks"],
)


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


def check_project_access(
    project_id: int,
    current_user: User,
    db: Session,
):
    """
    Check whether the user is allowed to access
    this project's tasks.

    HEI users:
        Must belong to the same HEI.

    Government / Industry / Super Admin:
        Can view project information.

    Citizens:
        Cannot access project tasks.
    """

    project = get_project(
        project_id,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # UNIVERSITY USERS
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

        if current_user.hei_id != project.hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access tasks from your own HEI",
            )

        return project

    # -----------------------------------------------------
    # GLOBAL VIEWERS
    # -----------------------------------------------------

    if role in {
        UserRole.INDUSTRY_ADMIN.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
    }:
        return project

    # -----------------------------------------------------
    # EVERYTHING ELSE
    # -----------------------------------------------------

    raise HTTPException(
        status_code=403,
        detail="You don't have permission to access project tasks",
    )


def ensure_project_member(
    project_id: int,
    user_id: int,
    db: Session,
):
    """
    Make sure a user is actually a member of the project.
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
            detail="User is not a member of this project",
        )

    return member


# ---------------------------------------------------------
# CREATE TASK
# ---------------------------------------------------------

@router.post(
    "/{project_id}/tasks"
)
def create_task(
    project_id: int,
    title: str,
    description: str | None = None,
    assigned_to: int | None = None,
    due_date: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a project task.

    Only:
        HEI_ADMIN
        FACULTY
        SUPER_ADMIN

    can create tasks.
    """

    project = check_project_access(
        project_id,
        current_user,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # ONLY MANAGEMENT ROLES CAN CREATE TASKS
    # -----------------------------------------------------

    if role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.SUPER_ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="Only faculty or HEI admin can create tasks",
        )

    # -----------------------------------------------------
    # VALIDATE TITLE
    # -----------------------------------------------------

    if not title or not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Task title cannot be empty",
        )

    # -----------------------------------------------------
    # VALIDATE ASSIGNEE
    # -----------------------------------------------------

    if assigned_to is not None:

        user = (
            db.query(User)
            .filter(User.id == assigned_to)
            .first()
        )

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found",
            )

        # User must belong to same HEI.
        if user.hei_id != project.hei_id:
            raise HTTPException(
                status_code=400,
                detail="User does not belong to this project HEI",
            )

        user_role = get_role_value(user)

        # Only students/faculty can receive tasks.
        if user_role not in {
            UserRole.STUDENT.value,
            UserRole.FACULTY.value,
        }:
            raise HTTPException(
                status_code=400,
                detail="Tasks can only be assigned to students or faculty",
            )

        # IMPORTANT:
        # The user must actually be part of this project.
        ensure_project_member(
            project_id,
            assigned_to,
            db,
        )

    # -----------------------------------------------------
    # CREATE TASK
    # -----------------------------------------------------

    task = ProjectTask(
        project_id=project_id,
        assigned_to=assigned_to,
        title=title.strip(),
        description=description.strip()
        if description
        else None,
        due_date=due_date,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# ---------------------------------------------------------
# GET TASKS
# ---------------------------------------------------------

@router.get(
    "/{project_id}/tasks"
)
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all tasks belonging to a project.
    """

    check_project_access(
        project_id,
        current_user,
        db,
    )

    return (
        db.query(ProjectTask)
        .filter(
            ProjectTask.project_id == project_id
        )
        .order_by(
            ProjectTask.id
        )
        .all()
    )


# ---------------------------------------------------------
# UPDATE TASK STATUS
# ---------------------------------------------------------

@router.patch(
    "/tasks/{task_id}/status"
)
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a task's status.

    Faculty / HEI admin / super admin can update
    any task they have access to.

    A student can update only a task assigned to them.
    """

    task = (
        db.query(ProjectTask)
        .filter(
            ProjectTask.id == task_id
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    project = check_project_access(
        task.project_id,
        current_user,
        db,
    )

    role = get_role_value(current_user)

    # -----------------------------------------------------
    # VALIDATE STATUS
    # -----------------------------------------------------

    status = status.strip().upper()

    allowed_statuses = {
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid task status. "
                "Allowed statuses: "
                "PENDING, IN_PROGRESS, COMPLETED"
            ),
        )

    # -----------------------------------------------------
    # STUDENT OWNERSHIP CHECK
    # -----------------------------------------------------

    if role == UserRole.STUDENT.value:

        if task.assigned_to != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update tasks assigned to you",
            )

    # -----------------------------------------------------
    # OTHER ROLES
    # -----------------------------------------------------

    elif role not in {
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.SUPER_ADMIN.value,
    }:

        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this task",
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    task.status = status

    db.commit()
    db.refresh(task)

    return task