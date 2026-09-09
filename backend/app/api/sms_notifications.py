from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_role
from app.models.user import User, UserRole
from app.models.sms_notification import SMSNotification


router = APIRouter(
    prefix="/api/v1/sms-notifications",
    tags=["SMS Notifications"],
)


class SMSNotificationCreate(BaseModel):
    user_id: int = Field(..., gt=0)
    message: str = Field(..., min_length=5, max_length=500)
    notification_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_sms_notification(
    data: SMSNotificationCreate,
    current_user: User = Depends(
        require_role(
            UserRole.GOVERNMENT,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    Create a demo SMS notification for a user.

    This stores the notification in the database.
    A real SMS provider can be connected later.
    """

    user = (
        db.query(User)
        .filter(User.id == data.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a phone number",
        )

    message = data.message.strip()
    notification_type = data.notification_type.strip().upper()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )

    if not notification_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification type cannot be empty",
        )

    notification = SMSNotification(
        user_id=user.id,
        phone=user.phone,
        message=message,
        notification_type=notification_type,
        sent=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {
        "message": "SMS notification created successfully",
        "notification": {
            "id": notification.id,
            "user_id": notification.user_id,
            "phone": notification.phone,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "sent": notification.sent,
            "created_at": notification.created_at,
        },
    }


@router.get("/me")
def get_my_sms_notifications(
    current_user: User = Depends(
        require_role(
            UserRole.CITIZEN,
            UserRole.COMMUNITY_ORG,
            UserRole.SCIENTIST,
            UserRole.FACULTY,
            UserRole.HEI_ADMIN,
            UserRole.INDUSTRY_ADMIN,
            UserRole.GOVERNMENT,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    Get SMS notifications belonging to the logged-in user.
    """

    notifications = (
        db.query(SMSNotification)
        .filter(
            SMSNotification.user_id == current_user.id
        )
        .order_by(
            SMSNotification.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": notification.id,
            "phone": notification.phone,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "sent": notification.sent,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]