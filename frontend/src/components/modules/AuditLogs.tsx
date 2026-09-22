import React from 'react';
import { History, Shield, UserCheck } from 'lucide-react';
import type { AuditLogItem } from '../../types';

interface AuditLogsProps {
  auditLogs: AuditLogItem[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Immutable SOC System Audit Trail & Compliance Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking all administrative SOC operations, containment actions, detection rule modifications, analyst logins, and report downloads.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>RBAC ENFORCED & AUDITED</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Audit Event Log Sequence</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-mono">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-sans">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Action Code</th>
                <th className="py-3 px-4 font-semibold">Target Resource</th>
                <th className="py-3 px-4 font-semibold">Audit Details</th>
                <th className="py-3 px-4 text-right font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    {log.username}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      log.action.includes('CONTAINMENT') || log.action.includes('BLOCK') ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      log.action.includes('SCAN') || log.action.includes('RULE') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-blue-700 font-sans font-semibold">{log.target}</td>
                  <td className="py-3 px-4 text-slate-700 font-sans max-w-sm">{log.details || 'N/A'}</td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
