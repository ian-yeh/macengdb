from sqlalchemy.orm import Session, joinedload
from src.models.design_team_review import DesignTeamReviewModel
from src.schemas.design_team_review import DesignTeamReviewSubmit
from typing import List, Optional


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
        .options(joinedload(DesignTeamReviewModel.design_team))
        .order_by(DesignTeamReviewModel.created_at.desc())
        .all()
    )


def get_pending_reviews(db: Session) -> List[DesignTeamReviewModel]:
    """Get all pending design team reviews."""
    return (
        db.query(DesignTeamReviewModel)
        .options(joinedload(DesignTeamReviewModel.design_team))
        .filter(DesignTeamReviewModel.status == "pending")
        .order_by(DesignTeamReviewModel.created_at.desc())
        .all()
    )


def approve_review(db: Session, review_id: int) -> Optional[DesignTeamReviewModel]:
    """Approve a design team review."""
    review = (
        db.query(DesignTeamReviewModel)
        .filter(DesignTeamReviewModel.id == review_id)
        .first()
    )
    if not review:
        return None
    review.status = "approved"
    db.commit()
    db.refresh(review)
    return review


def reject_review(db: Session, review_id: int) -> Optional[DesignTeamReviewModel]:
    """Reject a design team review."""
    review = (
        db.query(DesignTeamReviewModel)
        .filter(DesignTeamReviewModel.id == review_id)
        .first()
    )
    if not review:
        return None
    review.status = "rejected"
    db.commit()
    db.refresh(review)
    return review


def delete_review(db: Session, review_id: int) -> bool:
    """Delete a design team review."""
    review = (
        db.query(DesignTeamReviewModel)
        .filter(DesignTeamReviewModel.id == review_id)
        .first()
    )
    if not review:
        return False
    db.delete(review)
    db.commit()
    return True


def create_review(db: Session, review: DesignTeamReviewSubmit):
    db_review = DesignTeamReviewModel(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
