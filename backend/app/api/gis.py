from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.gis_engine import GisEngine

router = APIRouter(prefix="/gis", tags=["GIS Breach & Geo Threat Map"])

@router.get("/breaches")
def get_gis_breaches(db: Session = Depends(get_db)):
    """Returns active and historical data breach events enriched with GIS lat/long coordinates."""
    return GisEngine.get_active_breaches(db)

@router.get("/summary")
def get_gis_summary(db: Session = Depends(get_db)):
    """Returns aggregate GIS breach metrics, exfiltration volume, and top attacker origin countries."""
    return GisEngine.get_gis_summary(db)

@router.post("/simulate-breach")
def trigger_simulated_breach(db: Session = Depends(get_db)):
    """Simulates a live global data breach attack for real-time telemetry testing."""
    return GisEngine.trigger_simulated_breach(db)

@router.post("/contain-ip")
def contain_threat_ip(ip: str = Body(..., embed=True)):
    """Deploys perimeter firewall rule to contain target threat IP."""
    return GisEngine.contain_ip(ip)

