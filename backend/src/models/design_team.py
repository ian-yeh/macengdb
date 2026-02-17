from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
from sqlalchemy.orm import relationship
from src.utils.database import Base
from datetime import datetime


class DesignTeamModel(Base):
    __tablename__ = "design_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    categories = Column(ARRAY(String(100)), nullable=False, default=[])
    website_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    reviews = relationship(
        "DesignTeamReviewModel",
        back_populates="design_team",
        cascade="all, delete-orphan",
    )
