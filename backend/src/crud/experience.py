from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from src.models.experience import ExperienceModel
from src.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceSubmit

def get_experience_by_id(db: Session, experience_id: int) -> Optional[ExperienceModel]:
    """Get a specific experience by ID"""
    return db.query(ExperienceModel)\
        .options(joinedload(ExperienceModel.company))\
        .filter(ExperienceModel.id == experience_id)\
        .first()

def get_experiences_by_company_id(db: Session, company_id: int) -> List[ExperienceModel]:
    """Get all experiences for a specific company"""
    return db.query(ExperienceModel)\
        .filter(ExperienceModel.company_id == company_id)\
        .all()

def get_experiences_by_user_id(db: Session, user_id: int) -> List[ExperienceModel]:
    """Get all experiences created by a specific user"""
    return db.query(ExperienceModel)\
        .filter(ExperienceModel.user_id == user_id)\
        .all()

def get_all_experiences(db: Session, skip: int = 0, limit: int = 100) -> List[ExperienceModel]:
    """Get all experiences with pagination"""
    return db.query(ExperienceModel)\
        .options(joinedload(ExperienceModel.company))\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_experience(
    db: Session, 
    experience: ExperienceCreate, 
    user_id: int
) -> ExperienceModel:
    """Create a new experience"""
    # Convert InterviewStage objects to dicts for JSON storage
    stages_data = [stage.model_dump() for stage in experience.stages]
    
    db_experience = ExperienceModel(
        user_id=user_id,  # From auth token, not from request
        company_id=experience.company_id,
        position=experience.position,
        term=experience.term,
        offer_received=experience.offer_received,
        difficulty=experience.difficulty,
        stages=stages_data,  # Store as JSON
        tips=experience.tips
    )

    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def create_experience_anonymous(
    db: Session, 
    experience: ExperienceSubmit
) -> ExperienceModel:
    """Create a new experience from anonymous submission (no auth)"""
    stages_data = [stage.model_dump() for stage in experience.stages]
    
    db_experience = ExperienceModel(
        submitter_email=experience.submitter_email,
        company_id=experience.company_id,
        position=experience.position,
        term=experience.term,
        offer_received=experience.offer_received,
        difficulty=experience.difficulty,
        stages=stages_data,
        tips=experience.tips
    )

    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def update_experience(
    db: Session, 
    experience_id: int, 
    experience: ExperienceUpdate
) -> Optional[ExperienceModel]:
    """Update an existing experience"""
    db_experience = get_experience_by_id(db, experience_id)
    if not db_experience:
        return None
    
    update_data = experience.model_dump(exclude_unset=True)
    
    # Handle stages separately (convert to JSON)
    if "stages" in update_data and update_data["stages"] is not None:
        update_data["stages"] = [stage.model_dump() for stage in update_data["stages"]]
    
    for field, value in update_data.items():
        setattr(db_experience, field, value)
    
    db.commit()
    db.refresh(db_experience)
    return db_experience

def delete_experience(db: Session, experience_id: int) -> bool:
    """Delete an experience"""
    db_experience = get_experience_by_id(db, experience_id)
    if not db_experience:
        return False
    
    db.delete(db_experience)
    db.commit()
    return True
