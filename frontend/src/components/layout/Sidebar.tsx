import React from 'react';
import { 
  LayoutDashboard, Server, ShieldAlert, Network, FileText, Zap,
  Bell, AlertTriangle, Key, ShieldCheck, FileCheck, History, Globe, Users, LogOut, User
} from 'lucide-react';
import { isTabAllowedForRole, getRoleConfig } from '../../config/rbac';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalAlertsCount: number;
  incidentsCount: number;
  userRole?: string;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  criticalAlertsCount, 
  incidentsCount,
  userRole,
  currentUser,
  onLogout
}) => {
  const roleConfig = getRoleConfig(userRole);

  const sections = [
    {
      title: "CORE SOC OPERATIONS",
      items: [
        { id: 'dashboard', label: 'SIEM Command Center', icon: LayoutDashboard, tooltip: 'Central security posture, threat gauges & operational metrics' },
        { id: 'assets', label: 'Asset Discovery', icon: Server, tooltip: 'Network asset inventory & automated Nmap subnet discovery' },
        { id: 'vulnerabilities', label: 'Vulnerability Mgmt', icon: ShieldAlert, tooltip: 'CVE vulnerability catalog & remediation tracking' },
        { id: 'network', label: 'Network Analysis', icon: Network, tooltip: 'PCAP packet analyzer & bandwidth protocol distribution' },
        { id: 'gis-map', label: 'GIS Breach Map', icon: Globe, tooltip: 'Real-world geography cartography & exfiltration trajectories' }
      ]
    },
    {
      title: "SECURITY TELEMETRY",
      items: [
        { id: 'logs', label: 'Log Analytics', icon: FileText, tooltip: 'Real-time security log ingestion & event parser' },
        { id: 'threat-detection', label: 'Threat Detection', icon: Zap, tooltip: 'SIGMA rule correlation engine & rule manager' },
        { id: 'alerts', label: 'Security Alerts', icon: Bell, badge: criticalAlertsCount, tooltip: 'Real-time correlated security alerts & escalation' },
        { id: 'incidents', label: 'Incident Mgmt', icon: AlertTriangle, badge: incidentsCount, tooltip: 'SOC Level 2 incident response ticketing & containment' }
      ]
    },
    {
      title: "GOVERNANCE & COMPLIANCE",
      items: [
        { id: 'active-directory', label: 'Active Directory', icon: Key, tooltip: 'AD domain user audit, privileged group monitor & kerberos TGT' },
        { id: 'hardening', label: 'Infra Hardening', icon: ShieldCheck, tooltip: 'CIS Benchmark host hardening checks & remediation tasks' },
        { id: 'reports', label: 'Security Reports', icon: FileCheck, tooltip: 'Executive PDF & CSV compliance report generator' },
        { id: 'audit-logs', label: 'Audit Trail', icon: History, tooltip: 'Immutable operator action audit logs' },
        { id: 'user-management', label: 'User Mgmt & RBAC', icon: Users, tooltip: 'Admin user directory, role assignments & RBAC matrix' }
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 z-40 shadow-sm">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 bg-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wider text-slate-900">CYBER DEFENSE</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">UNIFIED SOC PLATFORM</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {sections.map((sec, sIdx) => {
          const allowedItems = sec.items.filter(item => isTabAllowedForRole(userRole, item.id));
          if (allowedItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {sec.title}
              </p>
              {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={item.tooltip}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer System Status, User Info & Logout Button */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <User className="h-3.5 w-3.5 text-blue-600" />
            {currentUser?.username || 'Operator'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeTextClass} ${roleConfig.badgeBorder}`}>
            {roleConfig.name}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>Engine Status</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE (4s)
          </span>
        </div>

        {/* Prominent Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out of Unified SOC Portal"
            className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold text-xs py-2 px-3 transition-all duration-200 shadow-sm group"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Sign Out / Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
