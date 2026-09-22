export interface RoleConfig {
  id: string;
  name: string;
  badgeText: string;
  badgeBg: string;
  badgeTextClass: string;
  badgeBorder: string;
  allowedTabs: string[];
  isReadOnly: boolean;
  featuresDescription: string;
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    id: 'admin',
    name: 'Admin',
    badgeText: 'ADMIN (FULL ACCESS)',
    badgeBg: 'bg-purple-50',
    badgeTextClass: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    allowedTabs: [
      'dashboard', 'assets', 'vulnerabilities', 'network', 'gis-map', 
      'logs', 'threat-detection', 'alerts', 'incidents', 
      'active-directory', 'hardening', 'reports', 'audit-logs', 'user-management'
    ],
    isReadOnly: false,
    featuresDescription: 'Full access, user management, roles & permissions, system settings, audit logs, all SOC modules'
  },
  soc_manager: {
    id: 'soc_manager',
    name: 'SOC Manager',
    badgeText: 'SOC MANAGER',
    badgeBg: 'bg-indigo-50',
    badgeTextClass: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    allowedTabs: ['dashboard', 'alerts', 'incidents', 'threat-detection', 'reports', 'audit-logs'],
    isReadOnly: false,
    featuresDescription: 'Dashboard, alerts, incidents, threat detection, reports, investigations, team monitoring'
  },
  analyst: {
    id: 'analyst',
    name: 'Security Analyst',
    badgeText: 'SECURITY ANALYST',
    badgeBg: 'bg-blue-50',
    badgeTextClass: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    allowedTabs: ['dashboard', 'logs', 'threat-detection', 'alerts', 'incidents', 'assets', 'vulnerabilities'],
    isReadOnly: false,
    featuresDescription: 'SIEM logs, threat detection, security alerts, incident management, asset discovery, vulnerability details'
  },
  incident_responder: {
    id: 'incident_responder',
    name: 'Incident Responder',
    badgeText: 'INCIDENT RESPONDER',
    badgeBg: 'bg-rose-50',
    badgeTextClass: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    allowedTabs: ['dashboard', 'alerts', 'incidents', 'logs'],
    isReadOnly: false,
    featuresDescription: 'Security alerts, incidents, investigation tools, evidence, response actions, incident status updates'
  },
  vuln_analyst: {
    id: 'vuln_analyst',
    name: 'Vulnerability Analyst',
    badgeText: 'VULN ANALYST',
    badgeBg: 'bg-amber-50',
    badgeTextClass: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    allowedTabs: ['dashboard', 'assets', 'vulnerabilities', 'reports', 'hardening'],
    isReadOnly: false,
    featuresDescription: 'Asset discovery, vulnerability management, CVE details, risk reports, remediation tracking'
  },
  network_analyst: {
    id: 'network_analyst',
    name: 'Network Analyst',
    badgeText: 'NETWORK ANALYST',
    badgeBg: 'bg-teal-50',
    badgeTextClass: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    allowedTabs: ['dashboard', 'network', 'gis-map', 'alerts', 'logs'],
    isReadOnly: false,
    featuresDescription: 'Network analysis, suspicious IPs, traffic information, GIS breach map, network alerts'
  },
  auditor: {
    id: 'auditor',
    name: 'Auditor / Compliance',
    badgeText: 'AUDITOR (READ-ONLY)',
    badgeBg: 'bg-emerald-50',
    badgeTextClass: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    allowedTabs: ['dashboard', 'reports', 'audit-logs', 'hardening', 'active-directory'],
    isReadOnly: true,
    featuresDescription: 'Security reports, audit logs, compliance information, read-only dashboard access'
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer / Executive',
    badgeText: 'EXECUTIVE VIEWER',
    badgeBg: 'bg-slate-100',
    badgeTextClass: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    allowedTabs: ['dashboard', 'alerts', 'reports'],
    isReadOnly: true,
    featuresDescription: 'Dashboard, security posture, high-level alerts, reports; read-only access'
  }
};

export const getRoleConfig = (roleKey: string | undefined): RoleConfig => {
  if (!roleKey) return ROLE_CONFIGS.analyst;
  const normalized = roleKey.toLowerCase().replace(/\s+/g, '_');
  return ROLE_CONFIGS[normalized] || ROLE_CONFIGS.analyst;
};

export const isTabAllowedForRole = (roleKey: string | undefined, tabId: string): boolean => {
  const config = getRoleConfig(roleKey);
  return config.allowedTabs.includes(tabId);
};
