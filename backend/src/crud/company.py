from sqlalchemy.orm import Session
from typing import List, Optional

from src.models import CompanyModel
from src.schemas import CompanyCreate#, CompanyUpdate

def get_all_companies(db: Session) -> List[CompanyModel]:
    """Get all companies from database"""
    return db.query(CompanyModel).all()

def get_company_by_id(db: Session, company_id: int) -> Optional[CompanyModel]:
    """Get a specific company by ID"""
    return db.query(CompanyModel).filter(CompanyModel.id == company_id).first()

def get_company_by_name(db: Session, name: str) -> Optional[CompanyModel]:
    """Get a company by exact name"""
    return db.query(CompanyModel).filter(CompanyModel.name == name).first()

def search_companies_by_name(db: Session, query: str, limit: int = 10) -> List[CompanyModel]:
    """Search companies by name (case-insensitive)"""
    return db.query(CompanyModel)\
        .filter(CompanyModel.name.ilike(f"%{query}%"))\
        .limit(limit)\
        .all()

def create_company(db: Session, company: CompanyCreate) -> CompanyModel:
    """Create a new company"""
    db_company = CompanyModel(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int) -> bool:
    """Delete a company"""
    db_company = get_company_by_id(db, company_id)
    if not db_company:
        return False
    
    db.delete(db_company)
    db.commit()
    return True

#def update_company(db: Session, company_id: int, company: CompanyUpdate) -> Optional[CompanyModel]:
#    """Update an existing company"""
#    db_company = get_company_by_id(db, company_id)
#    if not db_company:
#        return None
#    
#    update_data = company.model_dump(exclude_unset=True)
#    for field, value in update_data.items():
#        setattr(db_company, field, value)
#    
#    db.commit()
#    db.refresh(db_company)
#    return db_company

