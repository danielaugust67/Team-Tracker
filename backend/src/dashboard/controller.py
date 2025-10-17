# src/dashboard/controller.py
from fastapi import APIRouter, HTTPException, status
from typing import List

from . import service as dashboard_service
from . import model as dashboard_model
from ..database import DbSession
from ..auth.service import CurrentUser


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats", response_model=dashboard_model.DashboardStats)
def get_dashboard_stats(
    current_user: CurrentUser,
    db: DbSession
):
    try:
        return dashboard_service.get_dashboard_statistics(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data dashboard: {str(e)}"
        )


@router.get("/task-summary", response_model=dashboard_model.TaskSummary)
def get_task_summary(
    current_user: CurrentUser,
    db: DbSession
):
    try:
        return dashboard_service.get_task_summary(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil ringkasan task: {str(e)}"
        )


@router.get("/member-stats", response_model=List[dashboard_model.MemberStats])
def get_member_stats(
    current_user: CurrentUser,
    db: DbSession
):
    try:
        return dashboard_service.get_member_statistics(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil statistik member: {str(e)}"
        )


@router.get("/recent-activities", response_model=List[dashboard_model.RecentActivity])
def get_recent_activities(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = 10
):
    try:
        return dashboard_service.get_recent_activities(db, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil aktivitas terbaru: {str(e)}"
        )


@router.get("/upcoming-deadlines", response_model=List[dashboard_model.TaskDeadline])
def get_upcoming_deadlines(
    current_user: CurrentUser,
    db: DbSession,
    days_ahead: int = 7
):
    try:
        return dashboard_service.get_upcoming_deadlines(db, days_ahead=days_ahead)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil deadline task: {str(e)}"
        )


@router.get("/performance", response_model=dashboard_model.PerformanceMetric)
def get_performance_metrics(
    current_user: CurrentUser,
    db: DbSession
):
    try:
        return dashboard_service.get_performance_metrics(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil metrik performa: {str(e)}"
        )