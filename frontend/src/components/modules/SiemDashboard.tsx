import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertOctagon, AlertTriangle, Key, Server, Eye, 
  Activity, Zap, Target, Globe 
} from 'lucide-react';

import { MetricCard } from '../common/MetricCard';
import { RiskGauge } from '../common/RiskGauge';
import { SeverityBadge } from '../common/SeverityBadge';
import type { SiemSummaryMetrics, SecurityAlert } from '../../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, Legend, Brush 
} from 'recharts';

import { Play, Pause, Radio } from 'lucide-react';
import type { SecurityLog } from '../../types';

interface SiemDashboardProps {
  metrics: SiemSummaryMetrics | null;
  alerts: SecurityAlert[];
  onTriggerEvaluation: () => void;
  onNavigate: (tab: string) => void;
  isAutoSimulating?: boolean;
  onToggleAutoSim?: () => void;
  onOpenCaptureConsole?: () => void;
  onTriggerUserEvent?: () => void;
  logs?: SecurityLog[];
}

export const SiemDashboard: React.FC<SiemDashboardProps> = ({ 
  metrics, 
  alerts, 
  onTriggerEvaluation, 
  onNavigate,
  isAutoSimulating = true,
  onToggleAutoSim,
  onOpenCaptureConsole,
  onTriggerUserEvent,
  logs = []
}) => {
  // Real-time Live Telemetry State Counters
  const [liveEventCount, setLiveEventCount] = useState<number>(() => metrics?.total_security_events || 14890);
  const [liveFailedLogins, setLiveFailedLogins] = useState<number>(() => metrics?.failed_logins || 42);
  const [liveEpsRate, setLiveEpsRate] = useState<number>(14890);

  // High-frequency Real-time Live Capture Counter (Increments every 1.5 seconds)
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      const inc = Math.floor(Math.random() * 6) + 2;
      setLiveEventCount((prev: number) => prev + inc);
      setLiveEpsRate(Math.floor(14000 + Math.random() * 3500));
      if (Math.random() > 0.6) {
        setLiveFailedLogins((prev: number) => prev + 1);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isAutoSimulating]);

  useEffect(() => {
    if (metrics?.total_security_events && metrics.total_security_events > liveEventCount) {
      setLiveEventCount(metrics.total_security_events);
    }
    if (metrics?.failed_logins && metrics.failed_logins > liveFailedLogins) {
      setLiveFailedLogins(metrics.failed_logins);
    }
  }, [metrics]);

  const trendData = [
    { time: '00:00', failed: 12, logins: 140, ingress_mbps: 45 },
    { time: '04:00', failed: 8, logins: 60, ingress_mbps: 18 },
    { time: '08:00', failed: 45, logins: 520, ingress_mbps: 110 },
    { time: '12:00', failed: 120, logins: 890, ingress_mbps: 280 },
    { time: '16:00', failed: 85, logins: 740, ingress_mbps: 210 },
    { time: '20:00', failed: 210, logins: 310, ingress_mbps: 490 },
  ];

  const epsTimelineData = [
    { time: '00:00:00', syslog_eps: 1250, firewall_eps: 3400, windows_eps: 850, total_eps: 5500 },
    { time: '02:00:00', syslog_eps: 980, firewall_eps: 2800, windows_eps: 620, total_eps: 4400 },
    { time: '04:00:00', syslog_eps: 720, firewall_eps: 2100, windows_eps: 450, total_eps: 3270 },
    { time: '06:00:00', syslog_eps: 1450, firewall_eps: 4200, windows_eps: 1100, total_eps: 6750 },
    { time: '08:00:00', syslog_eps: 2800, firewall_eps: 7800, windows_eps: 3200, total_eps: 13800 },
    { time: '10:00:00', syslog_eps: 3600, firewall_eps: 9400, windows_eps: 4500, total_eps: 17500 },
    { time: '12:00:00', syslog_eps: 4200, firewall_eps: 11200, windows_eps: 5800, total_eps: 21200 },
    { time: '14:00:00', syslog_eps: 3900, firewall_eps: 10500, windows_eps: 5100, total_eps: 19500 },
    { time: '16:00:00', syslog_eps: 4800, firewall_eps: 13400, windows_eps: 6900, total_eps: 25100 },
    { time: '18:00:00', syslog_eps: 3100, firewall_eps: 8900, windows_eps: 3800, total_eps: 15800 },
    { time: '20:00:00', syslog_eps: 2200, firewall_eps: 6400, windows_eps: 2400, total_eps: 11000 },
    { time: '22:00:00', syslog_eps: 1600, firewall_eps: 4800, windows_eps: 1400, total_eps: 7800 },
  ];

  const pieData = [
    { name: 'Critical', value: metrics?.critical_alerts || 2, color: '#EF4444' },
    { name: 'High', value: metrics?.high_alerts || 5, color: '#F59E0B' },
    { name: 'Medium', value: 8, color: '#2563EB' },
    { name: 'Low', value: 14, color: '#10B981' },
  ];

  const mitreRadarData = [
    { tactic: 'Initial Access', threat_score: 85 },
    { tactic: 'Execution', threat_score: 65 },
    { tactic: 'Persistence', threat_score: 90 },
    { tactic: 'Priv Escalation', threat_score: 75 },
    { tactic: 'Defense Evasion', threat_score: 80 },
    { tactic: 'Cred Access', threat_score: 95 },
    { tactic: 'Exfiltration', threat_score: 88 },
  ];

  const topOriginCountryData = [
    { country: '🇷🇺 Russia', attacks: 14, data_gb: 2.4 },
    { country: '🇨🇳 China', attacks: 11, data_gb: 1.8 },
    { country: '🇰🇵 North Korea', attacks: 8, data_gb: 1.2 },
    { country: '🇮🇷 Iran', attacks: 6, data_gb: 0.8 },
    { country: '🇩🇪 Germany (Tor)', attacks: 4, data_gb: 0.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <RiskGauge score={metrics?.overall_posture_score || 82.0} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                SIEM SECURITY POSTURE
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isAutoSimulating 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoSimulating ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                {isAutoSimulating ? '🔴 REAL-TIME CAPTURE: ACTIVE (1.5s)' : '⏸️ CAPTURE PAUSED'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Enterprise Environment: On-Premises & Cloud</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900">SOC Central Command Center</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              Real-time security analytics, log correlation, threat detection, active directory security, and automated incident response monitoring.
            </p>

            {/* Live Streaming Log Event Ticker */}
            {logs && logs.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-emerald-400 font-mono border border-slate-800 shadow-inner max-w-xl">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-slate-400 uppercase text-[10px] shrink-0">LIVE CAPTURED LOG:</span>
                <span className="truncate">[{logs[0].timestamp}] {logs[0].log_type}: {logs[0].message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 min-w-[240px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Capturing & Controls</p>

          <div className="flex items-center gap-2">
            {onToggleAutoSim && (
              <button
                onClick={onToggleAutoSim}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition shadow-sm border ${
                  isAutoSimulating 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                }`}
              >
                {isAutoSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isAutoSimulating ? 'Pause Capture' : 'Start Capture'}</span>
              </button>
            )}

            {onTriggerUserEvent && (
              <button
                onClick={onTriggerUserEvent}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 text-xs font-bold transition shadow-sm border border-amber-400"
                title="Inject +1 Simulated Threat Event"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>+ Event</span>
              </button>
            )}
          </div>

          {onOpenCaptureConsole && (
            <button
              onClick={onOpenCaptureConsole}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition border border-indigo-500"
            >
              <Radio className="h-4 w-4 text-rose-300 animate-pulse" />
              <span>Live Capture Console</span>
            </button>
          )}

          <button
            onClick={onTriggerEvaluation}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Run Correlation Rules</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (Clickable Navigation Shortcuts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Security Events" value={liveEventCount.toLocaleString()} subtitle="Across Windows & Linux Logs (Capturing Live)" icon={Activity} color="cyan" onClick={() => onNavigate('logs')} tooltip="Click to view Log Analytics stream" />
        <MetricCard title="Critical Alerts" value={metrics?.critical_alerts || 2} subtitle="Requires Immediate Response" icon={AlertOctagon} color="rose" onClick={() => onNavigate('alerts')} tooltip="Click to review Security Alerts" />
        <MetricCard title="High Risk Alerts" value={metrics?.high_alerts || 5} subtitle="Under Active Investigation" icon={AlertTriangle} color="amber" onClick={() => onNavigate('alerts')} tooltip="Click to review Security Alerts" />
        <MetricCard title="Failed Login Attempts" value={liveFailedLogins} subtitle="Authentication Anomaly Count" icon={Key} color="purple" onClick={() => onNavigate('logs')} tooltip="Click to filter Failed Login Logs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Monitored Assets" value={metrics?.monitored_assets || 8} subtitle="Online Enterprise Nodes" icon={Server} color="emerald" onClick={() => onNavigate('assets')} tooltip="Click to view Asset Inventory & Nmap Scanner" />
        <MetricCard title="Open Vulnerabilities" value={metrics?.vulnerabilities_total || 6} subtitle="Identified CVE Exposures" icon={Shield} color="rose" onClick={() => onNavigate('vulnerabilities')} tooltip="Click to open Vulnerability Management" />
        <MetricCard title="Suspicious IP Addresses" value={metrics?.suspicious_ips || 14} subtitle="Flagged Traffic Sources" icon={Eye} color="amber" onClick={() => onNavigate('gis-map')} tooltip="Click to open GIS Data Exfiltration Map" />
        <MetricCard title="Active Incidents" value={metrics?.active_incidents || 3} subtitle="Open Response Tickets" icon={AlertTriangle} color="cyan" onClick={() => onNavigate('incidents')} tooltip="Click to open Incident Management & Containment" />
      </div>

      {/* High-Performance EPS (Events Per Second) Ingestion Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                REAL-TIME SIEM LOG INGESTION STREAM (EVENTS PER SECOND - EPS)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-throughput EPS telemetry across Syslog, Firewall, and Windows Auth channels with Brush zoom controls
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold font-mono animate-pulse">
              INGESTION: {liveEpsRate.toLocaleString()} EPS
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold font-mono">
              LATENCY: 4.2ms
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={epsTimelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="epsTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="epsFirewall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} EPS`, 'Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="total_eps" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#epsTotal)" name="Total Combined EPS" />
              <Area type="monotone" dataKey="firewall_eps" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#epsFirewall)" name="Firewall Stream EPS" />
              <Brush dataKey="time" height={24} stroke="#3B82F6" fill="#F1F5F9" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visualizations Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Authentication Failure vs Network Ingress</h3>
              <p className="text-xs text-slate-500">24-hour failed logon events correlated with bandwidth throughput (Mbps)</p>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
              Brute Force Spike Detected
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIngress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" name="Failed Logons" />
                <Area type="monotone" dataKey="ingress_mbps" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorIngress)" name="Ingress Mbps" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Threat Severity Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution of active security alerts by severity level</p>
          </div>
          <div className="h-52 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visualizations Section - Row 2 (MITRE ATT&CK Radar & Origin Country Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MITRE ATT&CK Tactical Radar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>MITRE ATT&CK Tactical Risk Radar</span>
              </h3>
              <p className="text-xs text-slate-500">Real-time threat exposure scores mapped across MITRE ATT&CK tactics</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              TACTICAL EXPOSURE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mitreRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="tactic" stroke="#475569" fontSize={11} tick={{ fill: '#334155', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
                <Radar name="Threat Score" dataKey="threat_score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin Country Attack Distribution Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4 text-rose-600" />
                <span>Top Origin Country Threat Volume</span>
              </h3>
              <p className="text-xs text-slate-500">Attacks and data exfiltration volume by attacker country</p>
            </div>
            <button 
              onClick={() => onNavigate('gis-map')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Open GIS Map →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOriginCountryData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="country" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="attacks" fill="#EF4444" name="Attack Count" radius={[4, 4, 0, 0]} />
                <Bar dataKey="data_gb" fill="#F59E0B" name="Exfiltrated GB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security Alerts Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Real-Time Security Alerts</h3>
            <p className="text-xs text-slate-500">Latest automated threat detections requiring SOC review</p>
          </div>
          <button 
            onClick={() => onNavigate('alerts')} 
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All Security Alerts →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold">Event Rule</th>
                <th className="py-3 px-4 font-semibold">Detection Source</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{alert.rule_name}</td>
                  <td className="py-3 px-4 text-slate-600">{alert.source}</td>
                  <td className="py-3 px-4"><SeverityBadge severity={alert.severity} size="sm" /></td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => onNavigate('alerts')}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-semibold transition"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

