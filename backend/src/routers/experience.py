from fastapi import APIRouter
from src.schemas import ExperienceResponse, ExperienceCreate
import src.crud

router = APIRouter()

@router.post("/experiences", response_model=ExperienceResponse)
async def create_experience(experience: ExperienceCreate):
    """
    Create a new experience.
    Used by the Company Page.

    Args:
        experience (ExperienceCreate): Experience object

    Returns:
        ExperienceSchema: Experience object
    """
    return crud.create_experience(experience)

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
    return crud.get_experiences_by_company_id(company_id)

