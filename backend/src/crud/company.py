from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.models import CompanyModel
from src.models.experience import ExperienceModel
from src.schemas import CompanyCreate, CompanyUpdate


def get_all_companies(
    db: Session,
    industry: Optional[str] = None,
    min_rating: Optional[float] = None,
    has_offer: Optional[bool] = None,
    position: Optional[str] = None,
):
    """Get all companies with applied filters and approved experience counts"""
    # Base query for companies and experience counts
    query = db.query(
        CompanyModel, func.count(ExperienceModel.id).label("experience_count")
    ).outerjoin(
        ExperienceModel,
        (CompanyModel.id == ExperienceModel.company_id)
        & (ExperienceModel.status == "approved"),
    )

    # Apply Industry filter
    if industry:
        query = query.filter(CompanyModel.industries.any(industry))

    # Apply Rating filter
    if min_rating:
        query = query.filter(CompanyModel.rating >= min_rating)

    # Apply filters that involve ExperienceModel
    if has_offer is not None or position:
        # We need a subquery or exist check to ensure we only get companies
        # that have at least one experience matching these criteria
        # However, since we are already joining ExperienceModel, we can filter on it
        # BUT we must be careful not to exclude the company if it has multiple experiences
        # and only one matches. Actually, if we filter on ExperienceModel fields here,
        # it might affect the count or exclude the company entirely.

        # Correct approach: Filter the companies based on existence of such experiences
        if has_offer:
            query = query.filter(
                CompanyModel.experiences.any(
                    ExperienceModel.offer_received
                    & (ExperienceModel.status == "approved")
                )
            )

        if position:
            query = query.filter(
                CompanyModel.experiences.any(
                    (ExperienceModel.position.ilike(f"%{position}%"))
                    & (ExperienceModel.status == "approved")
                )
            )

    results = query.group_by(CompanyModel.id).all()

    for company, count in results:
        company.experience_count = count
    return [company for company, _ in results]


def get_company_by_id(db: Session, company_id: int) -> Optional[CompanyModel]:
    """Get a specific company by ID"""
    return db.query(CompanyModel).filter(CompanyModel.id == company_id).first()


def get_company_by_name(db: Session, name: str) -> Optional[CompanyModel]:
    """Get a company by exact name"""
    return db.query(CompanyModel).filter(CompanyModel.name == name).first()


def search_companies_by_name(
    db: Session, query: str, limit: int = 10
) -> List[CompanyModel]:
    """Search companies by name (case-insensitive)"""
    return (
        db.query(CompanyModel)
        .filter(CompanyModel.name.ilike(f"%{query}%"))
        .limit(limit)
        .all()
    )


def create_company(db: Session, company: CompanyCreate) -> CompanyModel:
    """Create a new company"""

    db_company = CompanyModel(company.name, company.industries, company.rating)
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


def update_company(
    db: Session, company_id: int, company: CompanyUpdate
) -> Optional[CompanyModel]:
    """Update an existing company"""
    db_company = get_company_by_id(db, company_id)
    if not db_company:
        return None

    update_data = company.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)

    db.commit()
    db.refresh(db_company)
    return db_company
