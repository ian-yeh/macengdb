from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from src.schemas.company_request import (
    CompanyRequestCreate,
    CompanyRequestUpdate,
    CompanyRequestResponse,
)
from src.schemas.company import CompanyResponse, CompanyApprove
import src.crud.company_request as crud
from src.utils.database import get_db
from src.utils.limiter import limiter
from typing import List, Optional
import os

router = APIRouter()

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "macengdb-admin-2026")


def verify_admin_key(x_admin_key: str = Header(...)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return x_admin_key


@router.post("/company-requests", response_model=CompanyRequestResponse)
@limiter.limit("5/minute")
async def submit_company_request(
    request: Request, payload: CompanyRequestCreate, db: Session = Depends(get_db)
):
    """Submit a request for a new company (no auth required)."""
    return crud.create_company_request(db, payload.name, payload.requester_email)


# --- Admin endpoints ---


@router.get("/admin/company-requests", response_model=List[CompanyRequestResponse])
async def get_pending_company_requests(
    db: Session = Depends(get_db), _admin_key: str = Depends(verify_admin_key)
):
    """Get all pending company requests."""
    return crud.get_pending_requests(db)


@router.patch(
    "/admin/company-requests/{request_id}", response_model=CompanyRequestResponse
)
async def update_company_request(
    request_id: int,
    payload: CompanyRequestUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update a company request's name (e.g. to fix spelling)."""
    updated = crud.update_request_name(db, request_id, payload.name)
    if not updated:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated


@router.patch(
    "/admin/company-requests/{request_id}/approve", response_model=CompanyResponse
)
async def approve_company_request(
    request_id: int,
    approval_data: Optional[CompanyApprove] = None,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Approve a company request — creates the company."""
    # Handle optional body
    industries = approval_data.industries if approval_data else []
    company = crud.approve_request(db, request_id, industries)
    if not company:
        raise HTTPException(status_code=404, detail="Request not found")
    company.experience_count = 0
    return company


@router.delete("/admin/company-requests/{request_id}")
async def reject_company_request(
    request_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Reject/delete a company request."""
    success = crud.reject_request(db, request_id)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"detail": "Request rejected"}
