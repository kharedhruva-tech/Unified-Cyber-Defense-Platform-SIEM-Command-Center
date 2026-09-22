from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
else:
    connect_args = {"connect_timeout": 5}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    display_url = db_url.split('@')[-1] if '@' in db_url else db_url
    print(f"[SUCCESS] Connected to Database: {display_url}")
except Exception as e:
    display_url = db_url.split('@')[-1] if '@' in db_url else db_url
    print(f"[WARNING] Could not connect to primary DATABASE_URL ({display_url}): {e}")
    print("[INFO] Falling back to local SQLite database: sqlite:///./cyber_defense.db")
    engine = create_engine("sqlite:///./cyber_defense.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
