# src/seed.py

import random
from faker import Faker
from datetime import datetime, timedelta

# Sesuaikan path import sesuai struktur proyek Anda
from .database import SessionLocal, engine, Base
from .entities.member import Member
from .entities.task import Task, StatusEnum
from .entities.task_log import TaskLog

# Inisialisasi Faker
faker = Faker('id_ID') # Menggunakan lokal Indonesia

# Inisialisasi koneksi DB
db = SessionLocal()

def seed_data():
    """Fungsi utama untuk membuat data dummy."""
    try:
        print("Menghapus data lama...")
        # Hapus data dengan urutan yang benar untuk menghindari error foreign key
        db.query(TaskLog).delete()
        db.query(Task).delete()
        db.query(Member).delete()
        db.commit()
        print("Data lama berhasil dihapus.")

        # ====================================================================
        # 1. Membuat Member
        # ====================================================================
        print("Membuat data Member...")
        members = []
        for _ in range(10): # Buat 10 member
            member = Member(
                name=faker.unique.name(),
                role=random.choice(['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Project Manager'])
            )
            members.append(member)
        
        db.add_all(members)
        db.commit()
        
        # Ambil kembali member dari DB untuk mendapatkan ID mereka
        all_members = db.query(Member).all()
        print(f"{len(all_members)} Member berhasil dibuat.")


        # ====================================================================
        # 2. Membuat Task dan TaskLog
        # ====================================================================
        print("Membuat data Task dan TaskLog...")
        tasks_to_add = []
        logs_to_add = []
        
        for i in range(50): # Buat 50 task
            # Tentukan tanggal dibuat secara acak dalam 30 hari terakhir
            created_time = faker.date_time_between(start_date='-30d', end_date='now')
            
            # Pilih member secara acak
            assigned_member = random.choice(all_members)
            
            # Tentukan status akhir task secara acak
            final_status = random.choice(list(StatusEnum))

            # Inisialisasi tanggal
            start_date = None
            end_date = None

            # Logika untuk membuat data yang realistis untuk dashboard
            # a. Buat beberapa task yang mendekati deadline
            if i % 7 == 0 and final_status != StatusEnum.SELESAI: 
                start_date = datetime.now() - timedelta(days=random.randint(1, 3))
                end_date = datetime.now() + timedelta(days=random.randint(1, 7)) # Deadline dalam 7 hari ke depan
                final_status = random.choice([StatusEnum.BELUM_DIMULAI, StatusEnum.SEDANG_DIKERJAKAN])

            # b. Buat beberapa task yang sudah lewat deadline (overdue)
            elif i % 10 == 0 and final_status != StatusEnum.SELESAI:
                start_date = datetime.now() - timedelta(days=random.randint(10, 15))
                end_date = datetime.now() - timedelta(days=random.randint(1, 5)) # Deadline sudah lewat
                final_status = random.choice([StatusEnum.BELUM_DIMULAI, StatusEnum.SEDANG_DIKERJAKAN])
            
            # c. Atur tanggal untuk task normal
            else:
                if final_status == StatusEnum.SEDANG_DIKERJAKAN:
                    start_date = faker.date_time_between(start_date=created_time, end_date='now')
                    end_date = faker.date_time_between(start_date='now', end_date='+15d')
                elif final_status == StatusEnum.SELESAI:
                    start_date = faker.date_time_between(start_date=created_time, end_date='-2d')
                    end_date = faker.date_time_between(start_date=start_date, end_date='now')
            
            # Buat objek Task
            task = Task(
                title=faker.sentence(nb_words=6),
                description=faker.paragraph(nb_sentences=3),
                member_id=assigned_member.id,
                status=final_status,
                created_at=created_time,
                start_date=start_date,
                end_date=end_date
            )
            tasks_to_add.append(task)

        # Commit dulu semua task untuk mendapatkan ID
        db.add_all(tasks_to_add)
        db.commit()
        print(f"{len(tasks_to_add)} Task berhasil dibuat.")


        # ====================================================================
        # 3. Membuat Riwayat Log berdasarkan Task yang ada
        # ====================================================================
        print("Membuat riwayat TaskLog...")
        all_tasks = db.query(Task).all()
        for task in all_tasks:
        # ----------------------------------------------------------------
        # DIUBAH: Menggunakan old_status dan new_status
        # ----------------------------------------------------------------
    
        # Setiap task pasti punya log 'Dibuat'
            log_created = TaskLog(
                task_id=task.id,
                old_status=None,  # Tidak ada status sebelumnya
                new_status=StatusEnum.BELUM_DIMULAI,
                timestamp=task.created_at
            )
            logs_to_add.append(log_created)

            # Jika task sudah dimulai atau selesai, tambahkan log 'Mulai Dikerjakan'
            if task.status in [StatusEnum.SEDANG_DIKERJAKAN, StatusEnum.SELESAI]:
                log_started = TaskLog(
                    task_id=task.id,
                    old_status=StatusEnum.BELUM_DIMULAI,
                    new_status=StatusEnum.SEDANG_DIKERJAKAN,
                    timestamp=task.start_date
                )
                logs_to_add.append(log_started)
    
            # Jika task sudah selesai, tambahkan log 'Selesai'
            if task.status == StatusEnum.SELESAI:
                log_completed = TaskLog(
                    task_id=task.id,
                    old_status=StatusEnum.SEDANG_DIKERJAKAN,
                    new_status=StatusEnum.SELESAI,
                    timestamp=task.end_date
                )
                logs_to_add.append(log_completed)

                db.add_all(logs_to_add)
                db.commit()
                print(f"{len(logs_to_add)} TaskLog berhasil dibuat.")

                print("\n✅ Seeding data dummy berhasil!")

    except Exception as e:
        db.rollback()
        print(f"Terjadi error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Inisialisasi tabel jika belum ada
    Base.metadata.create_all(bind=engine)
    seed_data()