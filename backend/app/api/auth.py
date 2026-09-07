from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.core.database import SessionLocal
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.user import LoginRequest, UserCreate, UserResponse


# all auth routes start with /api/v1/auth
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    # public registration should only create normal user accounts
    allowed_roles = {
        UserRole.CITIZEN,
        UserRole.COMMUNITY_ORG,
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="This role cannot be created through public registration",
        )

    # check if this email is already being used
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # don't save the actual password 💀
    hashed_password = hash_password(user.password)

    # create the new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        phone=user.phone,
        role=user.role.value,
    )

    # add the user and save it in postgres
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(
    user: LoginRequest,
    db: Session = Depends(get_db),
):
    # find the user using their email
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # check if the password matches the saved hash
    if not verify_password(
        user.password,
        existing_user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # password is correct, create a JWT
    access_token = create_access_token(existing_user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    # return the complete logged-in user, including their HEI
    return current_user


@router.get("/citizen-test")
def citizen_test(
    current_user: User = Depends(
        require_role(UserRole.CITIZEN)
    ),
):
    # only citizens can reach this endpoint
    return {
        "message": "You're allowed here 👊",
        "user": current_user.name,
        "role": current_user.role,
    }