from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DesignTeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    categories: List[str] = []
    website_url: Optional[str] = None


class DesignTeamResponse(DesignTeamBase):
    id: int
    review_count: int = 0
    avg_difficulty: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DesignTeamCreate(DesignTeamBase):
    pass


class DesignTeamApprove(BaseModel):
    categories: List[str] = []


class DesignTeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    website_url: Optional[str] = None
