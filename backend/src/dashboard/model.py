# src/dashboard/model.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskSummary(BaseModel):
    """Model untuk ringkasan task berdasarkan status"""
    belum_dimulai: int = 0
    sedang_dikerjakan: int = 0
    selesai: int = 0
    total: int = 0

class MemberStats(BaseModel):
    """Model untuk statistik member"""
    member_id: int
    member_name: str
    task_count: int
    completed_tasks: int
    in_progress_tasks: int

class RecentActivity(BaseModel):
    """Model untuk aktivitas terbaru dari task log"""
    id: int
    task_id: int
    task_title: str
    member_name: str
    old_status: Optional[str] = None
    new_status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class TaskDeadline(BaseModel):
    """Model untuk task yang mendekati deadline"""
    id: int
    title: str
    member_name: str
    status: str
    tanggal_mulai: Optional[datetime] = None
    tanggal_selesai: Optional[datetime] = None
    days_remaining: int

class PerformanceMetric(BaseModel):
    """Model untuk metrik performa"""
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    avg_completion_days: Optional[float] = None
    overdue_tasks: int

class DashboardStats(BaseModel):
    """Model utama untuk response dashboard"""
    task_summary: TaskSummary
    member_stats: List[MemberStats]
    recent_activities: List[RecentActivity]
    upcoming_deadlines: List[TaskDeadline]
    performance_metrics: PerformanceMetric