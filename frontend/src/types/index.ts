export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type IncidentStatus = 'Detection' | 'Alert' | 'Investigation' | 'Risk Assessment' | 'Containment' | 'Remediation' | 'Verification' | 'Resolved';

export interface Service {
  id: number;
  port: number;
  protocol: string;
  service_name: string;
  version?: string;
  status: string;
}

export interface Vulnerability {
  id: number;
  asset_id: number;
  cve_id: string;
  title: string;
  description?: string;
  severity: Severity;
  affected_service?: string;
  remediation?: string;
  status: string;
  cvss_score: number;
  detected_at: string;
}

export interface Asset {
  id: number;
  ip_address: string;
  hostname?: string;
  mac_address?: string;
  os_name?: string;
  category: string;
  status: string;
  risk_score: number;
  is_unknown: boolean;
  created_at: string;
  services: Service[];
  vulnerabilities: Vulnerability[];
}

export interface SecurityLog {
  id: number;
  timestamp: string;
  log_type: string;
  source_ip?: string;
  host_name?: string;
  event_code?: string;
  message: string;
  parsed_json?: string;
}

export interface SecurityAlert {
  id: number;
  rule_id?: string;
  rule_name: string;
  timestamp: string;
  source: string;
  affected_asset_id?: number;
  severity: Severity;
  evidence: string;
  status: string;
  recommended_action?: string;
}

export interface Incident {
  id: number;
  incident_id_str: string;
  title: string;
  description: string;
  severity: Severity;
  affected_asset_id?: number;
  status: IncidentStatus;
  assigned_analyst: string;
  containment_actions?: string;
  timeline_json?: string;
  created_at: string;
}

export interface ADUser {
  id: number;
  username: string;
  display_name: string;
  user_principal_name?: string;
  password_last_set?: string;
  is_admin: boolean;
  is_disabled: boolean;
  password_never_expires: boolean;
  bad_pwd_count: number;
  last_logon?: string;
}

export interface ADGroup {
  id: number;
  group_name: string;
  description?: string;
  member_count: number;
  is_privileged: boolean;
  members_json?: string;
}

export interface HardeningCheck {
  id: number;
  asset_id: number;
  os_type: string;
  control_id: string;
  category: string;
  control_name: string;
  status: 'Passed' | 'Failed' | 'Warning';
  rationale?: string;
  remediation?: string;
}

export interface DetectionRule {
  id: number;
  rule_name: string;
  category: string;
  severity: Severity;
  description: string;
  query_pattern: string;
  threshold: number;
  window_seconds: number;
  is_active: boolean;
}

export interface SiemSummaryMetrics {
  total_security_events: number;
  critical_alerts: number;
  high_alerts: number;
  failed_logins: number;
  vulnerabilities_total: number;
  monitored_assets: number;
  suspicious_ips: number;
  active_incidents: number;
  overall_posture_score: number;
  enterprise_risk_level: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  target: string;
  details?: string;
  ip_address?: string;
}

export interface LogNetworkDependencyNode {
  id: string;
  name: string;
  log_type: string;
  target_host: string;
  port: number;
  protocol: string;
  category: string;
  description: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency_ms: number | null;
  required: boolean;
  last_checked: string;
}

export interface LogSystemFileIntegrity {
  name: string;
  path: string;
  type: string;
  status: 'VALID' | 'MISSING_OR_VIRTUAL';
  readable: boolean;
}

export interface LogNetworkDependencySummary {
  timestamp: string;
  overall_health_score: number;
  total_dependencies_checked: number;
  healthy_nodes: number;
  degraded_nodes: number;
  average_latency_ms: number;
  log_nodes: LogNetworkDependencyNode[];
  system_files: LogSystemFileIntegrity[];
  alerts: { severity: string; message: string }[];
}

export interface GisBreachEvent {
  id: string;
  timestamp: string;
  attacker_ip: string;
  country: string;
  country_code: string;
  flag: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  threat_actor: string;
  severity: Severity;
  mitre_technique?: string;
  protocol?: string;
  attack_vector: string;
  data_stolen_mb: number;
  exfil_speed_mbs?: number;
  affected_records: number;
  target_asset: string;
  target_table: string;
  target_latitude: number;
  target_longitude: number;
  status: string;
  is_contained?: boolean;
}

export interface GisSummaryMetrics {
  total_breaches_detected: number;
  critical_breaches_count: number;
  total_stolen_data_gb: number;
  total_compromised_records: number;
  active_exfiltration_rate_mbs?: number;
  contained_threats_count?: number;
  top_origin_countries: { country: string; count: number }[];
  monitored_soc_target: string;
  last_updated: string;
}


