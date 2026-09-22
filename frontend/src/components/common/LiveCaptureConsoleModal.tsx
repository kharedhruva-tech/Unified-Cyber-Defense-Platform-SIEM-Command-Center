import React, { useState } from 'react';
import { Radio, Zap, Terminal, X, CheckCircle2, Play, Pause, Send } from 'lucide-react';

interface LiveCaptureConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestEvent: (sourceIp: string, logType: string, message: string) => void;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
}

export const LiveCaptureConsoleModal: React.FC<LiveCaptureConsoleModalProps> = ({
  isOpen,
  onClose,
  onIngestEvent,
  isAutoSimulating,
  onToggleAutoSim
}) => {
  const [sourceIp, setSourceIp] = useState<string>('45.142.120.10');
  const [logType, setLogType] = useState<string>('SSH_AUTH');
  const [message, setMessage] = useState<string>('Failed password for root from 45.142.120.10 port 51022 ssh2');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceIp.trim() || !message.trim()) return;

    onIngestEvent(sourceIp.trim(), logType, message.trim());
    setSuccessMsg(`Captured & Ingested live ${logType} event from ${sourceIp}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleQuickAttack = (ip: string, type: string, payload: string) => {
    onIngestEvent(ip, type, payload);
    setSuccessMsg(`Simulated & Ingested: ${type} attack payload from ${ip}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400">
              <Radio className="h-5 w-5 animate-pulse text-rose-300" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider flex items-center gap-2">
                LIVE TELEMETRY & PACKET CAPTURE CONSOLE
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold uppercase">
                  ACTIVE STREAM
                </span>
              </h2>
              <p className="text-xs text-slate-400">Real-Time Log Ingestion, PCAP Capture & Attack Simulator</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-slate-50/50 max-h-[80vh] overflow-y-auto">
          {/* Status Notification Toast */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Simulation Presets */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Quick Attack Simulation & Live Packet Injector:
              </span>
              <button
                onClick={onToggleAutoSim}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
                  isAutoSimulating 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isAutoSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isAutoSimulating ? 'STREAMING (4s)' : 'PAUSED'}</span>
                {isAutoSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickAttack('45.142.120.10', 'FIREWALL', 'DENY TCP 45.142.120.10:445 -> 192.168.1.10:445 (MS17-010 SMB Buffer Exploit)')}
                className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-900 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>🚨 Metasploit SMB Exploit</span>
                <Send className="h-3.5 w-3.5 text-rose-600" />
              </button>

              <button
                onClick={() => handleQuickAttack('183.240.12.5', 'SSH_AUTH', 'Failed password for root from 183.240.12.5 port 54102 ssh2')}
                className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>🔑 SSH Brute-Force Spray</span>
                <Send className="h-3.5 w-3.5 text-purple-600" />
              </button>

              <button
                onClick={() => handleQuickAttack('192.168.1.50', 'NMAP_SCAN', 'Nmap port scan probe detected on ports 21, 22, 80, 445 from 192.168.1.50')}
                className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>📡 Nmap Subnet Probe</span>
                <Send className="h-3.5 w-3.5 text-blue-600" />
              </button>

              <button
                onClick={() => handleQuickAttack('185.220.101.5', 'AD_AUDIT', 'An account failed to log on. SubjectUser: bad_actor, TargetUser: Administrator')}
                className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>🛡️ AD Account Lockout</span>
                <Send className="h-3.5 w-3.5 text-amber-600" />
              </button>
            </div>
          </div>

          {/* Manual Live Ingestion Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-indigo-600" />
              Custom Live Event & Packet Ingestion:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Source IP Address</label>
                <input
                  type="text"
                  required
                  value={sourceIp}
                  onChange={(e) => setSourceIp(e.target.value)}
                  placeholder="e.g. 45.142.120.10"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Telemetry Category</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="SSH_AUTH">SSH Authentication (SSH_AUTH)</option>
                  <option value="FIREWALL">Perimeter Firewall (FIREWALL)</option>
                  <option value="AD_AUDIT">Active Directory Audit (AD_AUDIT)</option>
                  <option value="SYSLOG">System Log (SYSLOG)</option>
                  <option value="NETWORK_FLOW">Network PCAP Flow (NETWORK_FLOW)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Payload / Log Message</label>
              <textarea
                required
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter log event details..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>CAPTURE & INGEST LIVE EVENT</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500">
          <span>Continuous SIEM Telemetry Ingestion Engine</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs">
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
