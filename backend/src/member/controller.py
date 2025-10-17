from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from . import service as member_service
from . import model as member_schema
from ..auth.service import CurrentUser
from src.database import get_db

router = APIRouter(
    prefix="/members",
    tags=["Members"]
)

@router.post("/", 
             status_code=status.HTTP_201_CREATED, 
             response_model=member_schema.MemberResponse)
def create_member(current_user: CurrentUser, member: member_schema.MemberCreate, db: Session = Depends(get_db)):
    """Endpoint untuk membuat member baru."""
    return member_service.create_member(db=db, member_data=member)

@router.get("/", response_model=List[member_schema.MemberResponse])
def read_members(current_user: CurrentUser, db: Session = Depends(get_db)):
    """Endpoint untuk mendapatkan semua member."""
    return member_service.get_members(db=db)

@router.get("/{member_id}", response_model=member_schema.MemberResponse)
def read_member_by_id(current_user: CurrentUser, member_id: int, db: Session = Depends(get_db)):
    """Endpoint untuk mendapatkan detail satu member."""
    return member_service.get_member_by_id(db=db, member_id=member_id)

@router.put("/{member_id}", response_model=member_schema.MemberResponse)
def update_member(current_user: CurrentUser, member_id: int, member: member_schema.MemberUpdate, db: Session = Depends(get_db)):
    """Endpoint untuk memperbarui data member."""
    return member_service.update_member(db=db, member_id=member_id, member_data=member)

@router.delete("/{member_id}")
def delete_member(current_user: CurrentUser, member_id: int, db: Session = Depends(get_db)):
    """Endpoint untuk menghapus member."""
    return member_service.delete_member(db=db, member_id=member_id)