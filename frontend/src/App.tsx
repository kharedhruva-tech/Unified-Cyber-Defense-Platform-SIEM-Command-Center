import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/auth/LoginPage';
import { SiemDashboard } from './components/modules/SiemDashboard';
import { AssetDiscovery } from './components/modules/AssetDiscovery';
import { VulnerabilityManagement } from './components/modules/VulnerabilityManagement';
import { NetworkAnalysis } from './components/modules/NetworkAnalysis';
import { GisBreachMap } from './components/modules/GisBreachMap';
import { LogAnalytics } from './components/modules/LogAnalytics';
import { ThreatDetection } from './components/modules/ThreatDetection';
import { SecurityAlerts } from './components/modules/SecurityAlerts';
import { IncidentManagement } from './components/modules/IncidentManagement';
import { ActiveDirectorySecurity } from './components/modules/ActiveDirectorySecurity';
import { InfrastructureHardening } from './components/modules/InfrastructureHardening';
import { SecurityReports } from './components/modules/SecurityReports';
import { AuditLogs } from './components/modules/AuditLogs';
import { UserManagement } from './components/modules/UserManagement';
import { UserGuideModal } from './components/common/UserGuideModal';
import { CompTiaTechModal } from './components/common/CompTiaTechModal';
import { LiveCaptureConsoleModal } from './components/common/LiveCaptureConsoleModal';
import { AiSecurityCopilot } from './components/common/AiSecurityCopilot';
import { OnboardingTour } from './components/common/OnboardingTour';
import { NotificationSettingsModal } from './components/common/NotificationSettingsModal';

import { SiemService } from './services/api';
import { isTabAllowedForRole, getRoleConfig } from './config/rbac';
import { 
  FALLBACK_METRICS, FALLBACK_ASSETS, FALLBACK_VULNERABILITIES, 
  FALLBACK_LOGS, FALLBACK_RULES, FALLBACK_ALERTS, FALLBACK_INCIDENTS, 
  FALLBACK_AD_USERS, FALLBACK_AD_GROUPS, FALLBACK_AUDIT_LOGS, 
  FALLBACK_GIS_BREACHES, FALLBACK_GIS_SUMMARY, FALLBACK_NETWORK_DATA 
} from './config/mockData';
import type { Asset, Vulnerability, SecurityLog, SecurityAlert, Incident, DetectionRule, ADUser, ADGroup, SiemSummaryMetrics, AuditLogItem, GisBreachEvent, GisSummaryMetrics } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [isCaptureConsoleOpen, setIsCaptureConsoleOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState<boolean>(false);

  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('soc_token'));
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('soc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (newToken: string, user: { username: string; role: string }) => {
    localStorage.setItem('soc_token', newToken);
    localStorage.setItem('soc_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    const roleCfg = getRoleConfig(user.role);
    showToast(`Authenticated as ${user.username} (${roleCfg.name}). Welcome!`);
    
    // Automatically switch to first allowed tab for role
    if (roleCfg.allowedTabs.length > 0) {
      setActiveTab(roleCfg.allowedTabs[0]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('soc_token');
    localStorage.removeItem('soc_user');
    setToken(null);
    setCurrentUser(null);
    showToast('Signed out of Unified SOC Portal.');
  };

  // Enforce RBAC tab access restrictions
  useEffect(() => {
    if (currentUser?.role && !isTabAllowedForRole(currentUser.role, activeTab)) {
      const config = getRoleConfig(currentUser.role);
      if (config.allowedTabs.length > 0) {
        setActiveTab(config.allowedTabs[0]);
      }
    }
  }, [currentUser, activeTab]);

  // Data States (Defaulted with robust fallback datasets)
  const [metrics, setMetrics] = useState<SiemSummaryMetrics | null>(FALLBACK_METRICS);
  const [assets, setAssets] = useState<Asset[]>(FALLBACK_ASSETS);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(FALLBACK_VULNERABILITIES);
  const [networkData, setNetworkData] = useState<any>(FALLBACK_NETWORK_DATA);
  const [gisBreaches, setGisBreaches] = useState<GisBreachEvent[]>(FALLBACK_GIS_BREACHES);
  const [gisSummary, setGisSummary] = useState<GisSummaryMetrics | null>(FALLBACK_GIS_SUMMARY);
  const [logs, setLogs] = useState<SecurityLog[]>(FALLBACK_LOGS);
  const [logMetrics, setLogMetrics] = useState<any>({ total_eps: 14890 });
  const [rules, setRules] = useState<DetectionRule[]>(FALLBACK_RULES);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(FALLBACK_ALERTS);
  const [incidents, setIncidents] = useState<Incident[]>(FALLBACK_INCIDENTS);
  const [adAudit, setAdAudit] = useState<any>({ status: "OPTIMAL" });
  const [adUsers, setAdUsers] = useState<ADUser[]>(FALLBACK_AD_USERS);
  const [adGroups, setAdGroups] = useState<ADGroup[]>(FALLBACK_AD_GROUPS);
  const [hardeningAudit, setHardeningAudit] = useState<any>({ status: "PASS" });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(FALLBACK_AUDIT_LOGS);

  // Show Toast Banner
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);

  // Fetch all security telemetry from backend with safe Array fallback checks
  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        SiemService.getPostureSummary(),
        SiemService.getAssets(),
        SiemService.getVulnerabilities(),
        SiemService.getNetworkAnalysis(),
        SiemService.getLogs(),
        SiemService.getLogMetrics(),
        SiemService.getRules(),
        SiemService.getAlerts(),
        SiemService.getIncidents(),
        SiemService.getADAudit(),
        SiemService.getADUsers(),
        SiemService.getADGroups(),
        SiemService.getHardeningAudit(),
        SiemService.getAuditLogs(),
        SiemService.getGisBreaches(),
        SiemService.getGisSummary()
      ]);

      // Only update states if backend returned valid non-detail data (prevents resetting live counts in standalone mode)
      if (results[0].status === 'fulfilled' && results[0].value?.data && !results[0].value.data.detail) {
        setMetrics(results[0].value.data);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value?.data)) {
        setAssets(results[1].value.data);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value?.data)) {
        setVulnerabilities(results[2].value.data);
      }
      if (results[3].status === 'fulfilled' && results[3].value?.data) {
        setNetworkData(results[3].value.data);
      }
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value?.data)) {
        setLogs(results[4].value.data);
      }
      if (results[5].status === 'fulfilled' && results[5].value?.data) {
        setLogMetrics(results[5].value.data);
      }
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value?.data)) {
        setRules(results[6].value.data);
      }
      if (results[7].status === 'fulfilled' && Array.isArray(results[7].value?.data)) {
        setAlerts(results[7].value.data);
      }
      if (results[8].status === 'fulfilled' && Array.isArray(results[8].value?.data)) {
        setIncidents(results[8].value.data);
      }
      if (results[9].status === 'fulfilled' && results[9].value?.data) {
        setAdAudit(results[9].value.data);
      }
      if (results[10].status === 'fulfilled' && Array.isArray(results[10].value?.data)) {
        setAdUsers(results[10].value.data);
      }
      if (results[11].status === 'fulfilled' && Array.isArray(results[11].value?.data)) {
        setAdGroups(results[11].value.data);
      }
      if (results[12].status === 'fulfilled' && results[12].value?.data) {
        setHardeningAudit(results[12].value.data);
      }
      if (results[13].status === 'fulfilled' && Array.isArray(results[13].value?.data)) {
        setAuditLogs(results[13].value.data);
      }
      if (results[14].status === 'fulfilled' && Array.isArray(results[14].value?.data)) {
        setGisBreaches(results[14].value.data);
      }
      if (results[15].status === 'fulfilled' && results[15].value?.data) {
        setGisSummary(results[15].value.data);
      }
    } catch (err) {
      console.error("Failed to sync telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Live Telemetry Generator (Runs in browser standalone mode)
  const triggerDynamicLiveTelemetry = () => {
    const sampleLogTypes = ['SSH_AUTH', 'FIREWALL', 'AD_AUDIT', 'SYSLOG', 'NETWORK_FLOW', 'HARDENING'];
    const sampleIps = ['45.142.120.10', '183.240.12.5', '192.168.1.50', '185.220.101.5', '103.251.140.2'];
    const sampleMessages = [
      'Failed password for root from {ip} port 51022 ssh2',
      'DENY TCP {ip}:54321 -> 192.168.1.10:445 (SMB Probe)',
      'An account failed to log on. SubjectUser: bad_actor, TargetUser: Administrator',
      'PostgreSQL audit: Unauthorized access attempt to database customer_pii from {ip}',
      'Kerberos TGT Ticket Request Anomaly detected from host {ip}',
      'Nmap port scan probe detected on ports 21, 22, 80, 445 from {ip}'
    ];

    const randomIp = sampleIps[Math.floor(Math.random() * sampleIps.length)];
    const randomType = sampleLogTypes[Math.floor(Math.random() * sampleLogTypes.length)];
    const rawMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const msg = rawMsg.replace('{ip}', randomIp);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setMetrics(prev => {
      const currentMetrics = prev || FALLBACK_METRICS;
      const inc = Math.floor(Math.random() * 5) + 2;
      const isFailedLogin = randomType === 'SSH_AUTH' || randomType === 'AD_AUDIT';
      return {
        ...currentMetrics,
        total_security_events: currentMetrics.total_security_events + inc,
        failed_logins: currentMetrics.failed_logins + (isFailedLogin ? 1 : 0)
      };
    });

    const newLogItem: SecurityLog = {
      id: Date.now(),
      timestamp: nowTime,
      log_type: randomType,
      source_ip: randomIp,
      host_name: 'DC-01',
      event_code: 'EVT-' + Math.floor(Math.random() * 900 + 100),
      message: msg
    };

    setLogs(prev => [newLogItem, ...(Array.isArray(prev) ? prev.slice(0, 49) : FALLBACK_LOGS)]);
    setLogMetrics((prev: any) => ({
      total_eps: Math.floor(14000 + Math.random() * 3500),
      total_events: (prev?.total_events || 14890) + 1
    }));

    // Periodically generate a live Security Alert (every 3rd cycle ~ 7.5s)
    if (Math.random() > 0.6) {
      const alertTypes = [
        { name: 'Brute Force SSH Password Spray', sev: 'High', source: 'SIGMA Engine', evidence: `Detected >30 failed SSH logons from ${randomIp}` },
        { name: 'MS17-010 EternalBlue Buffer Exploit', sev: 'Critical', source: 'Perimeter Firewall', evidence: `Denied TCP 445 SMB exploit payload from ${randomIp}` },
        { name: 'Active Directory Kerberos Ticket Anomaly', sev: 'High', source: 'AD Audit', evidence: `Anomalous TGT request for privileged admin user from ${randomIp}` },
        { name: 'Nmap Subnet Recon Sweep', sev: 'Medium', source: 'Network Analysis', evidence: `Port scan probe detected on ports 21, 22, 80, 445 from ${randomIp}` }
      ];
      const selected = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const newAlertItem: SecurityAlert = {
        id: Date.now(),
        rule_name: selected.name,
        severity: selected.sev as any,
        timestamp: `${nowTime} UTC`,
        source: selected.source,
        evidence: selected.evidence,
        recommended_action: `Isolate host DC-01 and block source IP ${randomIp} on Cloudflare WAF.`,
        status: 'Active'
      };
      setAlerts(prev => [newAlertItem, ...(Array.isArray(prev) ? prev.slice(0, 19) : FALLBACK_ALERTS)]);
    }

    // Periodically update GIS summary data MB (every cycle)
    setGisSummary(prev => {
      const curr = prev || FALLBACK_GIS_SUMMARY;
      return {
        ...curr,
        total_stolen_data_gb: parseFloat((curr.total_stolen_data_gb + 0.05).toFixed(2)),
        active_exfiltration_rate_mbs: parseFloat((18 + Math.random() * 25).toFixed(1)),
        total_compromised_records: curr.total_compromised_records + Math.floor(Math.random() * 15)
      };
    });
  };

  useEffect(() => {
    fetchTelemetry();
    SiemService.getSimulatorStatus().then(res => {
      if (res.data && typeof res.data.is_running === 'boolean') {
        setIsAutoSimulating(res.data.is_running);
      }
    }).catch(err => console.error("Failed to fetch simulator status:", err));
  }, []);

  // Continuous Real-Time Live Telemetry Capture Loop (Runs every 2.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoSimulating) {
        triggerDynamicLiveTelemetry();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoSimulating]);

  const checkReadOnlyGuard = (): boolean => {
    const isReadOnly = getRoleConfig(currentUser?.role).isReadOnly;
    if (isReadOnly) {
      showToast(`Action restricted: Read-only access for ${getRoleConfig(currentUser?.role).name} role.`);
      return true;
    }
    return false;
  };

  const handleToggleAutoSim = async () => {
    if (checkReadOnlyGuard()) return;
    try {
      if (isAutoSimulating) {
        await SiemService.stopSimulator();
      } else {
        await SiemService.startSimulator();
      }
    } catch (err) {
      // Standalone mode fallback
    }
    const nextState = !isAutoSimulating;
    setIsAutoSimulating(nextState);
    if (nextState) {
      showToast("🟢 Live Telemetry Capturing ACTIVE — Streaming events every 4s!");
    } else {
      showToast("⏸️ Live Telemetry Stream PAUSED.");
    }
  };

  const handleTriggerUserEvent = async () => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.triggerSimulatedUserAction();
    } catch (err) {
      // Standalone mode fallback
    }
    triggerDynamicLiveTelemetry();
    showToast("⚡ Captured +1 Live Security Event & Ingested into SIEM Pipeline!");
  };

  // Handlers with RBAC read-only protection
  const handleRunSubnetScan = async (target: string) => {
    if (checkReadOnlyGuard()) return;
    showToast(`Launching authorized Nmap scan against ${target}...`);
    setIsLoading(true);
    try {
      await SiemService.runSubnetScan(target);
      showToast(`Nmap scan complete for ${target}. Discovered host inventory updated.`);
      await fetchTelemetry();
    } catch (err) {
      showToast(`Scan error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVulnStatus = async (id: number, status: string) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.updateVulnerabilityStatus(id, status);
      showToast(`Updated CVE vulnerability status to ${status}.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Failed to update status`);
    }
  };

  const handleIngestLog = async (logType: string, message: string, sourceIp?: string, hostName?: string) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.ingestLog(logType, message, sourceIp, hostName);
      showToast(`Ingested and evaluated new ${logType} security event.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Log ingestion failed`);
    }
  };

  const handleIngestLiveEvent = (sourceIp: string, logType: string, message: string) => {
    if (checkReadOnlyGuard()) return;
    handleIngestLog(logType, message, sourceIp, 'DC-01');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLogItem: SecurityLog = {
      id: Date.now(),
      timestamp: nowTime,
      log_type: logType,
      source_ip: sourceIp,
      host_name: 'DC-01',
      event_code: 'EVT-' + Math.floor(Math.random() * 900 + 100),
      message: message
    };
    setLogs(prev => [newLogItem, ...(Array.isArray(prev) ? prev.slice(0, 49) : FALLBACK_LOGS)]);
    setMetrics(prev => {
      const current = prev || FALLBACK_METRICS;
      return {
        ...current,
        total_security_events: current.total_security_events + 1
      };
    });
  };

  const handleToggleRule = async (id: number) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.toggleRule(id);
      showToast(`Toggled detection rule active state.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Failed to toggle rule`);
    }
  };

  const handleCreateRule = async (data: any) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.createRule(data);
      showToast(`New detection rule deployed successfully.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Failed to create rule`);
    }
  };

  const handleRunEvaluation = async () => {
    if (checkReadOnlyGuard()) return;
    showToast(`Evaluating active SIGMA correlation rules against logs...`);
    try {
      const res = await SiemService.runEvaluation();
      showToast(res.data.message || `Evaluation complete.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Evaluation error`);
    }
  };

  const handleEscalateAlertToIncident = async (alert: SecurityAlert) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.createIncident({
        title: `Incident: ${alert.rule_name}`,
        description: alert.evidence,
        severity: alert.severity,
        assigned_analyst: currentUser?.username || "Dhruva (SOC L2)"
      });
      showToast(`Escalated Alert #${alert.id} to new Incident ticket!`);
      setActiveTab('incidents');
      fetchTelemetry();
    } catch (err) {
      showToast(`Escalation failed`);
    }
  };

  const handleUpdateIncidentStatus = async (id: number, status: string, analyst?: string, note?: string) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.updateIncidentStatus(id, status, analyst, note);
      showToast(`Incident status set to ${status}.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Status update failed`);
    }
  };

  const handleExecuteContainment = async (id: number, actionType: string) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.executeContainment(id, actionType);
      showToast(`Executed automated containment: ${actionType.replace('_', ' ').toUpperCase()}!`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Containment execution failed`);
    }
  };

  const handleCreateIncident = async (data: any) => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.createIncident(data);
      showToast(`Created new security incident ticket.`);
      fetchTelemetry();
    } catch (err) {
      showToast(`Incident creation failed`);
    }
  };

  const safeAlerts = Array.isArray(alerts) ? alerts : FALLBACK_ALERTS;
  const safeIncidents = Array.isArray(incidents) ? incidents : FALLBACK_INCIDENTS;

  const criticalAlertsCount = safeAlerts.filter(a => a && a.severity === 'Critical').length;
  const activeIncidentsCount = safeIncidents.filter(i => i && i.status !== 'Resolved').length;

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-soc-bg text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        criticalAlertsCount={criticalAlertsCount}
        incidentsCount={activeIncidentsCount}
        userRole={currentUser?.role}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header 
          activeModule={activeTab} 
          onRefresh={fetchTelemetry} 
          isLoading={isLoading} 
          alertCount={criticalAlertsCount}
          isAutoSimulating={isAutoSimulating}
          onToggleAutoSim={handleToggleAutoSim}
          onTriggerUserEvent={handleTriggerUserEvent}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenTechModal={() => setIsTechModalOpen(true)}
          onOpenCaptureConsole={() => setIsCaptureConsoleOpen(true)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenNotifications={() => setIsNotificationSettingsOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        {/* CompTIA Security+ 701 Technologies Matrix Modal */}
        <CompTiaTechModal 
          isOpen={isTechModalOpen}
          onClose={() => setIsTechModalOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        {/* Live Capture Console Modal */}
        <LiveCaptureConsoleModal 
          isOpen={isCaptureConsoleOpen}
          onClose={() => setIsCaptureConsoleOpen(false)}
          onIngestEvent={handleIngestLiveEvent}
          isAutoSimulating={isAutoSimulating}
          onToggleAutoSim={handleToggleAutoSim}
        />

        {/* AI Security Copilot Drawer */}
        <AiSecurityCopilot 
          isOpen={isCopilotOpen} 
          onClose={() => setIsCopilotOpen(false)} 
        />

        {/* Interactive Onboarding & Feature Tour */}
        <OnboardingTour 
          isOpen={isTourOpen} 
          onClose={() => setIsTourOpen(false)} 
          onNavigate={(tab) => setActiveTab(tab)} 
        />

        {/* Multichannel Alert & Webhook Settings Modal */}
        <NotificationSettingsModal 
          isOpen={isNotificationSettingsOpen}
          onClose={() => setIsNotificationSettingsOpen(false)}
          onShowToast={showToast}
        />

        {/* User Operations Guide Modal */}
        <UserGuideModal 
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          onRunEvaluation={handleRunEvaluation}
          onTriggerUserEvent={handleTriggerUserEvent}
        />

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-blue-500/50 bg-white/95 px-4 py-3 text-xs font-bold text-blue-900 shadow-2xl backdrop-blur-md border-blue-200 animate-in fade-in slide-in-from-top-4 duration-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>{notification}</span>
          </div>
        )}

        {/* Module Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <SiemDashboard 
              metrics={metrics} 
              alerts={alerts} 
              onTriggerEvaluation={handleRunEvaluation}
              onNavigate={(tab) => setActiveTab(tab)}
              isAutoSimulating={isAutoSimulating}
              onToggleAutoSim={handleToggleAutoSim}
              onOpenCaptureConsole={() => setIsCaptureConsoleOpen(true)}
              onTriggerUserEvent={handleTriggerUserEvent}
              logs={logs}
            />
          )}

          {activeTab === 'assets' && (
            <AssetDiscovery 
              assets={assets} 
              onRunScan={handleRunSubnetScan} 
              isLoading={isLoading}
            />
          )}

          {activeTab === 'vulnerabilities' && (
            <VulnerabilityManagement 
              vulnerabilities={vulnerabilities} 
              onUpdateStatus={handleUpdateVulnStatus}
            />
          )}

          {activeTab === 'network' && (
            <NetworkAnalysis 
              pcapData={networkData}
            />
          )}

          {activeTab === 'gis-map' && (
            <GisBreachMap 
              breaches={gisBreaches}
              summary={gisSummary}
              onRefresh={fetchTelemetry}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'logs' && (
            <LogAnalytics 
              logs={logs} 
              metrics={logMetrics}
              onIngestLog={handleIngestLog}
            />
          )}

          {activeTab === 'threat-detection' && (
            <ThreatDetection 
              rules={rules}
              onToggleRule={handleToggleRule}
              onCreateRule={handleCreateRule}
              onRunEvaluation={handleRunEvaluation}
            />
          )}

          {activeTab === 'alerts' && (
            <SecurityAlerts 
              alerts={alerts} 
              onEscalateToIncident={handleEscalateAlertToIncident}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentManagement 
              incidents={incidents}
              onUpdateStatus={handleUpdateIncidentStatus}
              onExecuteContainment={handleExecuteContainment}
              onCreateIncident={handleCreateIncident}
            />
          )}

          {activeTab === 'active-directory' && (
            <ActiveDirectorySecurity 
              auditData={adAudit}
              users={adUsers}
              groups={adGroups}
            />
          )}

          {activeTab === 'hardening' && (
            <InfrastructureHardening 
              hardeningData={hardeningAudit}
            />
          )}

          {activeTab === 'reports' && (
            <SecurityReports />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogs 
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'user-management' && (
            <UserManagement 
              currentUserRole={currentUser?.role}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
