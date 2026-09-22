from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Log, Alert, Incident, DetectionRule, Asset

class RuleDetectionEngine:
    """Rule-based Threat Detection & Correlation Engine."""

    @classmethod
    def evaluate_rules_on_logs(cls, db: Session) -> List[Dict[str, Any]]:
        """Scans recent logs against active SIGMA/Detection rules dynamically and generates Security Alerts."""
        new_alerts = []
        try:
            active_rules = db.query(DetectionRule).filter(DetectionRule.is_active == True).all()
        except Exception as e:
            print(f"[RULE ENGINE] Error fetching active rules: {e}")
            return new_alerts
        
        for rule in active_rules:
            try:
                # Lookback window
                cutoff_time = datetime.utcnow() - timedelta(seconds=rule.window_seconds)
                pattern = (rule.query_pattern or "").strip().lower()
                
                # Fetch recent logs within window
                recent_logs = db.query(Log).filter(Log.timestamp >= cutoff_time).all()
                
                # Filter logs matching pattern
                matching_logs = []
                for log in recent_logs:
                    msg = (log.message or "").lower()
                    code = (log.event_code or "").lower()
                    log_t = (log.log_type or "").lower()
                    parsed = (log.parsed_json or "").lower()
                    
                    is_match = False
                    if pattern in msg or pattern in code or pattern in log_t or pattern in parsed:
                        is_match = True
                    elif pattern in ["4625", "failed password"] and (code in ["4625", "ssh_auth_fail"] or "failed" in msg):
                        is_match = True
                    elif pattern in ["4728", "domain admins"] and (code == "4728" or "domain admins" in msg):
                        is_match = True
                    elif pattern in ["smb_sweep", "smb"] and ("smb" in msg or "445" in msg or "smb" in code):
                        is_match = True
                    elif pattern in ["union select", "sqli"] and ("union select" in msg or "sqli" in msg or "403" in msg):
                        is_match = True
                        
                    if is_match:
                        matching_logs.append(log)
                
                if not matching_logs:
                    continue
                
                # Group matching logs by source IP
                ip_counts = {}
                for log in matching_logs:
                    ip = log.source_ip or "127.0.0.1"
                    if ip not in ip_counts:
                        ip_counts[ip] = []
                    ip_counts[ip].append(log)
                
                for ip, log_group in ip_counts.items():
                    if len(log_group) >= rule.threshold:
                        # Check deduplication window (don't duplicate alert for same rule+IP within last 2 minutes)
                        recent_alert = db.query(Alert).filter(
                            Alert.rule_id == str(rule.id),
                            Alert.timestamp >= datetime.utcnow() - timedelta(minutes=2)
                        ).first()
                        
                        if not recent_alert:
                            affected_asset = db.query(Asset).filter(Asset.ip_address == ip).first()
                            
                            rec_action = "Inspect source host and review endpoint security logs."
                            if rule.category == "Authentication" or "Brute" in rule.rule_name:
                                rec_action = f"Block source IP {ip} at perimeter firewall and enforce Account Lockout Policy."
                            elif rule.category == "Active Directory":
                                rec_action = "Audit GPO change history, revert unauthorized group membership, and reset credentials."
                            elif rule.category == "Web Application Security":
                                rec_action = f"Block malicious traffic from {ip} on WAF and inspect application payload."
                            elif rule.category == "Network":
                                rec_action = f"Isolate target asset and block port scanning from {ip} on core switch."
                            
                            alert = Alert(
                                rule_id=str(rule.id),
                                rule_name=rule.rule_name,
                                timestamp=datetime.utcnow(),
                                source=f"{rule.category} Correlation Engine",
                                affected_asset_id=affected_asset.id if affected_asset else None,
                                severity=rule.severity,
                                evidence=f"Detected {len(log_group)} event(s) matching pattern '{rule.query_pattern}' from IP {ip} within {rule.window_seconds}s.",
                                status="Open",
                                recommended_action=rec_action
                            )
                            db.add(alert)
                            db.commit()
                            db.refresh(alert)

                            import sys
                            ts = datetime.utcnow().strftime("%H:%M:%S")
                            alert_line = f"[{ts}] 🚨 [REAL-TIME THREAT DETECTED] Alert #{alert.id} | Rule: {rule.rule_name} | Severity: {rule.severity} | Target IP: {ip}"
                            print(alert_line, flush=True)
                            sys.stderr.write(alert_line + "\n")
                            sys.stderr.flush()
                            
                            new_alerts.append({
                                "id": alert.id,
                                "rule_name": alert.rule_name,
                                "severity": alert.severity,
                                "ip": ip
                            })
                            
                            # Auto-escalate High/Critical rules to Incidents
                            if rule.severity in ["Critical", "High"]:
                                cls._escalate_to_incident(db, alert, affected_asset)
            except Exception as rule_err:
                print(f"[RULE ENGINE] Error evaluating rule #{rule.id} ({rule.rule_name}): {rule_err}")
                db.rollback()

        return new_alerts

    @classmethod
    def _escalate_to_incident(cls, db: Session, alert: Alert, asset: Optional[Asset]):
        """Creates an Incident ticket from a high/critical security alert with deduplication."""
        try:
            # Check if incident ticket was recently created for this alert rule in last 5 minutes
            recent_inc = db.query(Incident).filter(
                Incident.title.like(f"%{alert.rule_name}%"),
                Incident.created_at >= datetime.utcnow() - timedelta(minutes=5)
            ).first()
            if recent_inc:
                return
            
            inc_count = db.query(Incident).count()
            inc_str = f"INC-2026-{inc_count + 1:04d}"
            
            incident = Incident(
                incident_id_str=inc_str,
                title=f"Security Incident: {alert.rule_name}",
                description=alert.evidence,
                severity=alert.severity,
                affected_asset_id=asset.id if asset else None,
                status="Detection",
                assigned_analyst="SOC Level 2 Analyst",
                containment_actions="[]",
                timeline_json=f'[{{"time": "{datetime.utcnow().strftime("%H:%M:%S")}", "event": "Automated Incident Escalation from Alert #{alert.id}"}}]'
            )
            db.add(incident)
            db.commit()
        except Exception as inc_err:
            print(f"[RULE ENGINE] Error escalating alert #{alert.id} to incident: {inc_err}")
            db.rollback()

