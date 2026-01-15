from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Company Models
class CompanyBase(BaseModel):
    name: str
    industry: str
    rating: float = 0.0
    review_count: int = 0

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
    title: str
    description: str

class Experience(ExperienceBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExperienceCreate(ExperienceBase):
    company_id: int