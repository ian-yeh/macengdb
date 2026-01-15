from pydantic import BaseModel, Field
from typing import List, Literal

# Company Models
class CompanyBase(BaseModel):
    name: str
    industry: str
    rating: float
    review_count: int = Field(alias="reviewCount")
    description: str | None = None

    class Config:
        populate_by_name = True

class Company(CompanyBase):
    id: int

    class Config:
        from_attributes = True
        populate_by_name = True

class CompanyCreate(CompanyBase):
    pass

class ReviewBase(BaseModel):
    company_id: int
    title: str
    rating: float
    review: str