import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="analyst") # admin, analyst, auditor
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    hostname = Column(String, index=True)
    mac_address = Column(String, nullable=True)
    os_name = Column(String, nullable=True) # e.g. Windows Server 2022, Ubuntu 22.04 LTS
    category = Column(String, default="Workstation") # Server, Workstation, Domain Controller, Firewall, IoT
    status = Column(String, default="Online") # Online, Offline, Compromised
    risk_score = Column(Float, default=0.0) # 0.0 - 100.0
    is_unknown = Column(Boolean, default=False) # Shadow IT flag
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    services = relationship("Service", back_populates="asset", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="asset", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="asset", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="asset", cascade="all, delete-orphan")
    hardening_checks = relationship("HardeningCheck", back_populates="asset", cascade="all, delete-orphan")

class NetworkScan(Base):
    __tablename__ = "network_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    target_range = Column(String, nullable=False)
    scan_type = Column(String, default="Nmap SYN Scan")
    scan_date = Column(DateTime, default=datetime.datetime.utcnow)
    total_hosts_found = Column(Integer, default=0)
    raw_nmap_xml = Column(Text, nullable=True)

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String, default="TCP") # TCP, UDP
    service_name = Column(String, nullable=False) # e.g. SSH, HTTP, RDP, Active Directory
    version = Column(String, nullable=True)
    status = Column(String, default="Open") # Open, Filtered, Closed
    
    asset = relationship("Asset", back_populates="services")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    cve_id = Column(String, index=True, nullable=False) # e.g. CVE-2023-38831
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, nullable=False) # Critical, High, Medium, Low, Informational
    affected_service = Column(String, nullable=True)
    remediation = Column(Text, nullable=True)
    status = Column(String, default="Open") # Open, Investigating, Remediated
    cvss_score = Column(Float, default=5.0)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    asset = relationship("Asset", back_populates="vulnerabilities")

class CVE(Base):
    __tablename__ = "cves"
    
    cve_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cvss_score = Column(Float, default=5.0)
    published_date = Column(String, nullable=True)
    reference_url = Column(String, nullable=True)

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source_host = Column(String, index=True)
    event_type = Column(String, nullable=False) # e.g., Failed Login, Privilege Change, Process Spawn
    severity = Column(String, default="Medium") # Critical, High, Medium, Low
    description = Column(Text, nullable=False)
    category = Column(String, default="Authentication")
    raw_log_id = Column(Integer, nullable=True)

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    log_type = Column(String, index=True) # Windows Event, Linux Auth, SSH, Web, Firewall
    source_ip = Column(String, index=True, nullable=True)
    host_name = Column(String, index=True, nullable=True)
    event_code = Column(String, nullable=True) # e.g., 4625 for Windows failed logon
    message = Column(Text, nullable=False)
    parsed_json = Column(Text, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String, index=True, nullable=True)
    rule_name = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source = Column(String, nullable=False) # e.g., Log Monitor, Network PCAP Analyzer, AD Audit
    affected_asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    severity = Column(String, nullable=False) # Critical, High, Medium, Low
    evidence = Column(Text, nullable=False)
    status = Column(String, default="Open") # Open, Investigating, Remediated, Dismissed
    recommended_action = Column(Text, nullable=True)
    
    asset = relationship("Asset", back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id_str = Column(String, unique=True, index=True) # e.g. INC-2026-0042
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # Critical, High, Medium, Low
    affected_asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="Detection") # Detection, Alert, Investigation, Risk Assessment, Containment, Remediation, Verification, Resolved
    assigned_analyst = Column(String, default="Unassigned")
    containment_actions = Column(Text, nullable=True) # JSON list of executed actions e.g. ["Isolated Host 192.168.1.50", "Blocked IP 45.142.120.10"]
    timeline_json = Column(Text, nullable=True) # History array of timeline entries
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    asset = relationship("Asset", back_populates="incidents")

class DetectionRule(Base):
    __tablename__ = "detection_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, nullable=False)
    category = Column(String, default="Authentication") # Authentication, Network, Privilege Escalation, Active Directory
    severity = Column(String, default="High")
    description = Column(Text, nullable=False)
    query_pattern = Column(String, nullable=False) # e.g., "event_code == 4625" or "Failed password for"
    threshold = Column(Integer, default=5) # Count required within window
    window_seconds = Column(Integer, default=60) # Time window in seconds
    is_active = Column(Boolean, default=True)

class IPActivity(Base):
    __tablename__ = "ip_activity"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    packet_count = Column(Integer, default=0)
    byte_count = Column(Integer, default=0)
    protocol = Column(String, default="TCP")
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    is_suspicious = Column(Boolean, default=False)
    flags = Column(String, nullable=True) # e.g. "PORT_SCAN, BRUTE_FORCE"

class ADUser(Base):
    __tablename__ = "ad_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    user_principal_name = Column(String, nullable=True)
    password_last_set = Column(DateTime, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_disabled = Column(Boolean, default=False)
    password_never_expires = Column(Boolean, default=False)
    bad_pwd_count = Column(Integer, default=0)
    last_logon = Column(DateTime, nullable=True)

class ADGroup(Base):
    __tablename__ = "ad_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    member_count = Column(Integer, default=0)
    is_privileged = Column(Boolean, default=False) # e.g., Domain Admins, Enterprise Admins
    members_json = Column(Text, nullable=True)

class HardeningCheck(Base):
    __tablename__ = "hardening_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    os_type = Column(String, nullable=False) # Windows, Linux
    control_id = Column(String, nullable=False) # CIS 1.1.1, CIS 2.2.4
    category = Column(String, nullable=False) # Account Policy, Firewall, SSH, Audit Policy, Service Config
    control_name = Column(String, nullable=False)
    status = Column(String, nullable=False) # Passed, Failed, Warning
    rationale = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    
    asset = relationship("Asset", back_populates="hardening_checks")

class RemediationTask(Base):
    __tablename__ = "remediation_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    asset_id = Column(Integer, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, In Progress, Completed
    due_date = Column(DateTime, nullable=True)
    assigned_to = Column(String, default="Security Team")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    username = Column(String, nullable=False)
    action = Column(String, nullable=False) # e.g., "BLOCKED_IP", "ISOLATED_HOST", "UPDATED_RULE"
    target = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)




