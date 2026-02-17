from sqlalchemy.orm import Session
from src.models.design_team_review import DesignTeamReviewModel
from src.schemas.design_team_review import DesignTeamReviewSubmit


def get_reviews_for_team(db: Session, team_id: int):
    return (
        db.query(DesignTeamReviewModel)
        .filter(
            DesignTeamReviewModel.design_team_id == team_id,
            DesignTeamReviewModel.status == "approved",
        )
        .order_by(DesignTeamReviewModel.created_at.desc())
        .all()
    )


def get_all_reviews(db: Session):
    """Get all reviews (for admin)."""
    return (
        db.query(DesignTeamReviewModel)
        .order_by(DesignTeamReviewModel.created_at.desc())
        .all()
    )


def create_review(db: Session, review: DesignTeamReviewSubmit):
    db_review = DesignTeamReviewModel(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
