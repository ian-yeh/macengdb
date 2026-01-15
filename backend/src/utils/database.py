# app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List


load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_all_companies() -> List[Company]:
    """Get all companies from database"""
    from src.utils.models import Company
    db = SessionLocal()
    try:
        return db.query(Company).all()
    finally:
        db.close()

def get_company_by_id(company_id: int):
    """Get a specific company by ID"""
    from src.utils.models import Company
    db = SessionLocal()
    try:
        return db.query(Company).filter(Company.id == company_id).first()
    finally:
        db.close()

def get_reviews_by_company_id(company_id: int):
    """Get all reviews for a specific company"""
    from src.utils.models import CompanyReview
    db = SessionLocal()
    try:
        return db.query(CompanyReview).filter(CompanyReview.company_id == company_id).all()
    finally:
        db.close()