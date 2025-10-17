from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


from src.task.model import TaskResponse 


class MemberBase(BaseModel):
    name: str
    role: Optional[str] = None



class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None


class MemberResponse(MemberBase):
    id: int
    created_at: datetime
    tasks: List[TaskResponse] = [] 


    model_config = ConfigDict(from_attributes=True)