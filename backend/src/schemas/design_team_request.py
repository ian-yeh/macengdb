from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DesignTeamRequestCreate(BaseModel):
    name: str
    requester_email: Optional[str] = None


class DesignTeamRequestUpdate(BaseModel):
    name: str


class DesignTeamRequestResponse(BaseModel):
    id: int
    name: str
    requester_email: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
