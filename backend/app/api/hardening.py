from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.hardening_engine import HardeningEngine

router = APIRouter(prefix="/hardening", tags=["Infrastructure Hardening"])

@router.get("/audit")
def get_hardening_audit(db: Session = Depends(get_db)):
    return HardeningEngine.audit_infrastructure(db)
