import json
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Log, Alert, Incident, Asset, Vulnerability, ADUser, HardeningCheck

router = APIRouter(prefix="/ai/copilot", tags=["AI Security Copilot"])

class CopilotQuerySchema(BaseModel):
    prompt: str
    context_module: Optional[str] = "dashboard"

class AlertExplainSchema(BaseModel):
    alert_id: int

class RemediationGuideSchema(BaseModel):
    target_type: str # "INCIDENT", "VULNERABILITY", "HARDENING"
    target_id: int

@router.post("/query")
def query_copilot(data: CopilotQuerySchema, db: Session = Depends(get_db)):
    """Interprets plain-English security queries and generates threat intelligence insights."""
    prompt = (data.prompt or "").strip().lower()

    # Query telemetry stats for context
    total_logs = db.query(Log).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "Critical").all()
    open_incidents = db.query(Incident).filter(Incident.status != "Resolved").all()
    failed_vulns = db.query(Vulnerability).filter(Vulnerability.severity.in_(["Critical", "High"])).all()
    ad_users_count = db.query(ADUser).count()
    
    # 1. Plain-English query interpretation for specific IPs or attackers
    if "failed" in prompt or "brute" in prompt or "login" in prompt or "russian" in prompt or "russia" in prompt or "ip" in prompt:
        recent_failed_logs = db.query(Log).filter(
            Log.message.like("%failed%") | Log.message.like("%denied%") | Log.message.like("%unauthorized%")
        ).order_by(Log.timestamp.desc()).limit(5).all()

        log_details = [
            f"• [{l.timestamp.strftime('%H:%M:%S')}] {l.source_ip} -> {l.message[:90]}"
            for l in recent_failed_logs
        ]

        response_text = f"""### 🛡️ Failed Authentication & Brute Force Analysis
        
I analyzed your live security telemetry logs and identified **{len(recent_failed_logs)} recent failed authentication attempt(s)** across host endpoints.

**Key Observations:**
{chr(10).join(log_details) if log_details else "• No active brute force spikes detected in the last evaluation window."}

**Recommended Operator Action:**
1. Block source IP `45.142.120.10` on perimeter firewall / Cloudflare WAF.
2. Enforce Active Directory Account Lockout Policy (Threshold: 5 failed attempts within 30 minutes).
3. Review Kerberos TGT logs for suspicious ticket-granting requests."""

    elif "alert" in prompt or "critical" in prompt or "severity" in prompt:
        alert_summaries = [
            f"• **Alert #{a.id} ({a.severity})**: {a.rule_name} — *{a.evidence}*"
            for a in critical_alerts[:4]
        ]

        response_text = f"""### 🚨 High & Critical Security Alert Analysis

Currently, there are **{len(critical_alerts)} Critical severity security alert(s)** requiring immediate SOC investigation.

**Top Critical Alerts:**
{chr(10).join(alert_summaries) if alert_summaries else "• All active alerts are currently contained or mitigated."}

**Suggested SOC Workflow:**
- Click **"Escalate to Incident"** on Alert #{critical_alerts[0].id if critical_alerts else '1'} to open a Level 2 ticket.
- Run Nmap asset discovery scan on affected IP to verify open ports."""

    elif "posture" in prompt or "summary" in prompt or "health" in prompt or "status" in prompt:
        total_assets = db.query(Asset).count()
        response_text = f"""### 📊 Overall Security Posture Summary
        
- **Asset Inventory**: {total_assets} monitored hosts across lab subnets.
- **Log Telemetry**: {total_logs} parsed events in database.
- **Active Incident Tickets**: {len(open_incidents)} open SOC tickets.
- **High Risk Vulnerabilities**: {len(failed_vulns)} CVEs requiring patch remediation.
- **Active Directory Users**: {ad_users_count} monitored domain accounts.

**Security Status**: **OPTIMAL WITH MONITORING**. Defense perimeter is actively intercepting telemetry."""

    elif "remediation" in prompt or "fix" in prompt or "guide" in prompt or "cve" in prompt:
        response_text = f"""### 🛠️ Automated Incident Remediation Playbook

**Step 1: Perimeter Isolation**
Execute firewall containment command on perimeter gateway:
```bash
# Block attacker IP address on host iptables
sudo iptables -A INPUT -s 45.142.120.10 -j DROP
```

**Step 2: Active Directory Credential Protection**
Revoke active session tokens and reset password for compromised user:
```powershell
# Reset password and revoke TGT ticket
Set-ADUser -Identity "bad_actor_user" -Enabled $false
```

**Step 3: Host Hardening Check**
Disable SMBv1 server protocol on domain controller:
```powershell
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
```"""

    else:
        response_text = f"""### 🤖 AI Security Assistant Response

I evaluated your query: *"{data.prompt}"* against your live SOC database (**{total_logs} logs**, **{len(critical_alerts)} critical alerts**, **{len(open_incidents)} incidents**).

**Quick Insights:**
- **Active Telemetry**: Streaming live every 4 seconds.
- **Incident Escalation**: {len(open_incidents)} tickets currently assigned to analysts.
- **Threat Detection**: SIGMA correlation engine is actively scanning incoming log messages.

Feel free to ask me to:
- *"Explain Alert #1 in plain English"*
- *"Show me failed logins from suspicious IPs"*
- *"Generate step-by-step incident remediation guide"*"""

    return {
        "prompt": data.prompt,
        "response": response_text,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/explain-alert")
def explain_alert(data: AlertExplainSchema, db: Session = Depends(get_db)):
    """Generates a plain-English breakdown of a specific security alert."""
    alert = db.query(Alert).filter(Alert.id == data.alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    explanation = f"""### 🔎 Plain-English Explanation: Alert #{alert.id} ({alert.rule_name})

**What Happened?**
The SIEM Correlation Engine detected **{alert.rule_name}** matching rule severity **{alert.severity}**.

**Evidence Breakdown:**
- **Evidence**: {alert.evidence}
- **Source Engine**: {alert.source}
- **Detected Timestamp**: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}

**Why Is This Important?**
This event indicates potential unauthorized credential access or lateral movement attempting to gain privileges on internal infrastructure.

**Recommended Action:**
{alert.recommended_action}"""

    return {
        "alert_id": alert.id,
        "rule_name": alert.rule_name,
        "severity": alert.severity,
        "explanation": explanation
    }
