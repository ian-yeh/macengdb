from sqlalchemy import Column, Integer, String, Float, DateTime, ARRAY 
from sqlalchemy.orm import relationship
from src.utils.database import Base
from datetime import datetime

class CompanyModel(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    industries = Column(ARRAY(String(100)), nullable=False, default=[])
    rating = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    experiences = relationship("Experience", back_populates="company", cascade="all, delete-orphan")

