# CRUD operations for database queries
from typing import List
from src.utils.database import SessionLocal

def get_all_companies() -> List[Company]:
    """Get all companies from database
    
    Returns:
        List[Company]: List of all companies in the database
    """
    from src.utils.models import Company
    from src.utils.schemas import Company as CompanySchema
    db = SessionLocal()
    try:
        companies = db.query(Company).all()

        company_arr = []

        for company in companies:
            converted_company_to_schema = CompanySchema.model_validate(company)
            company_arr.append(converted_company_to_schema)

        print(company_arr)
        return company_arr
    finally:
        db.close()

def get_company_by_id(company_id: int):
    """Get a specific company by ID"""
    from src.utils.models import Company
    from src.utils.schemas import Company as CompanySchema
    db = SessionLocal()
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        return CompanySchema.model_validate(company)
    finally:
        db.close()

def get_experiences_by_company_id(company_id: int):
    """Get all experiences for a specific company"""
    from src.utils.models import Experience
    from src.utils.schemas import Experience as ExperienceSchema
    db = SessionLocal()
    try:
        experiences = db.query(Experience).filter(Experience.company_id == company_id).all()
        print(experiences)
        experience_arr = []

        for experience in experiences:
            converted_experience_to_schema = ExperienceSchema.model_validate(experience)
            experience_arr.append(converted_experience_to_schema)

        print(experience_arr)
        return experience_arr
    finally:
        db.close()