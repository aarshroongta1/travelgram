from passlib.context import CryptContext
from fastapi import Cookie, Request
from jose import JWTError, jwt
from app.models.document import User
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hashed_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_pass: str):
    return pwd_context.verify(password, hashed_pass)

SECRET_KEY = os.getenv("AUTH_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def create_access_token(subject: int, expires_delta: Optional[timedelta] = None):
    if expires_delta:
        expires_delta = datetime.now(timezone.utc) + expires_delta
    else:
        expires_delta = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

def create_refresh_token(subject: int, expires_delta: Optional[timedelta] = None):
    if expires_delta:
        expires_delta = datetime.now(timezone.utc) + expires_delta
    else:
        expires_delta = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM) 

def get_current_user(access_token: str = Cookie(None), db: Session = Depends(get_db)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token decode failed")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user