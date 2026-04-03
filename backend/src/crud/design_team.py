from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from src.models.design_team import DesignTeamModel
from src.models.design_team_review import DesignTeamReviewModel
from src.schemas.design_team import DesignTeamCreate, DesignTeamUpdate
from typing import Optional


def get_all_design_teams(
    db: Session,
    category: Optional[str] = None,
):
    query = (
        db.query(
            DesignTeamModel,
            func.count(DesignTeamReviewModel.id)
            .filter(DesignTeamReviewModel.status == "approved")
            .label("review_count"),
            func.avg(DesignTeamReviewModel.difficulty)
            .filter(DesignTeamReviewModel.status == "approved")
            .label("avg_difficulty"),
        )
        .outerjoin(
            DesignTeamReviewModel,
            DesignTeamModel.id == DesignTeamReviewModel.design_team_id,
        )
        .group_by(DesignTeamModel.id)
    )

    if category:
        query = query.filter(DesignTeamModel.categories.any(category))

    # Sort by review count descending, then by name ascending
    results = query.order_by(text("review_count DESC"), DesignTeamModel.name).all()

    teams = []
    for team, review_count, avg_difficulty in results:
        team.review_count = review_count
        team.avg_difficulty = round(avg_difficulty, 1) if avg_difficulty else None
        teams.append(team)
    return teams


def get_design_team(db: Session, team_id: int):
    result = (
        db.query(
            DesignTeamModel,
            func.count(DesignTeamReviewModel.id)
            .filter(DesignTeamReviewModel.status == "approved")
            .label("review_count"),
            func.avg(DesignTeamReviewModel.difficulty)
            .filter(DesignTeamReviewModel.status == "approved")
            .label("avg_difficulty"),
        )
        .outerjoin(
            DesignTeamReviewModel,
            DesignTeamModel.id == DesignTeamReviewModel.design_team_id,
        )
        .filter(DesignTeamModel.id == team_id)
        .group_by(DesignTeamModel.id)
        .first()
    )
    if result:
        team, review_count, avg_difficulty = result
        team.review_count = review_count
        team.avg_difficulty = round(avg_difficulty, 1) if avg_difficulty else None
        return team
    return None


def create_design_team(db: Session, team: DesignTeamCreate):
    db_team = DesignTeamModel(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    db_team.review_count = 0
    db_team.avg_difficulty = None
    return db_team


def delete_design_team(db: Session, team_id: int) -> bool:
    """Delete a design team"""
    db_team = db.query(DesignTeamModel).filter(DesignTeamModel.id == team_id).first()
    if not db_team:
        return False

    db.delete(db_team)
    db.commit()
    return True


def update_design_team(
    db: Session, team_id: int, team: DesignTeamUpdate
) -> Optional[DesignTeamModel]:
    """Update a design team"""
    db_team = db.query(DesignTeamModel).filter(DesignTeamModel.id == team_id).first()
    if not db_team:
        return None

    update_data = team.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_team, field, value)

    db.commit()
    db.refresh(db_team)
    return db_team
