from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated


from . import service as auth_service
from . import model as auth_model
from .. database import DbSession 
from src.entities.users import User

router = APIRouter(
    tags=["Authentication & Users"]
)

# --- Endpoint untuk Autentikasi ---

@router.post("/token", response_model=auth_model.Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession # <-- PERBAIKAN: Gunakan DbSession untuk dependency injection
):
    """Endpoint untuk login dan mendapatkan JWT."""
    # Kita panggil service dengan parameter yang benar
    return auth_service.login_for_access_token(form_data=form_data, db=db)
    
@router.get("/users/me", response_model=auth_model.User)
def read_current_user(
    current_user: auth_service.CurrentUser, # <-- PERBAIKAN: Cukup panggil CurrentUser
    db: DbSession # <-- PERBAIKAN: Gunakan DbSession
):
    """Endpoint untuk mendapatkan detail user yang sedang login."""
    # PERBAIKAN: Gunakan class 'users' yang sudah diimpor
    user = db.query(User).filter(User.username == current_user.username).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )
    return user
