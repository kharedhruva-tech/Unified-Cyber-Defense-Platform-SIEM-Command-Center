from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.simulator_engine import ActivitySimulatorEngine
from app.models.models import AuditLog

router = APIRouter(prefix="/simulator", tags=["Automated Activity Simulator"])

@router.get("/status")
def get_simulator_status():
    return {
        "is_running": ActivitySimulatorEngine.is_running(),
        "mode": "Automated Background User & Threat Generator",
        "interval_seconds": 5
    }

@router.post("/start")
def start_simulator(db: Session = Depends(get_db)):
    ActivitySimulatorEngine.start_simulator()
    db.add(AuditLog(username="SOC Admin", action="START_SIMULATOR", target="Automated User Engine", details="Started background random user activity generator."))
    db.commit()
    return {"message": "Automated user activity simulator started successfully.", "is_running": True}

@router.post("/stop")
def stop_simulator(db: Session = Depends(get_db)):
    ActivitySimulatorEngine.stop_simulator()
    db.add(AuditLog(username="SOC Admin", action="STOP_SIMULATOR", target="Automated User Engine", details="Stopped background user simulator."))
    db.commit()
    return {"message": "Automated user activity simulator stopped.", "is_running": False}

@router.post("/trigger-now")
def trigger_single_event(db: Session = Depends(get_db)):
    """Triggers one immediate random user activity event."""
    ActivitySimulatorEngine.generate_random_activity(db)
    return {"message": "Generated 1 automated user activity event."}
