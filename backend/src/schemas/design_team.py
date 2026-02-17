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
    avg_rating: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DesignTeamCreate(DesignTeamBase):
    pass
