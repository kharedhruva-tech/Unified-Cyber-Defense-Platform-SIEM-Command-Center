from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import ADUser, ADGroup
from app.schemas.schemas import ADUserOut, ADGroupOut
from app.engines.ad_security_engine import ADSecurityEngine

router = APIRouter(prefix="/active-directory", tags=["Active Directory Security"])

@router.get("/audit")
def get_ad_audit_report(db: Session = Depends(get_db)):
    return ADSecurityEngine.audit_ad_environment(db)

@router.get("/users", response_model=List[ADUserOut])
def get_ad_users(db: Session = Depends(get_db)):
    return db.query(ADUser).all()

@router.get("/groups", response_model=List[ADGroupOut])
def get_ad_groups(db: Session = Depends(get_db)):
    return db.query(ADGroup).all()
