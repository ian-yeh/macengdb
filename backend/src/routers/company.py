from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.schemas import CompanyResponse, CompanyCreate 
from src.crud.company import get_all_companies, get_company_by_id, create_company 
from src.utils.database import get_db

router = APIRouter()

@router.get("/companies", response_model=List[CompanyResponse])
async def get_companies(
    db: Session = Depends(get_db)
):
    """
    Get all companies.
    Used by the Landing Page.

    Returns:
        List[CompanySchema]: List of companies
    """
    return get_all_companies(db)

@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    db: Session = Depends(get_db),
    company_id: int
):
    """
    Get a specific company by ID.
    Used by the Company Page.

    Args:
        company_id (int): ID of the company

    Returns:
        CompanySchema: Company object
    """
    return get_company_by_id(db, company_id)

@router.post("/companies", response_model=CompanyResponse)
async def create_company(company: CompanyCreate):
    """
    Create a new company.
    Used by the Company Page.

    Args:
        company (CompanyCreate): Company object

    Returns:
        CompanySchema: Company object
    """
    return create_company(company)

