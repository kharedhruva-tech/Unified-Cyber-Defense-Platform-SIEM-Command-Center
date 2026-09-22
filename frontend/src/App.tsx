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
import { AiSecurityCopilot } from './components/common/AiSecurityCopilot';
import { OnboardingTour } from './components/common/OnboardingTour';
import { NotificationSettingsModal } from './components/common/NotificationSettingsModal';

import { SiemService } from './services/api';
import { isTabAllowedForRole, getRoleConfig } from './config/rbac';
import type { Asset, Vulnerability, SecurityLog, SecurityAlert, Incident, DetectionRule, ADUser, ADGroup, SiemSummaryMetrics, AuditLogItem, GisBreachEvent, GisSummaryMetrics } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
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

  // Data States
  const [metrics, setMetrics] = useState<SiemSummaryMetrics | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const [gisBreaches, setGisBreaches] = useState<GisBreachEvent[]>([]);
  const [gisSummary, setGisSummary] = useState<GisSummaryMetrics | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [logMetrics, setLogMetrics] = useState<any>(null);
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [adAudit, setAdAudit] = useState<any>(null);
  const [adUsers, setAdUsers] = useState<ADUser[]>([]);
  const [adGroups, setAdGroups] = useState<ADGroup[]>([]);
  const [hardeningAudit, setHardeningAudit] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Show Toast Banner
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);

  // Fetch all security telemetry from backend in a resilient manner
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

      const getValue = (res: PromiseSettledResult<any>) => res.status === 'fulfilled' ? res.value.data : null;

      if (results[0].status === 'fulfilled') setMetrics(getValue(results[0]));
      if (results[1].status === 'fulfilled') setAssets(getValue(results[1]));
      if (results[2].status === 'fulfilled') setVulnerabilities(getValue(results[2]));
      if (results[3].status === 'fulfilled') setNetworkData(getValue(results[3]));
      if (results[4].status === 'fulfilled') setLogs(getValue(results[4]));
      if (results[5].status === 'fulfilled') setLogMetrics(getValue(results[5]));
      if (results[6].status === 'fulfilled') setRules(getValue(results[6]));
      if (results[7].status === 'fulfilled') setAlerts(getValue(results[7]));
      if (results[8].status === 'fulfilled') setIncidents(getValue(results[8]));
      if (results[9].status === 'fulfilled') setAdAudit(getValue(results[9]));
      if (results[10].status === 'fulfilled') setAdUsers(getValue(results[10]));
      if (results[11].status === 'fulfilled') setAdGroups(getValue(results[11]));
      if (results[12].status === 'fulfilled') setHardeningAudit(getValue(results[12]));
      if (results[13].status === 'fulfilled') setAuditLogs(getValue(results[13]));
      if (results[14].status === 'fulfilled') setGisBreaches(getValue(results[14]));
      if (results[15].status === 'fulfilled') setGisSummary(getValue(results[15]));
    } catch (err) {
      console.error("Failed to sync telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    SiemService.getSimulatorStatus().then(res => {
      if (res.data && typeof res.data.is_running === 'boolean') {
        setIsAutoSimulating(res.data.is_running);
      }
    }).catch(err => console.error("Failed to fetch simulator status:", err));
  }, []);

  // Continuous Real-Time Telemetry Polling Loop (Runs every 4s unconditionally)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    if (isAutoSimulating) {
      await SiemService.stopSimulator();
      setIsAutoSimulating(false);
      showToast("Paused automated background user simulation.");
    } else {
      await SiemService.startSimulator();
      setIsAutoSimulating(true);
      showToast("Started automated background user simulation! Dashboard syncs every 5s.");
    }
  };

  const handleTriggerUserEvent = async () => {
    if (checkReadOnlyGuard()) return;
    try {
      await SiemService.triggerSimulatedUserAction();
      showToast("Generated 1 automated user logon / threat activity event.");
      fetchTelemetry();
    } catch (err) {
      showToast("Failed to trigger user event");
    }
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

  const criticalAlertsCount = alerts.filter(a => a.severity === 'Critical').length;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;

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
