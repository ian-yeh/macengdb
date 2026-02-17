from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from src.utils.database import get_db
from src.schemas.design_team import DesignTeamResponse, DesignTeamCreate
from src.schemas.design_team_review import (
    DesignTeamReviewResponse,
    DesignTeamReviewSubmit,
)
from src.crud import design_team as team_crud
from src.crud import design_team_review as review_crud

router = APIRouter(tags=["Design Teams"])


@router.get("/design-teams", response_model=List[DesignTeamResponse])
async def get_design_teams(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return team_crud.get_all_design_teams(db, category=category)


@router.get("/design-teams/{team_id}", response_model=DesignTeamResponse)
async def get_design_team(team_id: int, db: Session = Depends(get_db)):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return team


@router.get(
    "/design-teams/{team_id}/reviews",
    response_model=List[DesignTeamReviewResponse],
)
async def get_design_team_reviews(
    team_id: int, db: Session = Depends(get_db)
):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    return review_crud.get_reviews_for_team(db, team_id)


@router.post(
    "/design-teams/{team_id}/reviews",
    response_model=DesignTeamReviewResponse,
    status_code=201,
)
async def submit_design_team_review(
    team_id: int,
    review: DesignTeamReviewSubmit,
    db: Session = Depends(get_db),
):
    team = team_crud.get_design_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Design team not found")
    review.design_team_id = team_id
    return review_crud.create_review(db, review)
