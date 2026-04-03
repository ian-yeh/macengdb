from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from src.schemas import ExperienceResponse, ExperienceCreate, ExperienceSubmit, ExperienceUpdate
import src.crud.experience as crud
from src.utils.database import get_db
from src.utils.limiter import limiter
from typing import List, Optional
import os

router = APIRouter()

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "macengdb-admin-2026")


def verify_admin_key(x_admin_key: str = Header(...)):
    """Verify the admin API key from request header."""
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return x_admin_key


@router.post("/experiences/submit", response_model=ExperienceResponse)
@limiter.limit("5/minute")
async def submit_experience(
    request: Request,
    experience: ExperienceSubmit,
    db: Session = Depends(get_db),
):
    """
    Submit a new experience anonymously (no auth required).
    Requires a valid McMaster email address.
    Experience will be set to 'pending' until approved by an admin.
    """
    return crud.create_experience_anonymous(db, experience)


@router.get(
    "/companies/{company_id}/experiences", response_model=List[ExperienceResponse]
)
async def get_company_experiences(company_id: int, db: Session = Depends(get_db)):
    """
    Get all APPROVED experiences for a specific company.
    Used by the Company Page.
    """
    return crud.get_experiences_by_company_id(db, company_id)


# --- Admin endpoints ---


@router.get("/admin/experiences/pending", response_model=List[ExperienceResponse])
async def get_pending_experiences(
    db: Session = Depends(get_db), _admin_key: str = Depends(verify_admin_key)
):
    """Get all pending experiences for admin review."""
    return crud.get_pending_experiences(db)


@router.get("/admin/experiences/all", response_model=List[ExperienceResponse])
async def get_all_experiences_admin(
    db: Session = Depends(get_db), _admin_key: str = Depends(verify_admin_key)
):
    """Get all experiences (for admin data management)."""
    # Using existing crud.get_all_experiences but without the 'approved' filter if needed.
    # Actually, let's create a specific one or use existing one if it returns all.
    return crud.get_all_admin_experiences(db)


@router.patch(
    "/admin/experiences/{experience_id}/approve", response_model=ExperienceResponse
)
async def approve_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Approve a pending experience."""
    result = crud.update_experience_status(db, experience_id, "approved")
    if not result:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result


@router.patch(
    "/admin/experiences/{experience_id}/reject", response_model=ExperienceResponse
)
async def reject_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Reject a pending experience."""
    result = crud.update_experience_status(db, experience_id, "rejected")
    if not result:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result


@router.delete("/admin/experiences/{experience_id}")
async def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Delete an experience."""
    success = crud.delete_experience(db, experience_id)
    if not success:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"detail": "Experience deleted"}


@router.patch("/admin/experiences/{experience_id}", response_model=ExperienceResponse)
async def update_experience_admin(
    experience_id: int,
    experience: ExperienceUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update an experience (admin only)."""
    updated_experience = crud.update_experience(db, experience_id, experience)
    if not updated_experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return updated_experience
