from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi import Cookie
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.auth.auth import get_current_user
from app.models.document import User
from app.schemas.user import UserCreate, UserOut
from app.auth.auth import create_access_token, create_refresh_token, verify_password, get_hashed_password
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("AUTH_KEY")
ALGORITHM = os.getenv("ALGORITHM")


router = APIRouter()

@router.post('/signup', response_model=UserOut)
def create_user(user: UserCreate, db:Session=Depends(get_db)):

    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")
    
    hashed_password = get_hashed_password(user.password)
    new_user = User(username=user.username, password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    response = JSONResponse(content={"message": "Login successful"})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=30 * 60,
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )

    return response

@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.username
    }

@router.post("/refresh")
def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token(subject=int(user_id))

    response = JSONResponse(content={"message": "Token refreshed"})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=30 * 60,
        path="/"
    )
    return response