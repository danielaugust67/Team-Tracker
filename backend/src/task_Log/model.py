from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TaskLogBase(BaseModel):
    old_status: str 
    new_status: str

class TaskLogCreate(TaskLogBase):
    task_id: int

class TaskLog(TaskLogBase):
    id: int
    old_status: str | None = None
    new_status: str
    timestamp: datetime
    task_id: int
    model_config = ConfigDict(from_attributes=True)
