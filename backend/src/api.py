from fastapi import FastAPI
from src.auth.controller import router as auth_router
from src.task.controller import router as task_router
from src.member.controller import router as member_router
from src.dashboard.controller import router as dashboard_router

def register_routers(app: FastAPI):
    app.include_router(auth_router)
    app.include_router(task_router)
    app.include_router(member_router)
    app.include_router(dashboard_router)
