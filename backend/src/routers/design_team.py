from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from src.utils.database import get_db
from src.schemas.design_team import (
    DesignTeamResponse,
    DesignTeamApprove,
    DesignTeamUpdate,
)
from src.schemas.design_team_review import (
    DesignTeamReviewPublicResponse,
    DesignTeamReviewAdminResponse,
    DesignTeamReviewSubmit,
    DesignTeamReviewUpdate,
)
from src.schemas.design_team_request import (
    DesignTeamRequestCreate,
    DesignTeamRequestUpdate,
    DesignTeamRequestResponse,
)
from src.schemas.company import CompanyCreate, CompanyResponse
from src.crud import design_team as team_crud
from src.crud import design_team_review as review_crud
from src.crud import design_team_request as dt_request_crud
from src.crud import company as company_crud
from src.utils.limiter import limiter
import os

router = APIRouter(tags=["Design Teams"])

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    raise RuntimeError("ADMIN_SECRET_KEY environment variable is required")


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
    response_model=List[DesignTeamReviewPublicResponse],
)
async def get_design_team_reviews(team_id: int, db: Session = Depends(get_db)):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return review_crud.get_reviews_for_team(db, team_id)


@router.delete("/admin/design-teams/{team_id}")
async def delete_design_team(
    team_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Delete a design team (admin only)."""
    success = team_crud.delete_design_team(db, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Design team not found")
    return {"detail": "Design team deleted"}


@router.patch("/admin/design-teams/{team_id}", response_model=DesignTeamResponse)
async def update_design_team_admin(
    team_id: int,
    team: DesignTeamUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update a design team (admin only)."""
    updated_team = team_crud.update_design_team(db, team_id, team)
    if not updated_team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return updated_team


@router.post(
    "/design-teams/{team_id}/reviews",
    response_model=DesignTeamReviewPublicResponse,
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
    response_model=List[DesignTeamReviewAdminResponse],
)
async def get_pending_design_team_reviews(
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Get all pending design team reviews."""
    return review_crud.get_pending_reviews(db)


@router.get(
    "/admin/design-team-reviews/all",
    response_model=List[DesignTeamReviewAdminResponse],
)
async def get_all_design_team_reviews_admin(
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Get all design team reviews (for admin data management)."""
    return review_crud.get_all_reviews(db)


@router.patch(
    "/admin/design-team-reviews/{review_id}/approve",
    response_model=DesignTeamReviewAdminResponse,
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
    response_model=DesignTeamReviewAdminResponse,
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


@router.patch(
    "/admin/design-team-reviews/{review_id}",
    response_model=DesignTeamReviewAdminResponse,
)
async def update_design_team_review_admin(
    review_id: int,
    review: DesignTeamReviewUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update a design team review (admin only)."""
    updated_review = review_crud.update_design_team_review(db, review_id, review)
    if not updated_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return updated_review


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


# --- Design Team Request endpoints ---


@router.post("/design-team-requests", response_model=DesignTeamRequestResponse)
@limiter.limit("3/minute")
async def submit_design_team_request(
    request: Request,
    payload: DesignTeamRequestCreate,
    db: Session = Depends(get_db),
):
    """Submit a request for a new design team (no auth required)."""
    return dt_request_crud.create_request(db, payload.name, payload.requester_email)


@router.get(
    "/admin/design-team-requests",
    response_model=List[DesignTeamRequestResponse],
)
async def get_pending_design_team_requests(
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Get all pending design team requests."""
    return dt_request_crud.get_pending_requests(db)


@router.patch(
    "/admin/design-team-requests/{request_id}",
    response_model=DesignTeamRequestResponse,
)
async def update_design_team_request(
    request_id: int,
    payload: DesignTeamRequestUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update a design team request's name (e.g. to fix spelling)."""
    updated = dt_request_crud.update_request_name(db, request_id, payload.name)
    if not updated:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated


@router.patch(
    "/admin/design-team-requests/{request_id}/approve",
    response_model=DesignTeamResponse,
)
async def approve_design_team_request(
    request_id: int,
    approval_data: Optional[DesignTeamApprove] = None,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Approve a design team request — creates the design team."""
    categories = approval_data.categories if approval_data else []
    team = dt_request_crud.approve_request(db, request_id, categories)
    if not team:
        raise HTTPException(status_code=404, detail="Request not found")
    team.review_count = 0
    return team


@router.delete("/admin/design-team-requests/{request_id}")
async def reject_design_team_request(
    request_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Reject/delete a design team request."""
    success = dt_request_crud.reject_request(db, request_id)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"detail": "Request rejected"}


@router.post("/admin/design-team-requests/bulk-reject")
async def bulk_reject_design_team_requests(
    payload: List[int],
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Reject multiple design team requests."""
    count = dt_request_crud.bulk_reject_requests(db, payload)
    return {"detail": f"Rejected {count} requests"}
