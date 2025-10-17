# src/dashboard/service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from datetime import datetime, timedelta
from typing import List

from . import model as dashboard_model
from ..entities.task import Task
from ..entities.member import Member
from ..entities.task_log import TaskLog


def get_task_summary(db: Session) -> dashboard_model.TaskSummary:
    """
    Menghitung ringkasan task berdasarkan status
    """
    # Query count berdasarkan status
    status_counts = db.query(
        Task.status,
        func.count(Task.id).label('count')
    ).group_by(Task.status).all()
    
    # Inisialisasi default values
    summary = {
        "belum_dimulai": 0,
        "sedang_dikerjakan": 0,
        "selesai": 0,
        "total": 0
    }
    
    # Mapping status ke format yang konsisten
    status_mapping = {
        "Belum Dimulai": "belum_dimulai",
        "Sedang Dikerjakan": "sedang_dikerjakan",
        "Selesai": "selesai"
    }
    
    for status, count in status_counts:
        key = status_mapping.get(status, status.lower().replace(" ", "_"))
        summary[key] = count
        summary["total"] += count
    
    return dashboard_model.TaskSummary(**summary)


def get_member_statistics(db: Session) -> List[dashboard_model.MemberStats]:
    """
    Mendapatkan statistik member berdasarkan jumlah task
    """
    member_stats = db.query(
        Member.id,
        Member.name,
        func.count(Task.id).label('task_count'),
        func.sum(
            case((Task.status == "Selesai", 1), else_=0)
        ).label('completed_tasks'),
        func.sum(
            case((Task.status == "Sedang Dikerjakan", 1), else_=0)
        ).label('in_progress_tasks')
    ).outerjoin(Task, Member.id == Task.member_id)\
     .group_by(Member.id, Member.name)\
     .order_by(func.count(Task.id).desc())\
     .limit(10)\
     .all()
    
    return [
        dashboard_model.MemberStats(
            member_id=stat.id,
            member_name=stat.name,
            task_count=stat.task_count or 0,
            completed_tasks=stat.completed_tasks or 0,
            in_progress_tasks=stat.in_progress_tasks or 0
        )
        for stat in member_stats
    ]


def get_recent_activities(db: Session, limit: int = 10) -> List[dashboard_model.RecentActivity]:
    """
    Mendapatkan aktivitas terbaru dari task log
    """
    activities = db.query(
        TaskLog.id,
        TaskLog.task_id,
        Task.title.label('task_title'),
        Member.name.label('member_name'),
        TaskLog.old_status,
        TaskLog.new_status,
        TaskLog.timestamp
    ).join(Task, TaskLog.task_id == Task.id)\
     .join(Member, Task.member_id == Member.id)\
     .order_by(TaskLog.timestamp.desc())\
     .limit(limit)\
     .all()
    
    return [
        dashboard_model.RecentActivity(
            id=activity.id,
            task_id=activity.task_id,
            task_title=activity.task_title,
            member_name=activity.member_name,
            old_status=activity.old_status,
            new_status=activity.new_status,
            timestamp=activity.timestamp
        )
        for activity in activities
    ]


def get_upcoming_deadlines(db: Session, days_ahead: int = 7) -> List[dashboard_model.TaskDeadline]:
    """
    Mendapatkan task yang mendekati deadline dalam X hari ke depan
    """
    today = datetime.now().date()
    deadline_date = today + timedelta(days=days_ahead)
    
    upcoming_tasks = db.query(
        Task.id,
        Task.title,
        Member.name.label('member_name'),
        Task.status,
        Task.start_date,
        Task.end_date
    ).join(Member, Task.member_id == Member.id)\
     .filter(
        and_(
            Task.end_date.isnot(None),
            Task.end_date >= today,
            Task.end_date <= deadline_date,
            Task.status != "Selesai"
        )
    ).order_by(Task.end_date.asc())\
     .all()
    
    return [
        dashboard_model.TaskDeadline(
            id=task.id,
            title=task.title,
            member_name=task.member_name,
            status=task.status,
            start_date=task.start_date,
            end_date=task.end_date,
            days_remaining=(task.end_date.date() - today).days if task.end_date else 0
        )
        for task in upcoming_tasks
    ]


def get_performance_metrics(db: Session) -> dashboard_model.PerformanceMetric:
    """
    Menghitung metrik performa keseluruhan
    """
    # Total tasks
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    
    # Completed tasks
    completed_tasks = db.query(func.count(Task.id))\
        .filter(Task.status == "Selesai").scalar() or 0
    
    # Completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
    
    # Average completion days (untuk task yang sudah selesai)
    avg_days = db.query(
    func.avg(
        # Lakukan ekstraksi epoch untuk mendapatkan selisih dalam detik, lalu bagi
        (func.extract('epoch', Task.end_date) - func.extract('epoch', Task.start_date)) / (24 * 3600)
    )
    ).filter(
        and_(
            Task.status == "Selesai",
            Task.start_date.isnot(None),
            Task.end_date.isnot(None)
        )
    ).scalar()
    
    # Overdue tasks (task yang melewati deadline tapi belum selesai)
    today = datetime.now().date()
    overdue_tasks = db.query(func.count(Task.id))\
        .filter(
            and_(
                func.date(Task.end_date) < today,
                Task.status != "Selesai"
            )
        ).scalar() or 0
    
    return dashboard_model.PerformanceMetric(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=round(completion_rate, 2),
        avg_completion_days=round(avg_days, 2) if avg_days else None,
        overdue_tasks=overdue_tasks
    )


def get_dashboard_statistics(db: Session) -> dashboard_model.DashboardStats:
    """
    Fungsi utama untuk mengambil semua data dashboard
    """
    return dashboard_model.DashboardStats(
        task_summary=get_task_summary(db),
        member_stats=get_member_statistics(db),
        recent_activities=get_recent_activities(db, limit=10),
        upcoming_deadlines=get_upcoming_deadlines(db, days_ahead=7),
        performance_metrics=get_performance_metrics(db)
    )