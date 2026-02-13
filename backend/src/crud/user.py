"""
CRUD operations for User model.
Users are authenticated via Supabase Auth - we store profile data linked by supabase_user_id.
"""

from sqlalchemy.orm import Session
from typing import Optional

from src.models import UserModel
from src.schemas import UserCreate


def get_user_by_supabase_id(db: Session, supabase_user_id: str) -> Optional[UserModel]:
    """Get user by their Supabase auth user ID."""
    return (
        db.query(UserModel)
        .filter(UserModel.supabase_user_id == supabase_user_id)
        .first()
    )


def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    """Get user by email address."""
    return db.query(UserModel).filter(UserModel.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[UserModel]:
    """Get user by internal database ID."""
    return db.query(UserModel).filter(UserModel.id == user_id).first()


def create_user(db: Session, user: UserCreate, supabase_user_id: str) -> UserModel:
    """
    Create a new user profile linked to their Supabase auth account.

    This should be called after the user has signed up via Supabase Auth.
    The supabase_user_id comes from the JWT 'sub' claim.
    """
    db_user = UserModel(
        email=user.email,
        supabase_user_id=supabase_user_id,
        name=user.name,
        program=user.program,
        graduation_year=user.graduation_year,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: UserModel, updates: dict) -> UserModel:
    """Update user profile fields."""
    for key, value in updates.items():
        if hasattr(user, key) and key not in [
            "id",
            "supabase_user_id",
            "email",
            "created_at",
        ]:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def verify_user(db: Session, user: UserModel) -> UserModel:
    """Mark a user as verified."""
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user
