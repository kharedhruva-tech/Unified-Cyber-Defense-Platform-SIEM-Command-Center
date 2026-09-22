from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seed_data import seed_database

# Routers - Updated Auth Fail-Safe Enabled
from app.api import auth, assets, vulnerabilities, network, logs, threat_detection, incidents, active_directory, hardening, reports, audit_logs, simulator, gis, ai_copilot, notifications

from app.engines.simulator_engine import ActivitySimulatorEngine

# Create all database tables
Base.metadata.create_all(bind=engine)

# Seed Initial Data
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# Automatically start background random user activity simulator
ActivitySimulatorEngine.start_simulator()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Unified Cyber Defense Solution - SIEM Analytics, Asset Discovery, Vulnerability Management & Hardening Platform"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import sys
import time
from fastapi import Request

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
except Exception:
    pass

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    client_ip = request.client.host if request.client else "127.0.0.1"
    log_msg = f"[INCOMING API REQUEST] {request.method} {request.url.path} -> Status {response.status_code} ({duration_ms}ms) | Client: {client_ip}"
    try:
        print(log_msg, flush=True)
    except Exception:
        pass
    return response


# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(assets.router, prefix=settings.API_V1_STR)
app.include_router(vulnerabilities.router, prefix=settings.API_V1_STR)
app.include_router(network.router, prefix=settings.API_V1_STR)
app.include_router(logs.router, prefix=settings.API_V1_STR)
app.include_router(threat_detection.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(active_directory.router, prefix=settings.API_V1_STR)
app.include_router(hardening.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audit_logs.router, prefix=settings.API_V1_STR)
app.include_router(simulator.router, prefix=settings.API_V1_STR)
app.include_router(gis.router, prefix=settings.API_V1_STR)
app.include_router(ai_copilot.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs"
    }
