from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import DetectionRule, Alert, AuditLog
from app.schemas.schemas import DetectionRuleOut, DetectionRuleCreate, AlertOut
from app.engines.rule_detection_engine import RuleDetectionEngine

router = APIRouter(prefix="/threat-detection", tags=["Threat Detection Engine"])

@router.get("/rules", response_model=List[DetectionRuleOut])
def get_rules(db: Session = Depends(get_db)):
    return db.query(DetectionRule).all()

@router.post("/rules", response_model=DetectionRuleOut)
def create_rule(rule_in: DetectionRuleCreate, db: Session = Depends(get_db)):
    rule = DetectionRule(
        rule_name=rule_in.rule_name,
        category=rule_in.category,
        severity=rule_in.severity,
        description=rule_in.description,
        query_pattern=rule_in.query_pattern,
        threshold=rule_in.threshold,
        window_seconds=rule_in.window_seconds,
        is_active=True
    )
    db.add(rule)
    db.add(AuditLog(username="SOC Analyst", action="CREATE_RULE", target=rule_in.rule_name, details="Created new SIGMA correlation rule."))
    db.commit()
    db.refresh(rule)
    return rule

@router.patch("/rules/{rule_id}/toggle")
def toggle_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(DetectionRule).filter(DetectionRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"message": f"Rule '{rule.rule_name}' active state set to {rule.is_active}."}

@router.get("/alerts", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).all()

@router.post("/run-evaluation")
def trigger_evaluation(db: Session = Depends(get_db)):
    new_alerts = RuleDetectionEngine.evaluate_rules_on_logs(db)
    return {"message": f"Rule evaluation run complete. Generated {len(new_alerts)} new alerts.", "new_alerts": new_alerts}
