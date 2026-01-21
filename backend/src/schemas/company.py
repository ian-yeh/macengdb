from pydantic import BaseModel
from typing import List
from datetime import datetime

# Company Models
class CompanyBase(BaseModel):
    # not used directly in requests - just for DRY principle
    name: str
    industries: List[str] = []
    rating: float = 0.0

class CompanyResponse(CompanyBase):
    id: int # unique company id
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CompanyCreate(CompanyBase):
    pass
