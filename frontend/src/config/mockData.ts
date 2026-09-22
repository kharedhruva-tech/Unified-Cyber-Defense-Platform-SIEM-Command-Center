import type { 
  SiemSummaryMetrics, Asset, Vulnerability, SecurityLog, 
  SecurityAlert, Incident, DetectionRule, ADUser, ADGroup, 
  AuditLogItem, GisBreachEvent, GisSummaryMetrics 
} from '../types';

export const FALLBACK_METRICS: SiemSummaryMetrics = {
  total_security_events: 14890,
  critical_alerts: 2,
  high_alerts: 5,
  failed_logins: 42,
  vulnerabilities_total: 6,
  monitored_assets: 8,
  suspicious_ips: 14,
  active_incidents: 3,
  overall_posture_score: 72,
  enterprise_risk_level: "HIGH"
};

export const FALLBACK_ASSETS: Asset[] = [
  { id: 1, ip_address: "192.168.1.10", hostname: "DC-01", mac_address: "00:50:56:A1:B2:C3", os_name: "Windows Server 2022", category: "Domain Controller", status: "Active", risk_score: 85, is_unknown: false, created_at: "2026-09-01", services: [], vulnerabilities: [] },
  { id: 2, ip_address: "192.168.1.1", hostname: "FW-01", mac_address: "00:50:56:FE:DC:BA", os_name: "pfSense / FreeBSD", category: "Firewall", status: "Active", risk_score: 25, is_unknown: false, created_at: "2026-09-01", services: [], vulnerabilities: [] },
  { id: 3, ip_address: "192.168.1.50", hostname: "KALI-01", mac_address: "00:0C:29:D3:54:A4", os_name: "Kali Linux 2024.1", category: "Security Machine", status: "Active", risk_score: 40, is_unknown: false, created_at: "2026-09-01", services: [], vulnerabilities: [] },
  { id: 4, ip_address: "192.168.1.20", hostname: "SQL-01", mac_address: "00:50:56:77:88:99", os_name: "Ubuntu 22.04 LTS", category: "Database Server", status: "Active", risk_score: 60, is_unknown: false, created_at: "2026-09-01", services: [], vulnerabilities: [] },
  { id: 5, ip_address: "192.168.1.30", hostname: "WAF-01", mac_address: "00:50:56:11:22:33", os_name: "Debian 12 Nginx", category: "Web Gateway", status: "Active", risk_score: 35, is_unknown: false, created_at: "2026-09-01", services: [], vulnerabilities: [] }
];

export const FALLBACK_VULNERABILITIES: Vulnerability[] = [
  { id: 1, asset_id: 1, cve_id: "CVE-2017-0144", title: "MS17-010 EternalBlue Remote Code Execution", severity: "Critical", cvss_score: 9.8, status: "Open", detected_at: "2026-09-22", remediation: "Apply Microsoft KB4012212 patch and disable SMBv1 protocol." },
  { id: 2, asset_id: 4, cve_id: "CVE-2018-15473", title: "OpenSSH Username Enumeration Anomaly", severity: "High", cvss_score: 7.5, status: "Open", detected_at: "2026-09-22", remediation: "Upgrade OpenSSH daemon package to version 8.4+." },
  { id: 3, asset_id: 5, cve_id: "CVE-2016-2183", title: "SSL/TLS Weak Cipher Suite Support", severity: "Medium", cvss_score: 5.3, status: "In Progress", detected_at: "2026-09-22", remediation: "Disable 64-bit block size ciphers (SWEET32 attack mitigation)." }
];

export const FALLBACK_LOGS: SecurityLog[] = [
  { id: 1, timestamp: "12:04:12", log_type: "SSH_AUTH", source_ip: "45.142.120.10", host_name: "DC-01", event_code: "SSH-501", message: "Failed password for root from 45.142.120.10 port 49202 ssh2" },
  { id: 2, timestamp: "12:04:08", log_type: "FIREWALL", source_ip: "183.240.12.5", host_name: "FW-01", event_code: "FW-DROP", message: "DENY TCP 183.240.12.5:54321 -> 192.168.1.10:445 (SMB Probe)" },
  { id: 3, timestamp: "12:03:50", log_type: "AD_AUDIT", source_ip: "192.168.1.50", host_name: "DC-01", event_code: "4625", message: "An account failed to log on. SubjectUser: bad_actor, TargetUser: Administrator" },
  { id: 4, timestamp: "12:03:22", log_type: "SYSLOG", source_ip: "192.168.1.20", host_name: "SQL-01", event_code: "DB-SEC", message: "PostgreSQL audit: Unauthorized access attempt to database 'customer_pii'" }
];

export const FALLBACK_RULES: DetectionRule[] = [
  { id: 1, rule_name: "MS17-010 EternalBlue SMB Exploit Attempt", category: "Exploit Detection", severity: "Critical", description: "Detects SMB payload buffer attacks on TCP 445", query_pattern: "log_type == 'FIREWALL' AND port == 445", threshold: 1, window_seconds: 60, is_active: true },
  { id: 2, rule_name: "Brute Force SSH Password Spraying Spike", category: "Credential Abuse", severity: "High", description: "Detects >5 failed SSH logons per minute", query_pattern: "log_type == 'SSH_AUTH' AND count(failed) > 5", threshold: 5, window_seconds: 60, is_active: true },
  { id: 3, rule_name: "Active Directory Account Lockout Anomaly", category: "Identity Audit", severity: "Medium", description: "Detects EventID 4625 failed logons", query_pattern: "EventID == 4625", threshold: 3, window_seconds: 120, is_active: true }
];

export const FALLBACK_ALERTS: SecurityAlert[] = [
  { id: 1, rule_name: "MS17-010 EternalBlue Exploit Attempt", severity: "Critical", timestamp: "12:04:12 UTC", source: "SIGMA Engine", evidence: "Targeted TCP 445 with Metasploit SMB payload buffer", recommended_action: "Contain IP 45.142.120.10 on perimeter firewall and isolate host DC-01.", status: "Active" },
  { id: 2, rule_name: "Brute Force SSH Password Spray", severity: "High", timestamp: "12:03:50 UTC", source: "Log Analytics", evidence: "Detected 42 failed SSH authentication attempts within 60 seconds", recommended_action: "Enforce Fail2ban IP ban and update Kerberos lockout policy.", status: "Active" }
];

export const FALLBACK_INCIDENTS: Incident[] = [
  { id: 1, incident_id_str: "INC-2026-001", title: "Unauthenticated Remote Code Execution Attempt on DC-01", description: "Perimeter firewall detected MS17-010 exploit payload targeted at Active Directory Domain Controller.", severity: "Critical", status: "Investigation", assigned_analyst: "dhruva_analyst", created_at: "2026-09-22 12:00:00" }
];

export const FALLBACK_AD_USERS: ADUser[] = [
  { id: 1, username: "Administrator", display_name: "Domain Administrator", role: "Domain Admin", is_admin: true, is_disabled: false, password_never_expires: true, bad_pwd_count: 0, last_logon: "Just now" } as any,
  { id: 2, username: "dhruva_analyst", display_name: "Dhruva Analyst", role: "Security Analyst", is_admin: true, is_disabled: false, password_never_expires: false, bad_pwd_count: 0, last_logon: "10 mins ago" } as any,
  { id: 3, username: "service_sql", display_name: "SQL Service Account", role: "Service Account", is_admin: false, is_disabled: false, password_never_expires: true, bad_pwd_count: 0, last_logon: "1 hour ago" } as any
];

export const FALLBACK_AD_GROUPS: ADGroup[] = [
  { id: 1, group_name: "Domain Admins", description: "Full Administrative Control over AD Domain", member_count: 2, is_privileged: true },
  { id: 2, group_name: "SOC Security Operations", description: "Analyst Incident Escalation & Response", member_count: 5, is_privileged: true }
];

export const FALLBACK_AUDIT_LOGS: AuditLogItem[] = [
  { id: 1, timestamp: "12:04:30", username: "dhruva_analyst", action: "CONTAIN_IP", target: "45.142.120.10", details: "Contained source IP 45.142.120.10 on Cloudflare WAF" },
  { id: 2, timestamp: "11:30:00", username: "admin", action: "UPDATE_GPO", target: "Domain Policy", details: "Enforced Account Lockout Threshold to 5 attempts" }
];

export const FALLBACK_GIS_BREACHES: GisBreachEvent[] = [
  { id: "1", timestamp: "12:04:12", attacker_ip: "45.142.120.10", country: "Russia", country_code: "RU", flag: "🇷🇺", city: "Moscow", latitude: 55.7558, longitude: 37.6173, isp: "Rostelecom", threat_actor: "APT28", severity: "Critical", attack_vector: "MS17-010 SMB Exploit", data_stolen_mb: 450, affected_records: 1200, target_asset: "192.168.1.10", target_table: "ad_users", target_latitude: 38.8951, target_longitude: -77.0364, status: "Active" },
  { id: "2", timestamp: "12:03:50", attacker_ip: "183.240.12.5", country: "China", country_code: "CN", flag: "🇨🇳", city: "Shenzhen", latitude: 22.5431, longitude: 114.0579, isp: "China Telecom", threat_actor: "APT41", severity: "High", attack_vector: "SSH Brute Force", data_stolen_mb: 120, affected_records: 350, target_asset: "192.168.1.20", target_table: "customer_pii", target_latitude: 50.1109, target_longitude: 8.6821, status: "Active" }
];

export const FALLBACK_GIS_SUMMARY: GisSummaryMetrics = {
  total_breaches_detected: 42,
  critical_breaches_count: 5,
  total_stolen_data_gb: 12.4,
  total_compromised_records: 15400,
  top_origin_countries: [{ country: "Russia", count: 18 }, { country: "China", count: 12 }],
  monitored_soc_target: "HQ Datacenter (US-East)",
  last_updated: "Just now"
};

export const FALLBACK_NETWORK_DATA = {
  total_packets: 44370,
  total_bytes: "62.3 MB",
  active_connections: 142,
  top_talkers: [
    { ip: "45.142.120.10", packets: 14200 },
    { ip: "192.168.1.10", packets: 12500 },
    { ip: "183.240.12.5", packets: 8900 },
    { ip: "192.168.1.50", packets: 5400 },
    { ip: "192.168.1.20", packets: 3370 }
  ],
  suspicious_flows: [
    { id: "FLOW-901", timestamp: "12:04:12", src_ip: "45.142.120.10", dst_ip: "192.168.1.10", protocol: "TCP", port: 445, indicator: "MS17-010 EternalBlue SMB Exploit Payload (Metasploit buffer)", severity: "Critical", packet_count: 1420, bytes: "2.4 MB" },
    { id: "FLOW-902", timestamp: "12:03:50", src_ip: "183.240.12.5", dst_ip: "192.168.1.20", protocol: "TCP", port: 22, indicator: "SSH Brute Force Password Spraying Sweep (>50 auth pkts/min)", severity: "High", packet_count: 890, bytes: "1.1 MB" },
    { id: "FLOW-903", timestamp: "12:02:15", src_ip: "192.168.1.50", dst_ip: "192.168.1.10", protocol: "ARP", port: 0, indicator: "Duplicate IP Address / ARP Spoofing Probe (MITM Capture)", severity: "High", packet_count: 320, bytes: "450 KB" },
    { id: "FLOW-904", timestamp: "11:58:30", src_ip: "192.168.1.30", dst_ip: "8.8.8.8", protocol: "UDP", port: 53, indicator: "Anomalous High-Entropy TXT DNS Tunneling Query", severity: "Medium", packet_count: 150, bytes: "180 KB" }
  ]
};
