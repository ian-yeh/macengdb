from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY, Boolean, JSON, Enum as SQLEnum, func, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum


class Program(enum.Enum):
    SOFTWARE = "Software"
    ELECTRICAL = "Electrical"
    COMPUTER = "Computer"
    MECHANICAL = "Mechanical"
    MECHATRONICS = "Mechatronics"
    CIVIL = "Civil"
    CHEMICAL = "Chemical"
    MATERIALS = "Materials"
    ENGINEERING_PHYSICS = "Engineering Physics"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    program = Column(SQLEnum(Program), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    industries = Column(ARRAY(String(100)), nullable=False, default=[])
    rating = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    experiences = relationship("Experience", back_populates="company", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    position = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)
    offer_received = Column(Boolean, default=False, nullable=False)
    difficulty = Column(Integer, nullable=False)  # 1-5 scale
    stages = Column(JSON, nullable=False, default=[])  # Interview stages
    tips = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="experiences")
    company = relationship("Company", back_populates="experiences")