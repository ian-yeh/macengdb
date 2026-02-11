"""
Supabase JWT authentication utilities.
Validates JWTs from Supabase Auth and retrieves the current user.
Supports ES256 (asymmetric) tokens using JWKS public key.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory (3 levels up from this file)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
print(f"DEBUG: Loading .env from: {env_path}")
print(f"DEBUG: .env exists: {env_path.exists()}")
load_dotenv(env_path)

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode
from sqlalchemy.orm import Session
from functools import lru_cache

from src.utils.database import get_db
from src.crud.user import get_user_by_supabase_id

security = HTTPBearer()

# Supabase project URL - needed to fetch JWKS for ES256 tokens
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Fallback: JWT secret for HS256 tokens (older Supabase projects)
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

print(f"DEBUG: SUPABASE_URL loaded: {SUPABASE_URL}")


@lru_cache(maxsize=1)
def get_jwks():
    """
    Fetch and cache the JWKS (JSON Web Key Set) from Supabase.
    This contains the public keys needed to verify ES256 tokens.
    """
    if not SUPABASE_URL:
        print("ERROR: SUPABASE_URL not set, cannot fetch JWKS")
        return None
    
    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    print(f"DEBUG: Fetching JWKS from {jwks_url}")
    
    try:
        response = httpx.get(jwks_url, timeout=10)
        response.raise_for_status()
        jwks_data = response.json()
        print(f"DEBUG: Got JWKS with {len(jwks_data.get('keys', []))} keys")
        return jwks_data
    except Exception as e:
        print(f"ERROR: Failed to fetch JWKS: {e}")
        return None


def get_public_key_from_jwks(token: str):
    """
    Get the appropriate public key from JWKS based on the token's 'kid' header.
    """
    jwks = get_jwks()
    if not jwks or "keys" not in jwks:
        return None
    
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        alg = unverified_header.get("alg")
        print(f"DEBUG: Token kid={kid}, alg={alg}")
        
        for key in jwks["keys"]:
            if key.get("kid") == kid:
                print(f"DEBUG: Found matching key in JWKS")
                return key
        
        # If no kid match, return first key
        if jwks["keys"]:
            print(f"DEBUG: No kid match, using first key")
            return jwks["keys"][0]
            
    except Exception as e:
        print(f"ERROR: Failed to get public key: {e}")
    
    return None


def decode_jwt(token: str) -> dict:
    """
    Decode and validate a Supabase JWT.
    Supports both ES256 (asymmetric) and HS256 (symmetric) tokens.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
        print(f"DEBUG: Token algorithm: {alg}")
        
        if alg in ["ES256", "RS256"]:
            # Asymmetric algorithm - need JWKS public key
            public_key = get_public_key_from_jwks(token)
            if not public_key:
                raise JWTError("Could not get public key from JWKS")
            
            payload = jwt.decode(
                token,
                public_key,
                algorithms=[alg],
                options={"verify_aud": False}
            )
        else:
            # Symmetric algorithm (HS256) - use JWT secret
            if not SUPABASE_JWT_SECRET:
                raise JWTError("SUPABASE_JWT_SECRET not set for HS256 token")
            
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        
        return payload
        
    except JWTError:
        raise
    except Exception as e:
        raise JWTError(f"Token decode failed: {e}")


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
    print(f"DEBUG: Token length: {len(token)}")
    
    try:
        payload = decode_jwt(token)
        supabase_user_id: str = payload.get("sub")
        print(f"DEBUG: Successfully decoded JWT, user_id: {supabase_user_id}")
        
        if supabase_user_id is None:
            raise credentials_exception
            
    except JWTError as e:
        print(f"DEBUG: JWT decode error: {type(e).__name__}: {e}")
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
        payload = decode_jwt(token)
        supabase_user_id = payload.get("sub")
        if supabase_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        return supabase_user_id
    except JWTError as e:
        print(f"DEBUG: Registration JWT error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
