import app.models

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


db = SessionLocal()

try:
    scientist = (
        db.query(User)
        .filter(User.email == "scientist@sahyog.test")
        .first()
    )

    if scientist:
        scientist.email = "scientist_test@gmail.com"
        scientist.password_hash = hash_password("Test@12345")
        scientist.name = "Dr. Scientific Expert"
        scientist.role = "SCIENTIST"

        db.commit()

        print("Scientist account updated!")
        print("Email: scientist_test@gmail.com")
        print("Password: Test@12345")

    else:
        scientist = User(
            name="Dr. Scientific Expert",
            email="scientist_test@gmail.com",
            password_hash=hash_password("Test@12345"),
            role="SCIENTIST",
        )

        db.add(scientist)
        db.commit()

        print("Scientist account created!")
        print("Email: scientist_test@gmail.com")
        print("Password: Test@12345")

finally:
    db.close()