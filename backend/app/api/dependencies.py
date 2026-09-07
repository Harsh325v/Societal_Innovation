from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User, UserRole


# looks for: Authorization: Bearer <token>
security = HTTPBearer()


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # grab the actual token from the request
    token = credentials.credentials

    try:
        # decode the token and make sure it's legit
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        # we put the user ID inside "sub" when creating the token
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    # find the user in postgres
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    # give the actual user to whatever endpoint called this
    return user


def require_role(*allowed_roles: UserRole):
    # this creates a reusable role checker
    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        # check if the user's role is allowed here
        if current_user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission for this",
            )

        return current_user

    return role_checker