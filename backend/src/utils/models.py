from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY, Enum as SQLEnum, func
from .database import Base
from datetime import datetime
import enum

class ResourceType(str, enum.Enum):
    video = "video"
    notes = "notes"
    practice = "practice"
    tools = "tools"

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    rating = Column(Float, default=0.0)
    difficulty = Column(Float, default=0.0)
    workload = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    resource_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    difficulty = Column(Integer, nullable=False)  # 1-5
    workload = Column(Integer, nullable=False)  # hours per week
    professor = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)  # e.g., "Fall 2024"
    review_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    url = Column(String(500), nullable=False)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    topic_tags = Column(ARRAY(String), default=[])  # PostgreSQL array of strings
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
