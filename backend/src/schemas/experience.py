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

    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError('Difficulty must be between 1 and 5')
        return v

class ExperienceResponse(ExperienceBase):
    id: int
    user_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExperienceCreate(ExperienceBase):
    company_id: int

class ExperienceUpdate(BaseModel):
    position: Optional[str] = None
    term: Optional[str] = None
    offer_received: Optional[bool] = None
    difficulty: Optional[int] = None
    stages: Optional[List[InterviewStage]] = None
    tips: Optional[str] = None
    
    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Difficulty must be between 1 and 5')
        return v
