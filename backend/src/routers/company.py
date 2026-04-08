from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from src.schemas import CompanyResponse, CompanyCreate, CompanyUpdate
import src.crud.company as crud
from src.utils.database import get_db
import os

router = APIRouter()

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    raise RuntimeError("ADMIN_SECRET_KEY environment variable is required")


def verify_admin_key(x_admin_key: str = Header(...)):
    """Verify the admin API key from request header."""
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return x_admin_key


@router.get("/companies", response_model=List[CompanyResponse])
async def get_companies(
    industry: Optional[str] = None,
    min_rating: Optional[float] = None,
    has_offer: Optional[bool] = None,
    position: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get all companies with optional filters.
    Used by the Landing Page.

    Returns:
        List[CompanySchema]: List of companies
    """
    return crud.get_all_companies(
        db,
        industry=industry,
        min_rating=min_rating,
        has_offer=has_offer,
        position=position,
    )


@router.get("/companies/search", response_model=List[CompanyResponse])
async def search_companies(q: str = "", db: Session = Depends(get_db)):
    """
    Search companies by name (for form autocomplete).
    """
    if not q.strip():
        return crud.get_all_companies(db)
    return crud.search_companies_by_name(db, q)


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int, db: Session = Depends(get_db)):
    """
    Get a specific company by ID.
    Used by the Company Page.

    Args:
        company_id (int): ID of the company

    Returns:
        CompanyModel: Company object
    """
    return crud.get_company_by_id(db, company_id)


@router.post("/companies", response_model=CompanyResponse)
async def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """
    Create a new company.
    Used by the Company Page.

    Args:
        company (CompanyCreate): Company object

    Returns:
        CompanyModel: Company object
    """
    return crud.create_company(db, company)


@router.delete("/admin/companies/{company_id}")
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Delete a company (admin only)."""
    success = crud.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"detail": "Company deleted"}


@router.patch("/admin/companies/{company_id}", response_model=CompanyResponse)
async def update_company_admin(
    company_id: int,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    _admin_key: str = Depends(verify_admin_key),
):
    """Update a company (admin only)."""
    updated_company = crud.update_company(db, company_id, company)
    if not updated_company:
        raise HTTPException(status_code=404, detail="Company not found")
    return updated_company
