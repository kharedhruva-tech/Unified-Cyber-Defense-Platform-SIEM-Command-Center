import React, { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import type { SecurityAlert } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onEscalateToIncident: (alert: SecurityAlert) => void;
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ alerts, onEscalateToIncident }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSev, setSelectedSev] = useState('ALL');
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = selectedSev === 'ALL' || a.severity.toUpperCase() === selectedSev.toUpperCase();
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Alerts, Evidence, Detection Source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSev(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedSev === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Security Alerts Queue */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  ALT-{alert.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">{alert.rule_name}</h3>
                <SeverityBadge severity={alert.severity} />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono font-medium">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={() => onEscalateToIncident(alert)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Escalate to Incident</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="md:col-span-2 space-y-2">
                <p className="text-slate-700"><span className="text-slate-500 font-semibold">Evidence:</span> {alert.evidence}</p>
                <div className="flex items-center gap-4 text-slate-500">
                  <span>Detection Source: <strong className="text-blue-700 font-sans">{alert.source}</strong></span>
                  <span>Status: <strong className="text-amber-700 font-sans">{alert.status}</strong></span>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block">SOC Recommended Action</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">{alert.recommended_action || 'Inspect evidence logs and perform endpoint isolation.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
