from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.schemas import ExperienceResponse, ExperienceCreate
import src.crud.experience as crud
from src.utils.database import get_db
from src.utils.auth import get_current_user
from typing import List
#from src.models.user import UserModel

router = APIRouter()

@router.post("/experiences", response_model=ExperienceResponse)
async def create_experience(
        experience: ExperienceCreate,
        db: Session = Depends(get_db),    
        current_user = Depends(get_current_user)  # Uses mock user
    ):
    """
    Create a new experience.
    Used by the Company Page.

    Args:
        experience (ExperienceCreate): Experience object

    Returns:
        ExperienceSchema: Experience object
    """

    return crud.create_experience(db, experience, current_user.id)

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

