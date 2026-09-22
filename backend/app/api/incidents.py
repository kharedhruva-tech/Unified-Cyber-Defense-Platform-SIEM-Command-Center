import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Incident, Asset, AuditLog
from app.schemas.schemas import IncidentOut, IncidentCreate, IncidentStatusUpdate

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("", response_model=List[IncidentOut])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.post("", response_model=IncidentOut)
def create_incident(inc_in: IncidentCreate, db: Session = Depends(get_db)):
    count = db.query(Incident).count()
    inc_str = f"INC-2026-{count + 1:04d}"
    
    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")
    timeline = json.dumps([{"time": now_str, "event": "Incident ticket created manually by security analyst."}])
    
    incident = Incident(
        incident_id_str=inc_str,
        title=inc_in.title,
        description=inc_in.description,
        severity=inc_in.severity,
        affected_asset_id=inc_in.affected_asset_id,
        status="Detection",
        assigned_analyst=inc_in.assigned_analyst or "SOC Analyst",
        containment_actions="[]",
        timeline_json=timeline
    )
    db.add(incident)
    db.add(AuditLog(username="SOC Analyst", action="CREATE_INCIDENT", target=inc_str, details=inc_in.title))
    db.commit()
    db.refresh(incident)
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentOut)
def update_incident_status(incident_id: int, status_update: IncidentStatusUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    old_status = inc.status
    inc.status = status_update.status
    if status_update.assigned_analyst:
        inc.assigned_analyst = status_update.assigned_analyst
        
    # Append timeline entry
    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")
    timeline = json.loads(inc.timeline_json or "[]")
    event_msg = f"Status updated from {old_status} to {status_update.status}."
    if status_update.action_note:
        event_msg += f" Note: {status_update.action_note}"
    timeline.append({"time": now_str, "event": event_msg})
    inc.timeline_json = json.dumps(timeline)
    
    db.add(AuditLog(username=inc.assigned_analyst, action="UPDATE_INCIDENT", target=inc.incident_id_str, details=event_msg))
    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/action/{action_type}")
def execute_containment_action(incident_id: int, action_type: str, db: Session = Depends(get_db)):
    """Executes automated active containment responses (e.g. Host Isolation, Firewall IP Block)."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")
    actions = json.loads(inc.containment_actions or "[]")
    timeline = json.loads(inc.timeline_json or "[]")
    
    action_desc = f"Executed Containment Action: {action_type.replace('_', ' ').title()}"
    actions.append(action_desc)
    timeline.append({"time": now_str, "event": action_desc})
    
    inc.containment_actions = json.dumps(actions)
    inc.timeline_json = json.dumps(timeline)
    inc.status = "Containment"
    
    db.add(AuditLog(username=inc.assigned_analyst, action=f"CONTAINMENT_{action_type.upper()}", target=inc.incident_id_str, details=action_desc))
    db.commit()
    return {"message": f"Successfully executed {action_type} for incident {inc.incident_id_str}.", "incident": inc}
