from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.core.config import settings

from app.api.auth import router as auth_router
from app.api.challenges import router as challenges_router
from app.api.heis import router as heis_router
from app.api.hei_departments import router as hei_departments_router
from app.api.faculty import router as faculty_router
from app.api.project_proposals import router as proposal_router
from app.api.projects import router as projects_router
from app.api.project_members import router as project_members_router
from app.api.project_milestones import router as milestone_router
from app.api.project_tasks import router as project_tasks_router
from app.api.industry_collaborations import router as industry_collaborations_router
from app.api.government import router as government_router
from app.api.project_impact import router as project_impact_router
from app.api.project_deliverables import router as project_deliverables_router
from app.api.chat import router as chat_router
from app.api.scientist_reviews import router as scientist_reviews_router
from app.api.sms_notifications import router as sms_notifications_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)


# allow our React frontend to call the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# authentication
app.include_router(auth_router)

# challenge + AI system
app.include_router(challenges_router)

# HEI system
app.include_router(heis_router)
app.include_router(hei_departments_router)
app.include_router(faculty_router)

# proposal + project system
app.include_router(proposal_router)
app.include_router(projects_router)
app.include_router(project_members_router)
app.include_router(milestone_router)
app.include_router(project_tasks_router)
app.include_router(industry_collaborations_router)
app.include_router(government_router)
app.include_router(project_impact_router)
app.include_router(project_deliverables_router)
app.include_router(chat_router)
app.include_router(scientist_reviews_router)
app.include_router(sms_notifications_router)



@app.get("/")
def root():
    return {
        "message": "Societal Innovation Portal API is running"
    }