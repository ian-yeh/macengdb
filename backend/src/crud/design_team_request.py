from sqlalchemy.orm import Session
from typing import List, Optional

from src.models.design_team_request import DesignTeamRequestModel
from src.models.design_team import DesignTeamModel


def create_request(
    db: Session, name: str, requester_email: Optional[str] = None
) -> DesignTeamRequestModel:
    """Create a new design team request"""
    db_request = DesignTeamRequestModel(
        name=name.strip(),
        requester_email=requester_email.strip() if requester_email else None,
        status="pending",
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_pending_requests(db: Session) -> List[DesignTeamRequestModel]:
    """Get all pending design team requests"""
    return (
        db.query(DesignTeamRequestModel)
        .filter(DesignTeamRequestModel.status == "pending")
        .order_by(DesignTeamRequestModel.created_at.desc())
        .all()
    )


def approve_request(
    db: Session, request_id: int, categories: List[str] = []
) -> Optional[DesignTeamModel]:
    """Approve a request — creates the design team and marks request as approved"""
    req = (
        db.query(DesignTeamRequestModel)
        .filter(DesignTeamRequestModel.id == request_id)
        .first()
    )
    if not req:
        return None

    # Create the design team
    team = DesignTeamModel(name=req.name, categories=categories)
    db.add(team)
    req.status = "approved"
    db.commit()
    db.refresh(team)
    return team


def update_request_name(
    db: Session, request_id: int, new_name: str
) -> Optional[DesignTeamRequestModel]:
    """Update the name of a pending design team request"""
    req = (
        db.query(DesignTeamRequestModel)
        .filter(DesignTeamRequestModel.id == request_id)
        .first()
    )
    if not req:
        return None
    req.name = new_name.strip()
    db.commit()
    db.refresh(req)
    return req


def reject_request(db: Session, request_id: int) -> bool:
    """Reject a design team request"""
    req = (
        db.query(DesignTeamRequestModel)
        .filter(DesignTeamRequestModel.id == request_id)
        .first()
    )
    if not req:
        return False
    req.status = "rejected"
    db.commit()
    return True


def bulk_reject_requests(db: Session, request_ids: List[int]) -> int:
    """Reject multiple design team requests"""
    count = (
        db.query(DesignTeamRequestModel)
        .filter(DesignTeamRequestModel.id.in_(request_ids))
        .update({DesignTeamRequestModel.status: "rejected"}, synchronize_session=False)
    )
    db.commit()
    return count
