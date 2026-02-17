from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from src.utils.database import Base
from datetime import datetime


class DesignTeamReviewModel(Base):
    __tablename__ = "design_team_reviews"

    id = Column(Integer, primary_key=True, index=True)
    design_team_id = Column(Integer, ForeignKey("design_teams.id"), nullable=False)
    submitter_email = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    term = Column(String(50), nullable=False)
    time_commitment = Column(String(100), nullable=True)  # e.g. "10 hrs/week"
    rating = Column(Integer, nullable=False)  # 1-5 scale
    description = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)
    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    design_team = relationship("DesignTeamModel", back_populates="reviews")
