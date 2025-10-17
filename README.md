# Task Team Tracker

`Task Team Tracker` adalah aplikasi web *full-stack* yang dirancang untuk membantu tim mengelola tugas dan memonitor produktivitas proyek secara efisien. Dengan dasbor analitik yang informatif dan manajemen tugas yang interaktif, aplikasi ini menyediakan semua yang dibutuhkan untuk menjaga proyek tetap di jalurnya.


## 🛠️ Panduan Instalasi & Setup

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah di bawah ini.

### Prasyarat

-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/en/) (v18 atau lebih baru) & npm
-   [Python](https://www.python.org/) (v3.10 atau lebih baru) & pip
-   Database [PostgreSQL](https://www.postgresql.org/) atau database SQL lain yang didukung SQLAlchemy.

## Backend
### 1. Setup Backend (FastAPI)

```bash

git clone [https://github.com/danielaugust67/Team-Tracker.git](https://github.com/danielaugust67/Team-Tracker.git)
```

``` bash
cd backend 
```

### 2. Buat dan aktifkan virtual environtment
```bash
python -m venv venv
```

```bash
venv/bin/activate  
```

### 3. Install dependesi
```bash
pip install -r requirements.txt
```


### 4. Sesuaikan .env 
```bash
# DATABASE_URL="postgresql://user:password@host:port/database_name"
# SECRET_KEY="kunci_rahasia_jwt_anda_yang_sangat_panjang"
# ALGORITHM="HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES=60
```


### 5. Jalankan Server Backend
```bash
uvicorn src.main:app --reload 
```

## Frontend
### 1. Setup React 
``` bash
cd frontend
```

### 2. Install Depedensi
``` bash
npm install
```
### 4. Isi file .env dengan konfigurasi Anda
```bash
# VITE_API_URL="your_backend_api"
```

### 3.Run Server
``` bash
npm install
```


