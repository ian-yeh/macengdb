from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.schemas import ExperienceResponse, ExperienceCreate, ExperienceSubmit
import src.crud.experience as crud
from src.utils.database import get_db
from typing import List

router = APIRouter()

@router.post("/experiences/submit", response_model=ExperienceResponse)
async def submit_experience(
        experience: ExperienceSubmit,
        db: Session = Depends(get_db),
    ):
    """
    Submit a new experience anonymously (no auth required).
    Requires a valid McMaster email address.
    """
    return crud.create_experience_anonymous(db, experience)

@router.get("/companies/{company_id}/experiences", response_model=List[ExperienceResponse])
async def get_company_experiences(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all experiences for a specific company.
    Used by the Company Page.

    Args:
        company_id (int): ID of the company

    Returns:
        List[ExperienceSchema]: List of experiences
    """
    return crud.get_experiences_by_company_id(db, company_id)
