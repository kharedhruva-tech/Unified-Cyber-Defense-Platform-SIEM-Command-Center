from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.risk_scoring_engine import RiskScoringEngine
from app.engines.report_generator import ReportGenerator
from app.models.models import Vulnerability, Alert, HardeningCheck, AuditLog

router = APIRouter(prefix="/reports", tags=["Security Reports"])

@router.get("/summary")
def get_siem_posture_summary(db: Session = Depends(get_db)):
    return RiskScoringEngine.calculate_siem_posture(db)

@router.get("/download/pdf")
def download_pdf_report(report_type: str = "Vulnerability Assessment", db: Session = Depends(get_db)):
    summary = RiskScoringEngine.calculate_siem_posture(db)
    
    if report_type == "Vulnerability Assessment":
        vulns = db.query(Vulnerability).all()
        table_data = [["CVE ID", "Title", "Severity", "Affected Service", "Status"]]
        for v in vulns:
            table_data.append([v.cve_id, v.title, v.severity, v.affected_service or "N/A", v.status])
    elif report_type == "Hardening Assessment":
        checks = db.query(HardeningCheck).all()
        table_data = [["Control ID", "OS", "Category", "Control Name", "Status"]]
        for c in checks:
            table_data.append([c.control_id, c.os_type, c.category, c.control_name, c.status])
    else:
        alerts = db.query(Alert).all()
        table_data = [["ID", "Rule Name", "Timestamp", "Severity", "Status"]]
        for a in alerts:
            table_data.append([f"ALT-{a.id}", a.rule_name, a.timestamp.strftime("%Y-%m-%d %H:%M"), a.severity, a.status])

    pdf_bytes = ReportGenerator.generate_pdf_report(f"{report_type} Report", summary, table_data)
    
    db.add(AuditLog(username="SOC Analyst", action="DOWNLOAD_REPORT", target=f"{report_type} PDF", details="Generated executive PDF report."))
    db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={report_type.lower().replace(' ', '_')}_report.pdf"}
    )

@router.get("/download/csv")
def download_csv_report(report_type: str = "Vulnerabilities", db: Session = Depends(get_db)):
    if report_type == "Vulnerabilities":
        header = ["ID", "CVE ID", "Title", "Severity", "Affected Service", "CVSS Score", "Status"]
        vulns = db.query(Vulnerability).all()
        rows = [[v.id, v.cve_id, v.title, v.severity, v.affected_service, v.cvss_score, v.status] for v in vulns]
    else:
        header = ["ID", "Rule Name", "Source", "Severity", "Evidence", "Status"]
        alerts = db.query(Alert).all()
        rows = [[a.id, a.rule_name, a.source, a.severity, a.evidence, a.status] for a in alerts]
        
    csv_str = ReportGenerator.generate_csv_report(header, rows)
    
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type.lower()}_export.csv"}
    )
