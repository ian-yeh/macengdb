from pydantic import BaseModel, EmailStr, field_validator
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

class UserResponse(UserBase):
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
