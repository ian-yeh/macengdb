from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from src.utils.database import Base
from datetime import datetime

class ExperienceModel(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for anonymous submissions
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    submitter_email = Column(String(255), nullable=False)  # McMaster email for tracking
    position = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)
    offer_received = Column(Boolean, default=False, nullable=False)
    difficulty = Column(Integer, nullable=False)  # 1-5 scale
    stages = Column(JSON, nullable=False, default=[])  # Interview stages
    tips = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default='pending')  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="experiences")
    company = relationship("CompanyModel", back_populates="experiences")
