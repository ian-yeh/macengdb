"""
Defining the user model.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean,  Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.utils.database import Base
import enum
from datetime import datetime

class ProgramEnum(enum.Enum):
    SOFTWARE = "Software"
    ELECTRICAL = "Electrical"
    COMPUTER = "Computer"
    MECHANICAL = "Mechanical"
    MECHATRONICS = "Mechatronics"
    CIVIL = "Civil"
    CHEMICAL = "Chemical"
    MATERIALS = "Materials"
    ENGINEERING_PHYSICS = "Engineering Physics"

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    program = Column(SQLEnum(ProgramEnum), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    experiences = relationship("ExperienceModel", back_populates="user", cascade="all, delete-orphan")

