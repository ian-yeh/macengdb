from fastapi import APIRouter
from typing import List
from src.utils.schemas import Company
from src.utils.database import get_all_companies, get_company_by_id
from src.utils.models import Company as CompanyModel
from src.utils.database import get_reviews_by_company_id
from src.utils.schemas import ReviewBase as Review

router = APIRouter()

@router.get("/companies", response_model=List[Company])
async def get_companies():
    """
    Get all companies.
    Used by the Landing Page.
    """
    return get_all_companies()

@router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: int):
    """
    Get a specific company by ID.
    Used by the Company Page.
    """
    return get_company_by_id(company_id)

@router.get("/companies/{company_id}/reviews", response_model=List[Review])
async def get_company_reviews(company_id: int):
    """
    Get all reviews for a specific company.
    Used by the Company Page.
    """
    return get_reviews_by_company_id(company_id)

