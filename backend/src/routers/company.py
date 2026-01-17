from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.schemas import CompanyResponse, CompanyCreate 
import src.crud.company as crud
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
    return crud.get_all_companies(db)

@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
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
async def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new company.
    Used by the Company Page.

    Args:
        company (CompanyCreate): Company object

    Returns:
        CompanyModel: Company object
    """
    return crud.create_company(db, company)

