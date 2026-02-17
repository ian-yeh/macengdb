from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from src.utils.database import get_db
from src.schemas.design_team import DesignTeamResponse, DesignTeamCreate
from src.schemas.design_team_review import (
    DesignTeamReviewResponse,
    DesignTeamReviewSubmit,
)
from src.schemas.company import CompanyCreate, CompanyResponse
from src.crud import design_team as team_crud
from src.crud import design_team_review as review_crud
from src.crud import company as company_crud
import os

router = APIRouter(tags=["Design Teams"])

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "macengdb-admin-2026")


def verify_admin_key(x_admin_key: str = Header(...)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return x_admin_key


@router.get("/design-teams", response_model=List[DesignTeamResponse])
async def get_design_teams(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return team_crud.get_all_design_teams(db, category=category)


@router.get("/design-teams/{team_id}", response_model=DesignTeamResponse)
async def get_design_team(team_id: int, db: Session = Depends(get_db)):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return team


@router.get(
    "/design-teams/{team_id}/reviews",
    response_model=List[DesignTeamReviewResponse],
)
async def get_design_team_reviews(team_id: int, db: Session = Depends(get_db)):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return review_crud.get_reviews_for_team(db, team_id)


@router.post(
    "/design-teams/{team_id}/reviews",
    response_model=DesignTeamReviewResponse,
    status_code=201,
)
async def submit_design_team_review(
    team_id: int,
    review: DesignTeamReviewSubmit,
    db: Session = Depends(get_db),
):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    review.design_team_id = team_id
    return review_crud.create_review(db, review)


# --- Admin endpoints ---


@router.get(
    "/admin/design-team-reviews",
    response_model=List[DesignTeamReviewResponse],
)
async def get_pending_design_team_reviews(
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Get all pending design team reviews."""
    return review_crud.get_pending_reviews(db)


@router.patch(
    "/admin/design-team-reviews/{review_id}/approve",
    response_model=DesignTeamReviewResponse,
)
async def approve_design_team_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Approve a design team review."""
    review = review_crud.approve_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.patch(
    "/admin/design-team-reviews/{review_id}/reject",
    response_model=DesignTeamReviewResponse,
)
async def reject_design_team_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Reject a design team review."""
    review = review_crud.reject_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.delete("/admin/design-team-reviews/{review_id}")
async def delete_design_team_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Delete a design team review."""
    success = review_crud.delete_review(db, review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"detail": "Review deleted"}


@router.post("/admin/companies", response_model=CompanyResponse)
async def admin_create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Manually create a company (admin only)."""
    new_company = company_crud.create_company(db, company)
    new_company.experience_count = 0
    return new_company
