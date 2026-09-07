from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.hei import HEI
from app.schemas.hei import HEIResponse


router = APIRouter(
    prefix="/api/v1/heis",
    tags=["HEIs"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[HEIResponse])
def get_heis(db: Session = Depends(get_db)):
    # get all active HEIs
    return (
        db.query(HEI)
        .filter(HEI.is_active == True)
        .all()
    )


@router.get("/{hei_id}", response_model=HEIResponse)
def get_hei(
    hei_id: int,
    db: Session = Depends(get_db),
):
    # find the requested HEI
    hei = (
        db.query(HEI)
        .filter(
            HEI.id == hei_id,
            HEI.is_active == True,
        )
        .first()
    )

    if hei is None:
        raise HTTPException(
            status_code=404,
            detail="HEI not found",
        )

    return hei