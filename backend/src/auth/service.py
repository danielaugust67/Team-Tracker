import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Union, Annotated
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from ..exceptions import AuthenticationError
from . import model as auth_model
from src.entities.users import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
if not SECRET_KEY:
    raise ValueError("SECRET_KEY tidak ditemukan. Harap atur variabel ini di file .env Anda.")
if not ALGORITHM:
    raise ValueError("ALGORITHM tidak ditemukan. Harap atur variabel ini di file .env Anda.")
if not ACCESS_TOKEN_EXPIRE_MINUTES:
    raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES tidak ditemukan. Harap atur variabel ini di file .env Anda.")

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Union[User, bool]:
    user = db.query(User).filter(User.username == username).first()
    
    # === PERBAIKAN LOGIKA KRITIS DI SINI ===
    # Kondisi yang benar adalah: jika user tidak ada ATAU password TIDAK cocok.
    if not user or not verify_password(password, user.hashed_password):
        logging.warning(f"Autentikasi gagal untuk user: {username}")
        return False
        
    return user

def create_access_token(username: str, expires_delta: timedelta) -> str:
    encode = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> auth_model.TokenData: # <-- PERBAIKAN: Gunakan model dari auth
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise AuthenticationError("Token tidak valid, username tidak ditemukan.")
        return auth_model.TokenData(username=username) # <-- PERBAIKAN: Gunakan model dari auth
    except JWTError as e:
        logging.error(f"Verifikasi token gagal: {e}")
        raise AuthenticationError("Token tidak bisa divalidasi.")

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> auth_model.TokenData:
    return verify_token(token)

# Gunakan model dari auth, bukan dari entities
CurrentUser = Annotated[auth_model.TokenData, Depends(get_current_user)]

def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
                           db: Session) -> auth_model.Token: # <-- PERBAIKAN: Gunakan model dari auth
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise AuthenticationError("Username atau password salah.")
    token = create_access_token(
        username=user.username, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return auth_model.Token(access_token=token, token_type="bearer")
                                            