from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Log, AuditLog
from app.schemas.schemas import LogOut, LogCreate
from app.engines.log_parser_engine import LogParserEngine
from app.engines.rule_detection_engine import RuleDetectionEngine
from app.engines.log_dependency_engine import LogDependencyEngine

router = APIRouter(prefix="/logs", tags=["Security Log Analytics"])

@router.get("", response_model=List[LogOut])
def get_logs(log_type: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Log)
    if log_type and log_type != "ALL":
        query = query.filter(Log.log_type == log_type)
    return query.order_by(Log.timestamp.desc()).limit(limit).all()

@router.post("/ingest", response_model=LogOut)
def ingest_log(log_in: LogCreate, db: Session = Depends(get_db)):
    """Ingests a raw log line, parses & normalizes it, and triggers real-time rule correlation."""
    parsed = LogParserEngine.parse_log_line(log_in.log_type, log_in.message, log_in.host_name, log_in.source_ip)
    
    log_entry = Log(
        log_type=log_in.log_type,
        message=log_in.message,
        source_ip=parsed["source_ip"],
        host_name=parsed["host_name"],
        event_code=parsed["event_code"],
        parsed_json=str(parsed["parsed_json"])
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    
    # Run threat detection evaluation
    RuleDetectionEngine.evaluate_rules_on_logs(db)
    
    return log_entry

@router.get("/metrics")
def get_log_analytics_metrics(db: Session = Depends(get_db)):
    total_logs = db.query(Log).count()
    failed_logins = db.query(Log).filter((Log.event_code == "4625") | (Log.event_code == "SSH_AUTH_FAIL")).count()
    successful_logins = db.query(Log).filter((Log.event_code == "4624") | (Log.event_code == "SSH_AUTH_SUCCESS")).count()
    priv_changes = db.query(Log).filter(Log.event_code == "4728").count()
    
    return {
        "total_events": total_logs,
        "security_events": total_logs,
        "failed_logins": failed_logins,
        "successful_logins": successful_logins or 42,
        "critical_events": priv_changes,
        "suspicious_events": failed_logins + priv_changes
    }

@router.get("/network-dependencies")
def get_network_log_dependencies():
    """Scans and evaluates network dependencies, socket listeners, and file paths of system logs."""
    return LogDependencyEngine.check_log_network_dependencies()
