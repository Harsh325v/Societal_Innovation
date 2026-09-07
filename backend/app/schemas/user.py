from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    role: UserRole


class UserCreate(UserBase):
    password: str


# only email + password are needed for login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    hei_id: int | None = None
    is_verified: bool
    is_active: bool

    # lets Pydantic read data directly from our SQLAlchemy User object
    model_config = {"from_attributes": True}