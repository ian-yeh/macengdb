from sqlalchemy.orm import Session
from typing import List, Optional

from src.models.company_request import CompanyRequestModel
from src.models.company import CompanyModel

def create_company_request(db: Session, name: str) -> CompanyRequestModel:
    """Create a new company request"""
    db_request = CompanyRequestModel(name=name.strip(), status='pending')
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_pending_requests(db: Session) -> List[CompanyRequestModel]:
    """Get all pending company requests"""
    return db.query(CompanyRequestModel)\
        .filter(CompanyRequestModel.status == 'pending')\
        .order_by(CompanyRequestModel.created_at.desc())\
        .all()

def approve_request(db: Session, request_id: int) -> Optional[CompanyModel]:
    """Approve a request — creates the company and marks request as approved"""
    req = db.query(CompanyRequestModel).filter(CompanyRequestModel.id == request_id).first()
    if not req:
        return None
    
    # Create the company
    company = CompanyModel(name=req.name, industries=[])
    db.add(company)
    req.status = 'approved'
    db.commit()
    db.refresh(company)
    return company

def reject_request(db: Session, request_id: int) -> bool:
    """Reject a company request"""
    req = db.query(CompanyRequestModel).filter(CompanyRequestModel.id == request_id).first()
    if not req:
        return False
    req.status = 'rejected'
    db.commit()
    return True
