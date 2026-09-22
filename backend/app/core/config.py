import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Enterprise Cyber Defense Platform")
    PROJECT_VERSION: str = os.getenv("PROJECT_VERSION", "2.0.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    
    # Supabase Credentials (Loaded via .env)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://ldspllojokcglmjumfmv.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    JWT_KEY_ID: str = os.getenv("JWT_KEY_ID", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_DB_PASSWORD: str = os.getenv("SUPABASE_DB_PASSWORD", "")

    # Database URI Resolution
    _raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./cyber_defense.db")
    
    @property
    def DATABASE_URL(self) -> str:
        # If user assigned HTTP URL to DATABASE_URL, convert to PostgreSQL URI
        if self._raw_db_url.startswith("http://") or self._raw_db_url.startswith("https://"):
            project_ref = "ldspllojokcglmjumfmv"
            if "//" in self._raw_db_url:
                host_part = self._raw_db_url.split("//")[1].split(".")[0]
                if host_part:
                    project_ref = host_part
            pwd = self.SUPABASE_DB_PASSWORD or "[YOUR-PASSWORD]"
            if pwd and pwd != "[YOUR-PASSWORD]":
                return f"postgresql://postgres:{pwd}@db.{project_ref}.supabase.co:5432/postgres"
            else:
                # Fallback to local SQLite if db password is not supplied yet
                print(f"⚠️ Notice: Supabase URL detected but SUPABASE_DB_PASSWORD is not set yet. Falling back to SQLite.")
                return "sqlite:///./cyber_defense.db"
        return self._raw_db_url
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-cyber-defense-key-2026-enterprise-lab-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

settings = Settings()
