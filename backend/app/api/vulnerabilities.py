from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Vulnerability, CVE, Asset, AuditLog
from app.schemas.schemas import VulnerabilityOut
from app.engines.vulnerability_engine import VulnerabilityEngine

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerability Management"])

@router.get("", response_model=List[VulnerabilityOut])
def get_vulnerabilities(db: Session = Depends(get_db)):
    return db.query(Vulnerability).all()

@router.get("/cve/{cve_id}")
def lookup_cve(cve_id: str):
    return VulnerabilityEngine.get_cve_details(cve_id)

@router.patch("/{vuln_id}/status")
def update_vulnerability_status(vuln_id: int, status: str, db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability record not found")
        
    old_status = vuln.status
    vuln.status = status
    db.add(AuditLog(username="SOC Analyst", action="VULN_STATUS_UPDATE", target=vuln.cve_id, details=f"Changed status from {old_status} to {status}"))
    db.commit()
    db.refresh(vuln)
    return vuln

@router.get("/summary")
def get_vulnerability_metrics(db: Session = Depends(get_db)):
    vulns = db.query(Vulnerability).all()
    return {
        "critical": sum(1 for v in vulns if v.severity == "Critical"),
        "high": sum(1 for v in vulns if v.severity == "High"),
        "medium": sum(1 for v in vulns if v.severity == "Medium"),
        "low": sum(1 for v in vulns if v.severity == "Low"),
        "open": sum(1 for v in vulns if v.status == "Open"),
        "remediated": sum(1 for v in vulns if v.status == "Remediated"),
        "investigating": sum(1 for v in vulns if v.status == "Investigating")
    }
