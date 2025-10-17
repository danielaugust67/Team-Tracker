from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List


from . import service as services
from . import model 
from ..auth.service import CurrentUser
from src.database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.post("/", response_model=model.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(current_user: CurrentUser, task: model.TaskCreate, db: Session = Depends(get_db)):
    return services.create_task(db=db, task_data=task)

@router.get("/", response_model=List[model.TaskResponse])
def read_tasks(current_user: CurrentUser, status_filter: str | None = None, db: Session = Depends(get_db)):
    tasks = services.get_task(db=db, status_filter=status_filter)
    return tasks

@router.get("/{task_id}", response_model=model.TaskResponse)
def read_task_by_id(current_user: CurrentUser, task_id: int, db: Session = Depends(get_db)):
    db_task = services.get_task_by_id(db=db, task_id=task_id)
    if db_task is None:
        # Service Anda sudah menangani ini, tapi ini adalah lapisan pengaman tambahan
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=model.TaskResponse)
def update_task(current_user: CurrentUser, task_id: int, task: model.TaskUpdate, db: Session = Depends(get_db)):
    return services.update_task(db=db, task_id=task_id, task_data=task)

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(current_user: CurrentUser, task_id: int, db: Session = Depends(get_db)):
    return services.delete_task(db=db, task_id=task_id)