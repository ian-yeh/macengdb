"""
Pydantic schemas for User API requests and responses.
Authentication is handled by Supabase - these schemas are for profile data.
"""

from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from enum import Enum
from typing import Optional


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


class UserBase(BaseModel):
    """Base user fields shared across schemas."""

    email: EmailStr
    name: str
    program: Program
    graduation_year: int

    @field_validator("email")
    @classmethod
    def validate_mcmaster_email(cls, v: str) -> str:
        domain = v.split("@")[1]
        if domain not in ["mcmaster.ca", "alumni.mcmaster.ca"]:
            raise ValueError(
                "Must use McMaster email (@mcmaster.ca or @alumni.mcmaster.ca)"
            )
        return v


class UserCreate(UserBase):
    """
    Schema for creating a new user profile after Supabase signup.
    No password field - authentication is handled by Supabase.
    """

    pass


class UserUpdate(BaseModel):
    """Schema for updating user profile fields."""

    name: Optional[str] = None
    program: Optional[Program] = None
    graduation_year: Optional[int] = None


class UserResponse(UserBase):
    """Full user response including database fields."""

    id: int
    is_verified: bool
    supabase_user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
