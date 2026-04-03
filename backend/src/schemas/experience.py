from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime


# Interview Stage schema (for JSON field)
class InterviewStage(BaseModel):
    name: str
    duration: Optional[str] = None
    questions: List[str] = []


# Experience Models
class ExperienceBase(BaseModel):
    position: str
    term: str
    offer_received: bool = False
    difficulty: int  # 1-5
    stages: List[InterviewStage] = []
    tips: Optional[str] = None
    interview_acquisition: Optional[str] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Difficulty must be between 1 and 5")
        return v


class ExperienceResponse(ExperienceBase):
    id: int
    user_id: Optional[int] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    new_company_name: Optional[str] = None
    submitter_email: str
    status: str = "pending"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExperienceCreate(ExperienceBase):
    company_id: int


class ExperienceSubmit(ExperienceBase):
    """Schema for anonymous experience submission (no auth required)."""

    company_id: Optional[int] = None
    new_company_name: Optional[str] = None
    submitter_email: str

    @field_validator("submitter_email")
    @classmethod
    def validate_mcmaster_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith("@mcmaster.ca"):
            raise ValueError("Must be a McMaster email address (@mcmaster.ca)")
        return v


class ExperienceUpdate(BaseModel):
    position: Optional[str] = None
    term: Optional[str] = None
    offer_received: Optional[bool] = None
    difficulty: Optional[int] = None
    stages: Optional[List[InterviewStage]] = None
    tips: Optional[str] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Difficulty must be between 1 and 5")
        return v
