from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Asset, Service, NetworkScan, AuditLog
from app.schemas.schemas import AssetOut, AssetCreate
from app.engines.discovery_engine import DiscoveryEngine
from app.engines.vulnerability_engine import VulnerabilityEngine

router = APIRouter(prefix="/assets", tags=["Asset & Network Discovery"])

@router.get("", response_model=List[AssetOut])
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset_by_id(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/scan", response_model=List[AssetOut])
def run_nmap_subnet_scan(target_range: str = "192.168.1.0/24", db: Session = Depends(get_db)):
    """Triggers an authorized Nmap scanner discovery run against a target network range."""
    scanned_results = DiscoveryEngine.simulate_subnet_scan(target_range)
    
    new_assets = []
    for item in scanned_results:
        existing = db.query(Asset).filter(Asset.ip_address == item["ip_address"]).first()
        if not existing:
            asset = Asset(
                ip_address=item["ip_address"],
                hostname=item["hostname"],
                mac_address=item["mac_address"],
                os_name=item["os_name"],
                category=item["category"],
                status="Online",
                risk_score=75.0 if item.get("is_unknown") else 30.0,
                is_unknown=item.get("is_unknown", False)
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)
            
            for s in item["services"]:
                db.add(Service(
                    asset_id=asset.id,
                    port=s["port"],
                    protocol=s["protocol"],
                    service_name=s["service_name"],
                    version=s["version"],
                    status="Open"
                ))
            db.commit()
            new_assets.append(asset)
            
    # Record scan entry
    db.add(NetworkScan(target_range=target_range, scan_type="Nmap SYN & Service Scan", total_hosts_found=len(scanned_results)))
    db.add(AuditLog(username="SOC Analyst", action="NMAP_SCAN", target=target_range, details=f"Completed Nmap scan for {target_range}"))
    db.commit()
    
    return db.query(Asset).all()

@router.post("/import-nmap-xml")
def import_nmap_xml(xml_content: str, db: Session = Depends(get_db)):
    parsed_assets = DiscoveryEngine.parse_nmap_xml(xml_content)
    added_count = 0
    for item in parsed_assets:
        existing = db.query(Asset).filter(Asset.ip_address == item["ip_address"]).first()
        if not existing:
            asset = Asset(
                ip_address=item["ip_address"],
                hostname=item["hostname"],
                mac_address=item["mac_address"],
                os_name=item["os_name"],
                category=item["category"],
                status="Online",
                risk_score=40.0
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)
            for s in item["services"]:
                db.add(Service(asset_id=asset.id, port=s["port"], protocol=s["protocol"], service_name=s["service_name"], version=s["version"], status="Open"))
            db.commit()
            added_count += 1
            
    return {"message": f"Successfully parsed and imported {added_count} assets from Nmap XML."}
