from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY, Enum as SQLEnum, func
from .database import Base
from datetime import datetime
import enum

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False, index=True)
    rating = Column(Float, default=0.0, nullable=False)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)