from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import traceback

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_reply


router = APIRouter(prefix="/api/v1", tags=["Chat"])

security = HTTPBearer(auto_error=False)


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        user_name = "User"
        user_role = "CITIZEN"
        user_context = {
            "authenticated": False,
            "user_id": None,
            "role": "CITIZEN",
        }

        # Optional authentication
        if credentials:
            token = credentials.credentials

            try:
                payload = jwt.decode(
                    token,
                    settings.secret_key,
                    algorithms=["HS256"],
                )

                user_id = payload.get("sub")

                if not user_id:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid authentication token",
                    )

                user_id = int(user_id)

                user = db.query(User).filter(User.id == user_id).first()

                if not user:
                    raise HTTPException(
                        status_code=401,
                        detail="User not found",
                    )

                user_name = user.name or "User"
                user_role = user.role

                user_context = {
                    "authenticated": True,
                    "user_id": user.id,
                    "role": user.role,
                }

            except (JWTError, ValueError):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired authentication token",
                )

        # Check Anthropic API key
        if not settings.anthropic_api_key:
            raise HTTPException(
                status_code=503,
                detail="Chatbot API key is not configured",
            )

        # Generate AI response
        response = generate_reply(
            message=request.message,
            conversation_id=request.conversationId,
            user_name=user_name,
            user_role=user_role,
            user_context=user_context,
        )

        return ChatResponse(response=response)

    except HTTPException:
        raise

    except Exception as e:
        # TEMPORARY: print the real error in the backend terminal
        print("\n========== CHATBOT ERROR ==========")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        traceback.print_exc()
        print("===================================\n")

        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again.",
        )