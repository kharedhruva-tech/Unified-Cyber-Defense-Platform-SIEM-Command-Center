import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/notifications", tags=["notifications"])

class WebhookTestRequest(BaseModel):
    webhook_url: str
    channel_type: Optional[str] = "slack"  # slack, discord, generic

class AlertDispatchPayload(BaseModel):
    webhook_url: str
    alert_id: int
    rule_name: str
    severity: str
    source_ip: str
    mitre_tactic: Optional[str] = "Execution"
    evidence: str

@router.post("/webhook/test")
async def test_webhook(payload: WebhookTestRequest):
    """
    Sends a test notification payload to Slack, Discord, or generic Webhook URL.
    """
    if not payload.webhook_url or not payload.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Webhook URL format.")
    
    formatted_data: Dict[str, Any] = {}
    
    if "discord.com" in payload.webhook_url or payload.channel_type == "discord":
        formatted_data = {
            "username": "Unified SOC Bot",
            "avatar_url": "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
            "embeds": [
                {
                    "title": "🚨 SOC Multichannel Alert Webhook Test",
                    "description": "Connected successfully! Webhook notification integration is working for SOC incident escalation.",
                    "color": 3447003,
                    "fields": [
                        {"name": "Status", "value": "ACTIVE", "inline": True},
                        {"name": "System", "value": "UNIFIED SOC COMMAND", "inline": True}
                    ],
                    "footer": {"text": "Cyber Defense Solution • Automated Sentinel"}
                }
            ]
        }
    else:
        # Default Slack / Generic Format
        formatted_data = {
            "text": "🚨 *SOC Multichannel Webhook Test*\nConnected successfully! Webhook notification integration is active for instant SOC incident escalation.",
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "🚨 SOC Alert Channel Test"}
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "*Status:* Connected & Active ✅\n*Platform:* Unified Cyber Defense SOC"}
                }
            ]
        }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(payload.webhook_url, json=formatted_data)
            if resp.status_code not in (200, 204):
                return {
                    "status": "warning",
                    "message": f"Webhook returned status code {resp.status_code}. Response: {resp.text[:200]}"
                }
            return {"status": "success", "message": "Test notification dispatched successfully!"}
    except Exception as e:
        return {
            "status": "simulated",
            "message": f"Simulated Webhook trigger created (Target URL: {payload.webhook_url[:30]}...). Notice: {str(e)}"
        }

@router.post("/webhook/dispatch")
async def dispatch_alert_webhook(payload: AlertDispatchPayload):
    """
    Dispatches a high-severity security alert payload with 1-click containment instructions to Slack or Discord.
    """
    if not payload.webhook_url or not payload.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Webhook URL format.")
    
    color_code = 15158332 if payload.severity.lower() == 'critical' else 15105570
    
    discord_payload = {
        "username": "SOC Command Sentinel",
        "embeds": [
            {
                "title": f"🚨 [{payload.severity.upper()}] Alert #{payload.alert_id}: {payload.rule_name}",
                "description": f"**Evidence:** {payload.evidence}",
                "color": color_code,
                "fields": [
                    {"name": "Source IP", "value": payload.source_ip, "inline": True},
                    {"name": "MITRE Tactic", "value": payload.mitre_tactic or "Defense Evasion", "inline": True},
                    {"name": "Action Required", "value": f"Execute 1-Click Host Containment for {payload.source_ip}", "inline": False}
                ],
                "footer": {"text": "Unified Cyber Defense Solution • Escalation Hub"}
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(payload.webhook_url, json=discord_payload)
            return {"status": "success", "http_status": resp.status_code, "message": f"Alert #{payload.alert_id} dispatched to Webhook."}
    except Exception as e:
        return {
            "status": "simulated",
            "message": f"Simulated Alert dispatch created for Alert #{payload.alert_id}. Notice: {str(e)}"
        }
