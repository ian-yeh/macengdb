from sqlalchemy import Column, Integer, String, DateTime
from src.utils.database import Base
from datetime import datetime


class DesignTeamRequestModel(Base):
    __tablename__ = "design_team_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    requester_email = Column(String(255), nullable=True)
    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
