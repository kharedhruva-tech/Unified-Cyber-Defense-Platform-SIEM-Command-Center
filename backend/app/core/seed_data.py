import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, Asset, Service, Vulnerability, CVE, SecurityEvent, Log, Alert, Incident,
    DetectionRule, IPActivity, ADUser, ADGroup, HardeningCheck, RemediationTask, AuditLog
)
from app.core.security import get_password_hash

def seed_database(db: Session):
    """Populates initial enterprise lab dataset & ensures all 8 role users exist."""
    print("Verifying & Seeding Enterprise Cyber Defense Laboratory Users...")
    
    # 1. Ensure all 8 Enterprise Demo Users exist
    demo_users = [
        {"username": "admin", "email": "soc_admin@cyberdefense.lab", "pass": "Admin123!", "role": "admin"},
        {"username": "soc_manager", "email": "manager@cyberdefense.lab", "pass": "Manager123!", "role": "soc_manager"},
        {"username": "analyst_dhruva", "email": "dhruva.soc@cyberdefense.lab", "pass": "Analyst123!", "role": "analyst"},
        {"username": "responder_alex", "email": "alex.ir@cyberdefense.lab", "pass": "Responder123!", "role": "incident_responder"},
        {"username": "vuln_sarah", "email": "sarah.vuln@cyberdefense.lab", "pass": "Vuln123!", "role": "vuln_analyst"},
        {"username": "net_marcus", "email": "marcus.net@cyberdefense.lab", "pass": "Net123!", "role": "network_analyst"},
        {"username": "auditor", "email": "auditor@cyberdefense.lab", "pass": "Auditor123!", "role": "auditor"},
        {"username": "executive_viewer", "email": "exec@cyberdefense.lab", "pass": "Viewer123!", "role": "viewer"},
    ]

    for u_info in demo_users:
        existing = db.query(User).filter(User.username == u_info["username"]).first()
        if not existing:
            new_user = User(
                username=u_info["username"],
                email=u_info["email"],
                hashed_password=get_password_hash(u_info["pass"]),
                role=u_info["role"]
            )
            db.add(new_user)
        else:
            existing.hashed_password = get_password_hash(u_info["pass"])
            existing.role = u_info["role"]
            db.add(existing)
    db.commit()

    # Check if telemetry assets are already seeded
    if db.query(Asset).first():
        return

    # 2. Assets (Servers, Workstations, Domain Controllers, Shadow IT)
    assets_data = [
        {"ip": "192.168.1.10", "hostname": "DC-PRIMARY-01.corp.local", "os": "Windows Server 2022", "cat": "Domain Controller", "score": 28.5, "unknown": False},
        {"ip": "192.168.1.11", "hostname": "DC-BACKUP-02.corp.local", "os": "Windows Server 2022", "cat": "Domain Controller", "score": 15.0, "unknown": False},
        {"ip": "192.168.1.25", "hostname": "WEB-PROD-APP01", "os": "Ubuntu Linux 22.04 LTS", "cat": "Server", "score": 85.0, "unknown": False},
        {"ip": "192.168.1.30", "hostname": "DB-POSTGRES-01", "os": "Red Hat Enterprise Linux 9", "cat": "Server", "score": 42.0, "unknown": False},
        {"ip": "192.168.1.50", "hostname": "WORKSTATION-SEC-01", "os": "Windows 11 Enterprise", "cat": "Workstation", "score": 68.0, "unknown": False},
        {"ip": "192.168.1.55", "hostname": "WORKSTATION-FIN-04", "os": "Windows 11 Enterprise", "cat": "Workstation", "score": 12.0, "unknown": False},
        {"ip": "192.168.1.99", "hostname": "SHADOW-NAS-UNAUTH", "os": "Debian NAS OS", "cat": "Workstation", "score": 92.0, "unknown": True},
        {"ip": "10.0.0.1", "hostname": "FW-PALOALTO-CORE", "os": "PAN-OS 10.2", "cat": "Firewall", "score": 8.0, "unknown": False}
    ]

    assets_db = []
    for item in assets_data:
        asset = Asset(
            ip_address=item["ip"],
            hostname=item["hostname"],
            mac_address=f"52:54:00:{hash(item['ip'])%90+10}:34:78",
            os_name=item["os"],
            category=item["cat"],
            status="Online",
            risk_score=item["score"],
            is_unknown=item["unknown"]
        )
        db.add(asset)
        assets_db.append(asset)
    db.commit()

    # 3. Open Services
    services_data = [
        (assets_db[0].id, 53, "UDP", "DNS", "BIND 9.18"),
        (assets_db[0].id, 88, "TCP", "KERBEROS", "MS Kerberos v5"),
        (assets_db[0].id, 389, "TCP", "LDAP", "Active Directory LDAP"),
        (assets_db[0].id, 445, "TCP", "SMB", "Microsoft SMBv3"),
        (assets_db[0].id, 3389, "TCP", "RDP", "Remote Desktop Protocol"),
        (assets_db[2].id, 22, "TCP", "SSH", "OpenSSH 8.9p1"),
        (assets_db[2].id, 80, "TCP", "HTTP", "nginx 1.18.0"),
        (assets_db[2].id, 443, "TCP", "HTTPS", "nginx 1.18.0 OpenSSL 3.0.2"),
        (assets_db[3].id, 5432, "TCP", "POSTGRESQL", "PostgreSQL 15.2"),
        (assets_db[6].id, 21, "TCP", "FTP", "vsftpd 2.3.4 (Vulnerable)"),
        (assets_db[6].id, 23, "TCP", "TELNET", "Insecure Telnet Daemon"),
        (assets_db[6].id, 8080, "TCP", "HTTP-ALT", "Apache Tomcat 9.0")
    ]
    for a_id, port, proto, name, ver in services_data:
        db.add(Service(asset_id=a_id, port=port, protocol=proto, service_name=name, version=ver, status="Open"))
    db.commit()

    # 4. Vulnerabilities & CVE Catalog
    cve_data = [
        CVE(cve_id="CVE-2021-44228", title="Apache Log4j2 Log4Shell RCE", cvss_score=10.0, published_date="2021-12-10"),
        CVE(cve_id="CVE-2017-0144", title="EternalBlue SMBv1 RCE", cvss_score=9.8, published_date="2017-03-14"),
        CVE(cve_id="CVE-2023-23397", title="Microsoft Outlook Privilege Escalation", cvss_score=9.8, published_date="2023-03-14"),
        CVE(cve_id="CVE-2022-26923", title="Active Directory Domain Privilege Escalation", cvss_score=8.8, published_date="2022-05-10"),
        CVE(cve_id="CVE-2023-38831", title="WinRAR Remote Code Execution", cvss_score=7.8, published_date="2023-08-23")
    ]
    db.add_all(cve_data)
    db.commit()

    vulns_list = [
        Vulnerability(
            asset_id=assets_db[2].id,
            cve_id="CVE-2021-44228",
            title="Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
            description="JNDI lookup feature in Log4j2 handles uncontrolled user input allowing unauthenticated RCE.",
            severity="Critical",
            affected_service="HTTP / Tomcat App Engine",
            remediation="Upgrade Log4j dependency to version >= 2.17.1 immediately.",
            status="Open",
            cvss_score=10.0
        ),
        Vulnerability(
            asset_id=assets_db[6].id,
            cve_id="CVE-2017-0144",
            title="MS17-010 EternalBlue SMBv1 Arbitrary Code Execution",
            description="Unauthenticated SMBv1 payload execution vulnerability.",
            severity="Critical",
            affected_service="SMBv1 / Unsanctioned NAS",
            remediation="Isolate device, disable SMBv1, or remove unapproved Shadow IT hardware.",
            status="Open",
            cvss_score=9.8
        ),
        Vulnerability(
            asset_id=assets_db[0].id,
            cve_id="CVE-2022-26923",
            title="Active Directory Domain Services Elevation of Privilege",
            description="Allows machine account certificate forgery to impersonate Domain Admins.",
            severity="High",
            affected_service="Active Directory Domain Controller",
            remediation="Deploy KB5014754 security patch across all Domain Controllers.",
            status="Open",
            cvss_score=8.8
        ),
        Vulnerability(
            asset_id=assets_db[4].id,
            cve_id="CVE-2023-38831",
            title="WinRAR Compressed Archive Executable Spoofing",
            description="Malicious ZIP archive execution when opened by security analyst.",
            severity="Medium",
            affected_service="WinRAR Endpoint Archiver",
            remediation="Update WinRAR endpoint software to 6.23.",
            status="Investigating",
            cvss_score=7.8
        )
    ]
    db.add_all(vulns_list)
    db.commit()

    # 5. Security Logs
    now = datetime.datetime.utcnow()
    sample_logs = [
        Log(timestamp=now - datetime.timedelta(minutes=5), log_type="Windows Event", source_ip="45.142.120.10", host_name="DC-PRIMARY-01", event_code="4625", message="An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10", parsed_json='{"event":"Failed Logon", "attempts": 1}'),
        Log(timestamp=now - datetime.timedelta(minutes=4), log_type="Windows Event", source_ip="45.142.120.10", host_name="DC-PRIMARY-01", event_code="4625", message="An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10", parsed_json='{"event":"Failed Logon", "attempts": 2}'),
        Log(timestamp=now - datetime.timedelta(minutes=3), log_type="Windows Event", source_ip="45.142.120.10", host_name="DC-PRIMARY-01", event_code="4625", message="An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10", parsed_json='{"event":"Failed Logon", "attempts": 3}'),
        Log(timestamp=now - datetime.timedelta(minutes=2), log_type="Windows Event", source_ip="45.142.120.10", host_name="DC-PRIMARY-01", event_code="4625", message="An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10", parsed_json='{"event":"Failed Logon", "attempts": 4}'),
        Log(timestamp=now - datetime.timedelta(minutes=1), log_type="Windows Event", source_ip="45.142.120.10", host_name="DC-PRIMARY-01", event_code="4625", message="An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10", parsed_json='{"event":"Failed Logon", "attempts": 5}'),
        Log(timestamp=now - datetime.timedelta(minutes=18), log_type="Linux Auth", source_ip="192.168.1.50", host_name="WEB-PROD-APP01", event_code="SSH_AUTH_FAIL", message="Failed password for invalid user admin from 192.168.1.50 port 44210 ssh2", parsed_json='{"service":"sshd"}'),
        Log(timestamp=now - datetime.timedelta(minutes=35), log_type="Windows Event", source_ip="192.168.1.10", host_name="DC-PRIMARY-01", event_code="4728", message="A member was added to a security-enabled global group Domain Admins. Added Member: bad_actor_user", parsed_json='{"group":"Domain Admins"}')
    ]
    db.add_all(sample_logs)
    db.commit()

    # 6. Detection Rules
    rules_data = [
        DetectionRule(rule_name="Brute-Force Authentication Attempt", category="Authentication", severity="High", description="Detects >= 5 failed login attempts within 60 seconds from the same source IP.", query_pattern="4625", threshold=5, window_seconds=60, is_active=True),
        DetectionRule(rule_name="Unauthorized Privilege Escalation (Domain Admins)", category="Active Directory", severity="Critical", description="Detects account additions to Domain Admins or Enterprise Admins group.", query_pattern="4728", threshold=1, window_seconds=300, is_active=True),
        DetectionRule(rule_name="Suspicious Outbound SMB Connection Sweep", category="Network", severity="Critical", description="Identifies external IP addresses making direct SMB connection attempts on port 445.", query_pattern="SMB_SWEEP", threshold=3, window_seconds=120, is_active=True),
        DetectionRule(rule_name="SQL Injection Web Attack Pattern", category="Web Application Security", severity="High", description="Detects SQL keyword injection attempts in HTTP request URI parameters.", query_pattern="UNION SELECT", threshold=1, window_seconds=60, is_active=True)
    ]
    db.add_all(rules_data)
    db.commit()

    # 7. Alerts
    alerts_data = [
        Alert(rule_id="1", rule_name="Brute-Force Authentication Attempt", timestamp=now - datetime.timedelta(minutes=1), source="Log Monitor", affected_asset_id=assets_db[0].id, severity="High", evidence="Detected 5 failed login attempts targeting Administrator on DC-PRIMARY-01 from 45.142.120.10", status="Open", recommended_action="Block IP 45.142.120.10 on Palo Alto Firewall and enforce Account Lockout Policy."),
        Alert(rule_id="2", rule_name="Unauthorized Privilege Escalation (Domain Admins)", timestamp=now - datetime.timedelta(minutes=35), source="AD Security Monitor", affected_asset_id=assets_db[0].id, severity="Critical", evidence="Account 'bad_actor_user' added to Domain Admins group by SYSTEM without ticket reference.", status="Open", recommended_action="Revoke Domain Admin rights immediately, audit GPO log, and reset Kerberos ticket keys."),
        Alert(rule_id="3", rule_name="Unsanctioned Shadow IT System Discovered", timestamp=now - datetime.timedelta(hours=2), source="Nmap Asset Discovery", affected_asset_id=assets_db[6].id, severity="Medium", evidence="Host 192.168.1.99 exposing FTP (vsftpd 2.3.4) and Telnet without asset inventory tag.", status="Investigating", recommended_action="Quarantine network port on core switch and perform forensic inspection.")
    ]
    db.add_all(alerts_data)
    db.commit()

    # 8. Incidents
    incidents_data = [
        Incident(
            incident_id_str="INC-2026-0001",
            title="Critical AD Privilege Escalation & Domain Compromise Attempt",
            description="Unauthorized modification to Domain Admins group detected on primary Domain Controller DC-PRIMARY-01.",
            severity="Critical",
            affected_asset_id=assets_db[0].id,
            status="Investigation",
            assigned_analyst="Dhruva (SOC L2)",
            containment_actions='["Revoked bad_actor_user from Domain Admins", "Enforced Kerberos TGT Key Rotation"]',
            timeline_json='[{"time": "10:35:12", "event": "Event 4728 triggered alert #2"}, {"time": "10:37:45", "event": "Analyst assigned to ticket"}, {"time": "10:40:00", "event": "User privileges revoked"}]'
        ),
        Incident(
            incident_id_str="INC-2026-0002",
            title="External Brute Force Attack against RDP/SMB Gateway",
            description="External malicious IP 45.142.120.10 attempting password spraying against Windows Domain Controller.",
            severity="High",
            affected_asset_id=assets_db[0].id,
            status="Containment",
            assigned_analyst="SOC Team",
            containment_actions='["Blocked IP 45.142.120.10 on Firewall", "Enabled Account Lockout Policy"]',
            timeline_json='[{"time": "10:42:00", "event": "Log Parser correlated 5 failed logons"}, {"time": "10:44:10", "event": "Firewall block policy pushed"}]'
        )
    ]
    db.add_all(incidents_data)
    db.commit()

    # 9. Active Directory Users & Groups
    ad_users = [
        ADUser(username="Administrator", display_name="Domain Administrator", user_principal_name="admin@corp.local", is_admin=True, is_disabled=False, password_never_expires=True, bad_pwd_count=0),
        ADUser(username="dhruva_soc", display_name="Dhruva Security Lead", user_principal_name="dhruva@corp.local", is_admin=True, is_disabled=False, password_never_expires=False, bad_pwd_count=0),
        ADUser(username="svc_backup_admin", display_name="Backup Service Account", user_principal_name="svc_backup@corp.local", is_admin=True, is_disabled=False, password_never_expires=True, bad_pwd_count=0),
        ADUser(username="bad_actor_user", display_name="Suspicious Temporary Account", user_principal_name="temp_user@corp.local", is_admin=False, is_disabled=True, password_never_expires=False, bad_pwd_count=8)
    ]
    db.add_all(ad_users)

    ad_groups = [
        ADGroup(group_name="Domain Admins", description="Full administrative access across active directory domain", member_count=3, is_privileged=True, members_json='["Administrator", "dhruva_soc", "svc_backup_admin"]'),
        ADGroup(group_name="Enterprise Admins", description="Highest privilege group in active directory forest", member_count=2, is_privileged=True, members_json='["Administrator", "dhruva_soc"]'),
        ADGroup(group_name="Domain Users", description="Standard enterprise user group", member_count=145, is_privileged=False, members_json='["All Users"]')
    ]
    db.add_all(ad_groups)
    db.commit()

    # 10. CIS Infrastructure Hardening Checks
    hardening_checks = [
        HardeningCheck(asset_id=assets_db[0].id, os_type="Windows", control_id="CIS 1.1.1", category="Account Policy", control_name="Enforce Password History (24 passwords)", status="Passed", rationale="Prevents password reuse.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[0].id, os_type="Windows", control_id="CIS 1.1.2", category="Account Policy", control_name="Maximum Password Age (<= 60 days)", status="Passed", rationale="Forces periodic credential rotation.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[0].id, os_type="Windows", control_id="CIS 2.2.4", category="User Privileges", control_name="Deny Access from Network for Guest Accounts", status="Passed", rationale="Prevents anonymous network access.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[0].id, os_type="Windows", control_id="CIS 9.1.1", category="Firewall", control_name="Windows Defender Firewall Domain Profile Enabled", status="Passed", rationale="Ensures host firewall is active.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[0].id, os_type="Windows", control_id="CIS 2.3.1", category="Services", control_name="Disable SMBv1 Server Protocol", status="Failed", rationale="SMBv1 is vulnerable to EternalBlue RCE.", remediation="Run PowerShell command: Set-SmbServerConfiguration -EnableSMB1Protocol $false"),
        
        HardeningCheck(asset_id=assets_db[2].id, os_type="Linux", control_id="CIS 5.2.1", category="SSH Config", control_name="Disable SSH Root Login (PermitRootLogin no)", status="Passed", rationale="Prevents direct root brute force.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[2].id, os_type="Linux", control_id="CIS 5.2.2", category="SSH Config", control_name="Disable SSH Empty Passwords (PermitEmptyPasswords no)", status="Passed", rationale="Enforces authentication requirement.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[2].id, os_type="Linux", control_id="CIS 3.5.1", category="Firewall", control_name="Uncomplicated Firewall (ufw) Active", status="Passed", rationale="Controls incoming & outgoing network traffic.", remediation="N/A"),
        HardeningCheck(asset_id=assets_db[2].id, os_type="Linux", control_id="CIS 1.4.1", category="Security Updates", control_name="Unattended Security Upgrades Configured", status="Warning", rationale="Kernel updates pending restart.", remediation="Execute `sudo apt update && sudo apt upgrade` and schedule reboot.")
    ]
    db.add_all(hardening_checks)
    db.commit()

    # 11. Initial Audit Log
    db.add(AuditLog(username="SYSTEM", action="SYSTEM_INIT", target="Cyber Defense Platform", details="Database initialized and pre-loaded with enterprise lab dataset.", ip_address="127.0.0.1"))
    db.commit()

    print("Seeding completed successfully!")

