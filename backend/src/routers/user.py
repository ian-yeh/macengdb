"""
User API routes.
All authentication is handled by Supabase - these endpoints manage user profiles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.schemas import UserCreate, UserUpdate, UserResponse
from src.crud import user as user_crud
from src.utils.database import get_db
from src.utils.auth import get_current_user, get_supabase_user_id_from_token

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Register a new user profile after Supabase signup.
    
    The user must have already signed up via Supabase Auth.
    Pass the Supabase access token in the Authorization header.
    """
    # Extract Supabase user ID from the JWT
    supabase_user_id = get_supabase_user_id_from_token(credentials.credentials)
    
    # Check if user already exists
    existing_user = user_crud.get_user_by_supabase_id(db, supabase_user_id)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile already exists"
        )
    
    # Check if email is already taken
    existing_email = user_crud.get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the user profile
    return user_crud.create_user(db, user_data, supabase_user_id)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get the current authenticated user's profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    updates: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current authenticated user's profile."""
    update_data = updates.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    return user_crud.update_user(db, current_user, update_data)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get a user's public profile by ID."""
    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
