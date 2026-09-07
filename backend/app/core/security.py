import bcrypt
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings


# JWT settings come from .env instead of being hardcoded
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    # bcrypt needs bytes, so convert the password first
    password_bytes = password.encode("utf-8")

    # hash the password and turn it back into a string
    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    # check whether the password matches the stored hash
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8"),
    )


def create_access_token(user_id: int) -> str:
    # token expires after 1 hour
    expire = datetime.now(timezone.utc) + timedelta(hours=1)

    # this is the information we're putting inside the JWT
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    # create and sign the JWT
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )