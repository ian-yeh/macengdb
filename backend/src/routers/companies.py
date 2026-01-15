from fastapi import APIRouter
from typing import List
from src.utils.schemas import Company as CompanySchema, Experience as ExperienceSchema
from src.utils.crud import get_all_companies, get_company_by_id, get_experiences_by_company_id

router = APIRouter()

@router.get("/companies", response_model=List[CompanySchema])
async def get_companies():
    """
    Get all companies.
    Used by the Landing Page.

    Returns:
        List[CompanySchema]: List of companies
    """
    return get_all_companies()

@router.get("/companies/{company_id}", response_model=CompanySchema)
async def get_company(company_id: int):
    """
    Get a specific company by ID.
    Used by the Company Page.

    Args:
        company_id (int): ID of the company

    Returns:
        CompanySchema: Company object
    """
    return get_company_by_id(company_id)

@router.get("/companies/{company_id}/experiences", response_model=List[ExperienceSchema])
async def get_company_experiences(company_id: int):
    """
    Get all experiences for a specific company.
    Used by the Company Page.

    Args:
        company_id (int): ID of the company

    Returns:
        List[ExperienceSchema]: List of experiences
    """
    return get_experiences_by_company_id(company_id)

