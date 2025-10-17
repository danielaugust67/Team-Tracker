from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, SessionLocal, Base
from src.entities.users import User
from .auth import service 
from . import entities

from .api import register_routers


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="API untuk mengelola tugas tim proyek.",
    version="1.0.0"
)


origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


register_routers(app)


@app.on_event("startup")
def create_default_user():
    db = SessionLocal()
    try:
        # Periksa apakah user "admin" sudah ada di database
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            # Jika tidak ada, buat user baru dengan password yang di-hash
            hashed_password = service.get_password_hash("admin123")
            default_user = User(
                username="admin",
                hashed_password=hashed_password
            )
            db.add(default_user)
            db.commit()
            print("Default user 'admin' berhasil dibuat.")
    finally:
        db.close()

