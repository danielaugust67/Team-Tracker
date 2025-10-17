import enum
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class StatusEnum(str, enum.Enum):
    BELUM_DIMULAI = "Belum Dimulai"
    SEDANG_DIKERJAKAN = "Sedang Dikerjakan"
    SELESAI = "Selesai"
    
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    status = Column(String, default=StatusEnum.BELUM_DIMULAI, nullable=False)
    created_at = Column(TIMESTAMP, server_default="NOW()")
    start_date = Column(TIMESTAMP, nullable=True)
    end_date = Column(TIMESTAMP, nullable=True)

    logs = relationship("TaskLog", back_populates="task",cascade="all, delete-orphan")
    member = relationship("Member", back_populates="tasks",)