import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
from jose import jwt
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Generates a secure SHA-256 password hash with salt."""
    salt = "cyber_defense_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against the hashed string."""
    return get_password_hash(plain_password) == hashed_password

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
