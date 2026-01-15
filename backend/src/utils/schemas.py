from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class Program(str, Enum):
    SOFTWARE = "Software"
    ELECTRICAL = "Electrical"
    COMPUTER = "Computer"
    MECHANICAL = "Mechanical"
    MECHATRONICS = "Mechatronics"
    CIVIL = "Civil"
    CHEMICAL = "Chemical"
    MATERIALS = "Materials"
    ENGINEERING_PHYSICS = "Engineering Physics"


# Interview Stage schema (for JSON field)
class InterviewStage(BaseModel):
    name: str
    duration: Optional[str] = None
    questions: List[str] = []


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    program: Program
    graduation_year: int

    @field_validator('email')
    @classmethod
    def validate_mcmaster_email(cls, v: str) -> str:
        domain = v.split('@')[1]
        if domain not in ['mcmaster.ca', 'alumni.mcmaster.ca']:
            raise ValueError('Must use McMaster email (@mcmaster.ca or @alumni.mcmaster.ca)')
        return v


class User(UserBase):
    id: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Company Models
class CompanyBase(BaseModel):
    name: str
    industries: List[str] = []
    rating: float = 0.0


class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyCreate(CompanyBase):
    pass


# Experience Models
class ExperienceBase(BaseModel):
    position: str
    term: str
    offer_received: bool = False
    difficulty: int  # 1-5
    stages: List[InterviewStage] = []
    tips: Optional[str] = None

    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError('Difficulty must be between 1 and 5')
        return v


class Experience(ExperienceBase):
    id: int
    user_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExperienceCreate(ExperienceBase):
    company_id: int