from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User, UserRole


# Looks for:
# Authorization: Bearer <token>
security = HTTPBearer()


def get_db():
    """
    Create a database session for the request
    and always close it afterwards.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Validate the JWT token and return the corresponding user.
    """

    token = credentials.credentials

    try:
        # Decode and validate the JWT.
        # jose will also validate the expiry if the token
        # contains an exp claim.
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        # User ID is stored inside "sub".
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={
                    "WWW-Authenticate": "Bearer"
                },
            )

        # Make sure sub is actually a valid integer.
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={
                    "WWW-Authenticate": "Bearer"
                },
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # Find the user in PostgreSQL.
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return user


def require_role(*allowed_roles: UserRole):
    """
    Reusable role-based access checker.

    Example:

        current_user: User = Depends(
            require_role(
                UserRole.GOVERNMENT,
                UserRole.SUPER_ADMIN,
            )
        )
    """

    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        user_role = current_user.role

        # Handle both:
        #   UserRole.CITIZEN
        # and
        #   "CITIZEN"
        #
        # depending on how SQLAlchemy returns the value.
        user_role_value = (
            user_role.value
            if isinstance(user_role, UserRole)
            else str(user_role)
        )

        allowed_role_values = [
            role.value
            if isinstance(role, UserRole)
            else str(role)
            for role in allowed_roles
        ]

        if user_role_value not in allowed_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission for this",
            )

        return current_user

    return role_checker