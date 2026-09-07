from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.faculty import Faculty
from app.schemas.faculty import FacultyResponse


router = APIRouter(
    prefix="/api/v1/faculty",
    tags=["Faculty"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/hei/{hei_id}",
    response_model=list[FacultyResponse],
)
def get_hei_faculty(
    hei_id: int,
    db: Session = Depends(get_db),
):
    # get all faculty members belonging to this HEI
    return (
        db.query(Faculty)
        .filter(Faculty.hei_id == hei_id)
        .all()
    )


@router.get(
    "/{faculty_id}",
    response_model=FacultyResponse,
)
def get_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
):
    # find the requested faculty member
    return (
        db.query(Faculty)
        .filter(Faculty.id == faculty_id)
        .first()
    )