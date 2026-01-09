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

def get_all_courses() -> List[Course]:
    """Get all courses from database"""
    from src.utils.models import Course
    db = SessionLocal()
    try:
        return db.query(Course).all()
    finally:
        db.close()

def get_course_by_id(course_id: int):
    """Get a specific course by ID"""
    from src.utils.models import Course
    db = SessionLocal()
    try:
        return db.query(Course).filter(Course.id == course_id).first()
    finally:
        db.close()

def get_reviews_by_course_id(course_id: int):
    """Get all reviews for a specific course"""
    from src.utils.models import Review
    db = SessionLocal()
    try:
        return db.query(Review).filter(Review.course_id == course_id).all()
    finally:
        db.close()

def get_resources_by_course_id(course_id: int):
    """Get all resources for a specific course"""
    from src.utils.models import Resource
    db = SessionLocal()
    try:
        return db.query(Resource).filter(Resource.course_id == course_id).all()
    finally:
        db.close()