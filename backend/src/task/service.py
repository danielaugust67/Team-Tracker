from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from . import model
from src.entities.member import Member
from src.entities.task import Task
from src.entities.task_log import TaskLog
from src.exceptions import TaskCreationError, TaskNotFoundError, TaskUpdateError, TaskDeletionError
import logging

def create_task(db: Session, task_data: model.TaskCreate) -> Task:
    try:
        new_task = Task(**task_data.dict())
        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        #Task Log
        db.add(TaskLog( 
            task_id=new_task.id,
            old_status=None,
            new_status=new_task.status,
        ))

        db.commit()
        return new_task
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating task: {e}")
        raise TaskCreationError(str(e))

def get_task(db: Session, status_filter: str | None = None) -> list[Task]:
    try:
        query = db.query(Task)
        if status_filter:
            query = query.filter(Task.status == status_filter)
        task = query.order_by(Task.created_at.desc()).all()
        return task
    except Exception as e:
        logging.error(f"Error retrieving tasks: {e}")
        raise TaskNotFoundError(str(e))
    
def get_task_by_id(db: Session, task_id: int) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise TaskNotFoundError(f"Tugas dengan ID {task_id} tidak ditemukan.")
    return task

def update_task(db: Session, task_id: int, task_data: model.TaskUpdate) -> Task:
    task_to_update = get_task_by_id(db, task_id)
    old_status = task_to_update.status
    old_member_id = task_to_update.member_id
    update_data = task_data.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(task_to_update, key, value)
        
        #log update status
        new_status = update_data.get("status")
        if new_status and new_status != old_status:
            db.add(TaskLog(
                task_id=task_to_update.id,
                old_status=old_status,
                new_status=new_status
            ))
        
        for key, value in update_data.items():
            setattr(task_to_update, key, value)

        db.commit()
        db.refresh(task_to_update)
        logging.info(f"Tugas dengan ID {task_id} berhasil diperbarui.")
        return task_to_update
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating task with ID {task_id}: {e}")
        raise TaskUpdateError(str(e))
    
def delete_task(db: Session, task_id: int):
    task_to_delete = get_task_by_id(db, task_id)
    try:
        db.delete(task_to_delete)
        db.commit()
        return {"detail": "Task deleted successfully."}
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting task {task_id}: {e}")
        raise TaskDeletionError(str(e))


