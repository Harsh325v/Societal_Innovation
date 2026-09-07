from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.challenge import Challenge
from app.models.hei import HEI
from app.models.project import Project
from app.models.project_proposal import ProjectProposal
from app.models.user import User, UserRole
from app.schemas.project_proposal import (
    ProjectProposalCreate,
    ProjectProposalResponse,
)


router = APIRouter(
    prefix="/api/v1/proposals",
    tags=["Project Proposals"],
)


def get_db():
    # get a connection to postgres
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=ProjectProposalResponse,
)
def create_proposal(
    proposal: ProjectProposalCreate,
    challenge_id: int,
    hei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only university users can submit proposals
    if current_user.role not in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only university users can submit proposals",
        )

    # university users must be linked to an HEI
    if current_user.hei_id is None:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an HEI",
        )

    # a university user can only submit proposals for their own HEI
    if current_user.hei_id != hei_id:
        raise HTTPException(
            status_code=403,
            detail="You can only submit proposals for your own HEI",
        )

    # check that the challenge exists
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # check that the HEI exists
    hei = (
        db.query(HEI)
        .filter(HEI.id == hei_id)
        .first()
    )

    if hei is None:
        raise HTTPException(
            status_code=404,
            detail="HEI not found",
        )

    # create the proposal
    new_proposal = ProjectProposal(
        challenge_id=challenge_id,
        hei_id=hei_id,
        title=proposal.title,
        description=proposal.description,
        proposed_solution=proposal.proposed_solution,
    )

    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)

    return new_proposal


@router.get(
    "/challenge/{challenge_id}",
    response_model=list[ProjectProposalResponse],
)
def get_challenge_proposals(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only authenticated workflow users can view proposals
    allowed_roles = [
        UserRole.CITIZEN.value,
        UserRole.COMMUNITY_ORG.value,
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    ]

    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view proposals",
        )

    # check that the challenge exists
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # citizens can only view proposals for their own challenges
    if current_user.role in [
        UserRole.CITIZEN.value,
        UserRole.COMMUNITY_ORG.value,
    ]:
        if challenge.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view proposals for your own challenges",
            )

    # university users can only view proposals for their own HEI
    if current_user.role in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    ]:
        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        proposals = (
            db.query(ProjectProposal)
            .filter(
                ProjectProposal.challenge_id == challenge_id,
                ProjectProposal.hei_id == current_user.hei_id,
            )
            .all()
        )

        return proposals

    # government and super admins can see all proposals
    return (
        db.query(ProjectProposal)
        .filter(
            ProjectProposal.challenge_id == challenge_id
        )
        .all()
    )


@router.get(
    "/hei/{hei_id}",
    response_model=list[ProjectProposalResponse],
)
def get_hei_proposals(
    hei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only authenticated workflow users can view proposals
    allowed_roles = [
        UserRole.GOVERNMENT.value,
        UserRole.SUPER_ADMIN.value,
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    ]

    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view HEI proposals",
        )

    # university users can only view proposals belonging to their HEI
    if current_user.role in [
        UserRole.HEI_ADMIN.value,
        UserRole.FACULTY.value,
        UserRole.STUDENT.value,
    ]:
        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        if current_user.hei_id != hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view proposals for your own HEI",
            )

    # government and super admins can view any HEI's proposals
    return (
        db.query(ProjectProposal)
        .filter(
            ProjectProposal.hei_id == hei_id
        )
        .all()
    )


@router.post(
    "/{proposal_id}/approve",
)
def approve_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only government or university admins can approve proposals
    if current_user.role not in [
        UserRole.GOVERNMENT.value,
        UserRole.HEI_ADMIN.value,
    ]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to approve proposals",
        )

    # find the proposal
    proposal = (
        db.query(ProjectProposal)
        .filter(ProjectProposal.id == proposal_id)
        .first()
    )

    if proposal is None:
        raise HTTPException(
            status_code=404,
            detail="Proposal not found",
        )

    # university admins can only approve proposals for their own HEI
    if current_user.role == UserRole.HEI_ADMIN.value:
        if current_user.hei_id is None:
            raise HTTPException(
                status_code=403,
                detail="Your account is not linked to an HEI",
            )

        if current_user.hei_id != proposal.hei_id:
            raise HTTPException(
                status_code=403,
                detail="You can only approve proposals for your own HEI",
            )

    # don't create multiple projects from the same proposal
    existing_project = (
        db.query(Project)
        .filter(Project.proposal_id == proposal.id)
        .first()
    )

    if existing_project is not None:
        raise HTTPException(
            status_code=400,
            detail="A project already exists for this proposal",
        )

    # mark the proposal as approved
    proposal.status = "APPROVED"

    # create the project from the approved proposal
    new_project = Project(
        proposal_id=proposal.id,
        challenge_id=proposal.challenge_id,
        hei_id=proposal.hei_id,
        title=proposal.title,
        description=proposal.proposed_solution,
        status="ACTIVE",
        start_date=datetime.utcnow(),
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Proposal approved and project created",
        "proposal_id": proposal.id,
        "project_id": new_project.id,
        "status": proposal.status,
    }