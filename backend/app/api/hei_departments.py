from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.hei_department import HEIDepartment
from app.schemas.hei_department import HEIDepartmentResponse


router = APIRouter(
    prefix="/api/v1/hei-departments",
    tags=["HEI Departments"],
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
    response_model=list[HEIDepartmentResponse],
)
def get_hei_departments(
    hei_id: int,
    db: Session = Depends(get_db),
):
    # get all departments belonging to this HEI
    return (
        db.query(HEIDepartment)
        .filter(HEIDepartment.hei_id == hei_id)
        .all()
    )