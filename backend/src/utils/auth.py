"""
Supabase JWT authentication utilities.
Validates JWTs from Supabase Auth and retrieves the current user.
"""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from src.utils.database import get_db
from src.crud.user import get_user_by_supabase_id

security = HTTPBearer()

# The JWT secret from your Supabase project settings
# Found in: Supabase Dashboard > Project Settings > API > JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Validate Supabase JWT and return the current user from the database.
    
    The JWT is obtained from the Authorization header (Bearer token).
    The 'sub' claim contains the Supabase user UUID which links to our users table.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    
    try:
        # Decode and validate the JWT
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=[ALGORITHM],
            audience="authenticated"
        )
        supabase_user_id: str = payload.get("sub")
        
        if supabase_user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Look up the user in our database using the Supabase user ID
    user = get_user_by_supabase_id(db, supabase_user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please complete registration."
        )
    
    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Optional authentication - returns None if no valid token provided.
    Useful for endpoints that work differently for authenticated vs anonymous users.
    """
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def get_supabase_user_id_from_token(token: str) -> str:
    """
    Extract the Supabase user ID from a JWT without database lookup.
    Useful during user registration when the user doesn't exist in our DB yet.
    """
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated"
        )
        supabase_user_id = payload.get("sub")
        if supabase_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        return supabase_user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
