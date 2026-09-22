from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.pcap_engine import PcapEngine

router = APIRouter(prefix="/network", tags=["Network Traffic Analysis"])

@router.get("/analysis")
def get_network_analysis():
    """Returns network traffic analysis flow metrics, protocol distribution, and suspicious connection flows."""
    return PcapEngine.analyze_pcap_sample()

@router.post("/upload-pcap")
async def upload_pcap(file: UploadFile = File(...)):
    """Uploads an authorized PCAP file for inspection."""
    filename = file.filename or "uploaded_capture.pcap"
    return PcapEngine.analyze_pcap_sample(filename)
