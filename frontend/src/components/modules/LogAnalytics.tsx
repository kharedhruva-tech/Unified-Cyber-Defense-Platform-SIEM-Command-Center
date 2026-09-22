import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Key, CheckCircle, AlertOctagon, Terminal, Network, Activity, RefreshCw, Server, ShieldAlert, CheckCircle2, Radio } from 'lucide-react';
import type { SecurityLog, LogNetworkDependencySummary } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { SiemService } from '../../services/api';

interface LogAnalyticsProps {
  logs: SecurityLog[];
  metrics: any;
  onIngestLog: (logType: string, message: string, sourceIp?: string, hostName?: string) => void;
}

export const LogAnalytics: React.FC<LogAnalyticsProps> = ({ logs, metrics, onIngestLog }) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'network-dependencies'>('stream');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);

  // Network Dependency State
  const [networkDeps, setNetworkDeps] = useState<LogNetworkDependencySummary | null>(null);
  const [loadingDeps, setLoadingDeps] = useState(false);

  // Ingest form state
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestLogType, setIngestLogType] = useState('Windows Event');
  const [ingestMessage, setIngestMessage] = useState('An account failed to log on. Account Name: Administrator. Source Network Address: 45.142.120.10');
  const [ingestIp, setIngestIp] = useState('45.142.120.10');
  const [ingestHost, setIngestHost] = useState('DC-PRIMARY-01');

  const fetchNetworkDeps = async () => {
    setLoadingDeps(true);
    try {
      const response = await SiemService.getLogNetworkDependencies();
      setNetworkDeps(response.data);
    } catch (err) {
      console.error('Failed to fetch log network dependencies:', err);
    } finally {
      setLoadingDeps(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'network-dependencies' && !networkDeps) {
      fetchNetworkDeps();
    }
  }, [activeTab]);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (l.source_ip && l.source_ip.includes(searchTerm)) ||
                          (l.host_name && l.host_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || l.log_type.toUpperCase() === selectedType.toUpperCase();
    return matchesSearch && matchesType;
  });

  const handleIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onIngestLog(ingestLogType, ingestMessage, ingestIp, ingestHost);
    setShowIngestModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Events" value={metrics?.total_events || logs.length} subtitle="Centralized Ingest" icon={FileText} color="cyan" />
        <MetricCard title="Security Events" value={metrics?.security_events || logs.length} subtitle="Normalized Telemetry" icon={Terminal} color="emerald" />
        <MetricCard title="Failed Logins" value={metrics?.failed_logins || 5} subtitle="Event Code 4625 / SSH" icon={Key} color="rose" />
        <MetricCard title="Successful Logins" value={metrics?.successful_logins || 42} subtitle="Valid Authentications" icon={CheckCircle} color="emerald" />
        <MetricCard title="Critical Events" value={metrics?.critical_events || 1} subtitle="Privilege Changes" icon={AlertOctagon} color="rose" />
        <MetricCard title="Log Health Score" value={networkDeps ? `${networkDeps.overall_health_score}%` : '100%'} subtitle="Network Dependencies" icon={Network} color="cyan" />
      </div>

      {/* Main View Mode Selector */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'stream'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Normalized Security Log Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('network-dependencies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'network-dependencies'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Network Log Dependencies & System Health</span>
          {networkDeps && networkDeps.degraded_nodes > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold">
              {networkDeps.degraded_nodes} Degraded
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: NORMALIZED SECURITY LOG STREAM */}
      {activeTab === 'stream' && (
        <>
          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Log Message, Source IP, Host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'WINDOWS EVENT', 'LINUX AUTH', 'SSH', 'WEB', 'FIREWALL'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                      selectedType === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowIngestModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Simulate Log Ingestion</span>
              </button>
            </div>
          </div>

          {/* Central Log Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Normalized Security Event Logs</h3>
              <span className="text-xs text-slate-500 font-mono font-medium">Showing {filteredLogs.length} events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Log Type</th>
                    <th className="py-3 px-4 font-semibold">Host Name</th>
                    <th className="py-3 px-4 font-semibold">Source IP</th>
                    <th className="py-3 px-4 font-semibold">Event Code</th>
                    <th className="py-3 px-4 font-semibold">Raw Message</th>
                    <th className="py-3 px-4 text-right font-semibold">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-sans font-bold">
                          {log.log_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">{log.host_name || 'LOCAL-HOST'}</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">{log.source_ip || '127.0.0.1'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          log.event_code === '4625' || log.event_code === 'SSH_AUTH_FAIL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          log.event_code === '4728' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {log.event_code || 'LOG_INFO'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md truncate font-sans">{log.message}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 rounded bg-slate-100 text-blue-700 hover:bg-blue-50 border border-slate-200 font-sans text-[11px] font-semibold transition"
                        >
                          JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: NETWORK LOG DEPENDENCIES & SYSTEM HEALTH */}
      {activeTab === 'network-dependencies' && (
        <div className="space-y-6">
          {/* Header & Scan Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-600 animate-pulse" />
                Network Log Socket Listeners & System Log Dependencies
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Monitors active network sockets (Syslog UDP/514, WinRM/5985, SSH/22, Web/8000, DB Audit) and verifies local system log file paths.
              </p>
            </div>

            <button
              onClick={fetchNetworkDeps}
              disabled={loadingDeps}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${loadingDeps ? 'animate-spin' : ''}`} />
              <span>{loadingDeps ? 'Scanning Ports...' : 'Re-Scan Network Log Ports'}</span>
            </button>
          </div>

          {/* Active Alerts Banner if any */}
          {networkDeps?.alerts && networkDeps.alerts.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Network Log Pipeline Warning
              </div>
              {networkDeps.alerts.map((alt, idx) => (
                <p key={idx} className="text-xs text-amber-900 font-medium">
                  • {alt.message}
                </p>
              ))}
            </div>
          )}

          {/* Network Log Nodes Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                Network Log Socket Listeners & Forwarders
              </h4>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {networkDeps?.healthy_nodes || 0} / {networkDeps?.total_dependencies_checked || 0} Healthy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Log Collector / Daemon</th>
                    <th className="py-3 px-4 font-semibold">Log Type</th>
                    <th className="py-3 px-4 font-semibold">Target Host & Port</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Latency</th>
                    <th className="py-3 px-4 font-semibold">Pipeline Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {networkDeps?.log_nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-900 font-bold font-sans flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        {node.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-sans font-bold">
                          {node.log_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-mono font-semibold">{node.target_host}:{node.port} ({node.protocol})</td>
                      <td className="py-3 px-4 text-slate-600 font-sans">{node.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-sans flex items-center gap-1 w-fit ${
                          node.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {node.status === 'ONLINE' ? <CheckCircle2 className="h-3 w-3" /> : <AlertOctagon className="h-3 w-3" />}
                          {node.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{node.latency_ms ? `${node.latency_ms} ms` : 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate font-sans">{node.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Log File Path Integrity Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                System Log File Path & Store Integrity
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Log File Store</th>
                    <th className="py-3 px-4 font-semibold">File Path</th>
                    <th className="py-3 px-4 font-semibold">Log Stream Type</th>
                    <th className="py-3 px-4 font-semibold">File Integrity Status</th>
                    <th className="py-3 px-4 font-semibold">Read Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {networkDeps?.system_files.map((file, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-900 font-bold font-sans">{file.name}</td>
                      <td className="py-3 px-4 text-blue-700 font-semibold">{file.path}</td>
                      <td className="py-3 px-4 text-slate-600">{file.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold font-sans ${
                          file.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {file.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">
                        {file.readable ? 'READ_OK' : 'DENIED'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Log Ingest Simulator Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Ingest & Parse Security Log
              </h4>
              <button onClick={() => setShowIngestModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleIngestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Log Type Source</label>
                <select
                  value={ingestLogType}
                  onChange={(e) => setIngestLogType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white"
                >
                  <option value="Windows Event">Windows Event Log (Event ID 4625 / 4728)</option>
                  <option value="Linux Auth">Linux Auth Log (/var/log/auth.log)</option>
                  <option value="SSH">SSH Authentication Log</option>
                  <option value="Web">Web Application Firewall Log</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Source IP Address</label>
                <input
                  type="text"
                  value={ingestIp}
                  onChange={(e) => setIngestIp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Host Name</label>
                <input
                  type="text"
                  value={ingestHost}
                  onChange={(e) => setIngestHost(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Raw Log Message</label>
                <textarea
                  rows={3}
                  value={ingestMessage}
                  onChange={(e) => setIngestMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono text-[11px] focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm"
                >
                  Parse & Correlate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Log ID #{selectedLog.id} JSON Schema</h4>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-900 text-cyan-300 text-xs font-mono overflow-x-auto max-h-80 shadow-inner">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>

            <div className="text-right">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 rounded bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
