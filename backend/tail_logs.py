import time
import sys
import datetime
from app.core.database import SessionLocal
from app.models.models import Log, Alert

def start_tail():
    print("\n" + "="*80)
    print(" 🛡️ UNIFIED CYBER DEFENSE SOLUTION - REAL-TIME LOG & THREAT STREAMER")
    print(" Streaming live security events from database. Press Ctrl+C to stop.")
    print("="*80 + "\n")
    
    last_log_id = 0
    last_alert_id = 0
    
    db = SessionLocal()
    try:
        latest_log = db.query(Log).order_by(Log.id.desc()).first()
        if latest_log:
            last_log_id = latest_log.id
        latest_alert = db.query(Alert).order_by(Alert.id.desc()).first()
        if latest_alert:
            last_alert_id = latest_alert.id
    finally:
        db.close()
        
    while True:
        db = SessionLocal()
        try:
            # Check for new logs
            new_logs = db.query(Log).filter(Log.id > last_log_id).order_by(Log.id.asc()).all()
            for log in new_logs:
                last_log_id = max(last_log_id, log.id)
                ts = log.timestamp.strftime("%H:%M:%S") if log.timestamp else datetime.datetime.now().strftime("%H:%M:%S")
                print(f"[{ts}] ⚡ [LOG #{log.id}] [{log.log_type}] Code: {log.event_code} | Host: {log.host_name} | IP: {log.source_ip} | Msg: {log.message[:70]}", flush=True)

            # Check for new alerts
            new_alerts = db.query(Alert).filter(Alert.id > last_alert_id).order_by(Alert.id.asc()).all()
            for alert in new_alerts:
                last_alert_id = max(last_alert_id, alert.id)
                ts = alert.timestamp.strftime("%H:%M:%S") if alert.timestamp else datetime.datetime.now().strftime("%H:%M:%S")
                print(f"[{ts}] 🚨 [THREAT ALERT #{alert.id}] [{alert.severity}] Rule: {alert.rule_name} | Evidence: {alert.evidence[:70]}", flush=True)

        except Exception as e:
            print(f"[TAIL LOGS ERROR]: {e}", flush=True)
        finally:
            db.close()

        time.sleep(2)

if __name__ == "__main__":
    start_tail()
