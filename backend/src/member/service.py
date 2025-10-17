from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import logging

from . import model as member_schema
from src.entities.member import Member
from src.exceptions import MemberCreationError, MemberNotFoundError, MemberUpdateError, MemberDeletionError

def create_member(db: Session, member_data: member_schema.MemberCreate) -> Member:
    existing_member = db.query(Member).filter(Member.name == member_data.name).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Member dengan nama '{member_data.name}' sudah ada."
        )
    
    try:
        new_member = Member(**member_data.model_dump())
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        logging.info(f"Member '{new_member.name}' berhasil dibuat.")
        return new_member
    except Exception as e:
        db.rollback()
        logging.error(f"Gagal membuat member: {e}")
        raise MemberCreationError(str(e))

def get_members(db: Session) -> list[Member]:
    try:
        members = db.query(Member).order_by(Member.id).all()
        return members
    except Exception as e:
        logging.error(f"Error retrieving members: {e}")
        raise MemberNotFoundError(str(e))

def get_member_by_id(db: Session, member_id: int) -> Member:
    member = db.get(Member, member_id)
    if not member:
        raise MemberNotFoundError(member_id)
    return member

def update_member(db: Session, member_id: int, member_data: member_schema.MemberUpdate) -> Member:
    member_to_update = get_member_by_id(db, member_id)
    update_data = member_data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != member_to_update.name:
        existing_member = db.query(Member).filter(Member.name == update_data["name"]).first()
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Nama '{update_data['name']}' sudah digunakan oleh member lain."
            )

    try:
        for key, value in update_data.items():
            setattr(member_to_update, key, value)
        
        db.commit()
        db.refresh(member_to_update)
        logging.info(f"Member dengan ID {member_id} berhasil diperbarui.")
        return member_to_update
    except Exception as e:
        db.rollback()
        logging.error(f"Gagal memperbarui member {member_id}: {e}")
        raise MemberUpdateError(str(e))

def delete_member(db: Session, member_id: int):
    """Menghapus member, dengan pengecekan tugas yang masih aktif."""
    member_to_delete = get_member_by_id(db, member_id)

    if member_to_delete.tasks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tidak dapat menghapus member '{member_to_delete.name}' karena masih memiliki tugas aktif."
        )
    
    try:
        db.delete(member_to_delete)
        db.commit()
        logging.info(f"Member dengan ID {member_id} berhasil dihapus.")
        return {"detail": f"Member '{member_to_delete.name}' berhasil dihapus."}
    except Exception as e:
        db.rollback()
        logging.error(f"Gagal menghapus member {member_id}: {e}")
        raise MemberDeletionError(str(e))