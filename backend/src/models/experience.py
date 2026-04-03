from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from src.utils.database import Base
from typing import Optional
from datetime import datetime


class ExperienceModel(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # Nullable for anonymous submissions
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    new_company_name = Column(String(255), nullable=True)  # For companies not yet in DB
    submitter_email = Column(String(255), nullable=False)  # McMaster email for tracking
    position = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)
    offer_received = Column(Boolean, default=False, nullable=False)
    difficulty = Column(Integer, nullable=False)  # 1-5 scale
    stages = Column(JSON, nullable=False, default=[])  # Interview stages
    tips = Column(Text, nullable=True)
    interview_acquisition = Column(String(255), nullable=True)
    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("UserModel", back_populates="experiences")
    company = relationship("CompanyModel", back_populates="experiences")

    @property
    def company_name(self) -> Optional[str]:
        if self.company:
            return self.company.name
        return None
