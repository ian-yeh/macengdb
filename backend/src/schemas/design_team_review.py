from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class DesignTeamReviewBase(BaseModel):
    position: str
    term: str
    accepted: bool = True
    difficulty: int  # 1-5
    interview_acquisition: Optional[str] = None
    description: Optional[str] = None
    tips: Optional[str] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Difficulty must be between 1 and 5")
        return v


class DesignTeamReviewResponse(DesignTeamReviewBase):
    id: int
    design_team_id: int
    submitter_email: str
    status: str = "pending"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DesignTeamReviewSubmit(DesignTeamReviewBase):
    """Schema for submitting a design team review."""

    design_team_id: int
    submitter_email: str

    @field_validator("submitter_email")
    @classmethod
    def validate_mcmaster_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith("@mcmaster.ca"):
            raise ValueError("Must be a McMaster email address (@mcmaster.ca)")
        return v
