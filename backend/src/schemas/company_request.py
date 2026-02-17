from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CompanyRequestCreate(BaseModel):
    name: str
    requester_email: Optional[str] = None


class CompanyRequestUpdate(BaseModel):
    name: str


class CompanyRequestResponse(BaseModel):
    id: int
    name: str
    requester_email: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
