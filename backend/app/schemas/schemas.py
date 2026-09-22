from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "analyst"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

# Service Schema
class ServiceOut(BaseModel):
    id: int
    port: int
    protocol: str
    service_name: str
    version: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

# Vulnerability Schema
class VulnerabilityOut(BaseModel):
    id: int
    asset_id: int
    cve_id: str
    title: str
    description: Optional[str] = None
    severity: str
    affected_service: Optional[str] = None
    remediation: Optional[str] = None
    status: str
    cvss_score: float
    detected_at: datetime
    class Config:
        from_attributes = True

# Hardening Check Schema
class HardeningCheckOut(BaseModel):
    id: int
    asset_id: int
    os_type: str
    control_id: str
    category: str
    control_name: str
    status: str
    rationale: Optional[str] = None
    remediation: Optional[str] = None
    class Config:
        from_attributes = True

# Asset Schema
class AssetOut(BaseModel):
    id: int
    ip_address: str
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    os_name: Optional[str] = None
    category: str
    status: str
    risk_score: float
    is_unknown: bool
    created_at: datetime
    services: List[ServiceOut] = []
    vulnerabilities: List[VulnerabilityOut] = []
    class Config:
        from_attributes = True

class AssetCreate(BaseModel):
    ip_address: str
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    os_name: Optional[str] = None
    category: Optional[str] = "Workstation"
    is_unknown: Optional[bool] = False

# Log Schema
class LogCreate(BaseModel):
    log_type: str # Windows Event, Linux Auth, SSH, Web, Firewall
    message: str
    source_ip: Optional[str] = None
    host_name: Optional[str] = None
    event_code: Optional[str] = None

class LogOut(BaseModel):
    id: int
    timestamp: datetime
    log_type: str
    source_ip: Optional[str] = None
    host_name: Optional[str] = None
    event_code: Optional[str] = None
    message: str
    parsed_json: Optional[str] = None
    class Config:
        from_attributes = True

# Alert Schema
class AlertOut(BaseModel):
    id: int
    rule_id: Optional[str] = None
    rule_name: str
    timestamp: datetime
    source: str
    affected_asset_id: Optional[int] = None
    severity: str
    evidence: str
    status: str
    recommended_action: Optional[str] = None
    class Config:
        from_attributes = True

# Incident Schema
class IncidentOut(BaseModel):
    id: int
    incident_id_str: str
    title: str
    description: str
    severity: str
    affected_asset_id: Optional[int] = None
    status: str
    assigned_analyst: str
    containment_actions: Optional[str] = None
    timeline_json: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str
    affected_asset_id: Optional[int] = None
    assigned_analyst: Optional[str] = "Security Team"

class IncidentStatusUpdate(BaseModel):
    status: str
    assigned_analyst: Optional[str] = None
    action_note: Optional[str] = None

# AD Schemas
class ADUserOut(BaseModel):
    id: int
    username: str
    display_name: str
    user_principal_name: Optional[str] = None
    password_last_set: Optional[datetime] = None
    is_admin: bool
    is_disabled: bool
    password_never_expires: bool
    bad_pwd_count: int
    last_logon: Optional[datetime] = None
    class Config:
        from_attributes = True

class ADGroupOut(BaseModel):
    id: int
    group_name: str
    description: Optional[str] = None
    member_count: int
    is_privileged: bool
    members_json: Optional[str] = None
    class Config:
        from_attributes = True

# Detection Rule Schema
class DetectionRuleOut(BaseModel):
    id: int
    rule_name: str
    category: str
    severity: str
    description: str
    query_pattern: str
    threshold: int
    window_seconds: int
    is_active: bool
    class Config:
        from_attributes = True

class DetectionRuleCreate(BaseModel):
    rule_name: str
    category: str
    severity: str
    description: str
    query_pattern: str
    threshold: int = 5
    window_seconds: int = 60

# IP Activity Schema
class IPActivityOut(BaseModel):
    id: int
    ip_address: str
    packet_count: int
    byte_count: int
    protocol: str
    first_seen: datetime
    last_seen: datetime
    is_suspicious: bool
    flags: Optional[str] = None
    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    username: str
    action: str
    target: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    class Config:
        from_attributes = True

# SIEM Summary Schema
class SiemSummary(BaseModel):
    total_security_events: int
    critical_alerts: int
    high_alerts: int
    failed_logins: int
    vulnerabilities_total: int
    monitored_assets: int
    suspicious_ips: int
    active_incidents: int
    overall_posture_score: float
    ad_hardening_score: float
    system_hardening_score: float
