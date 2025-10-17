from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from ..task_Log.model import TaskLog

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    member_id: Optional[int] = None
    status: Optional[str] = "Belum Dimulai"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    member_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    logs: List[TaskLog] = []
    model_config = ConfigDict(from_attributes=True)


