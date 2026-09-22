import React from 'react';
import { Monitor, Server } from 'lucide-react';
import { RiskGauge } from '../common/RiskGauge';

interface InfrastructureHardeningProps {
  hardeningData: any;
}

export const InfrastructureHardening: React.FC<InfrastructureHardeningProps> = ({ hardeningData }) => {
  const checks = hardeningData?.checks || [];

  return (
    <div className="space-y-6">
      {/* Hero Score Banner */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <RiskGauge score={hardeningData?.overall_hardening_score || 82.0} label="System Hardening Score" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                CIS BENCHMARK ASSESSMENT
              </span>
              <span className="text-xs text-slate-500 font-medium">Windows Server & Linux Subnet Audit</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Infrastructure Hardening Auditor</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              Evaluating CIS benchmark security controls: password policies, account lockout, SSH configurations, firewall status, unnecessary services, and audit policies.
            </p>
          </div>
        </div>

        {/* Controls Breakdown */}
        <div className="grid grid-cols-3 gap-3 min-w-[280px]">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-2xl font-extrabold text-emerald-700">{hardeningData?.passed_controls || 41}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">Passed Controls</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
            <span className="text-2xl font-extrabold text-rose-700">{hardeningData?.failed_controls || 7}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">Failed Controls</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <span className="text-2xl font-extrabold text-amber-700">{hardeningData?.warning_controls || 4}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">Warnings</span>
          </div>
        </div>
      </div>

      {/* OS Benchmark Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Windows Infrastructure Hardening</h3>
            </div>
            <span className="text-sm font-extrabold text-blue-700">{hardeningData?.windows_score || 80.0}% Compliance</span>
          </div>
          <p className="text-xs text-slate-500">Account lockout, Windows Defender Firewall, SMBv1 protocol checks, and Audit policies.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Linux System Hardening</h3>
            </div>
            <span className="text-sm font-extrabold text-emerald-700">{hardeningData?.linux_score || 85.0}% Compliance</span>
          </div>
          <p className="text-xs text-slate-500">SSH daemon parameters (PermitRootLogin, PermitEmptyPasswords), UFW firewall, and unattended updates.</p>
        </div>
      </div>

      {/* Compliance Checklist Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Detailed CIS Compliance Control Checklist</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Control ID</th>
                <th className="py-3 px-4">OS</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Security Control Name</th>
                <th className="py-3 px-4">Remediation Guide</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checks.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{c.control_id}</td>
                  <td className="py-3 px-4 text-slate-600">{c.os_type}</td>
                  <td className="py-3 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.control_name}</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">{c.remediation}</td>
                  <td className="py-3 px-4 text-right">
                    {c.status === 'Passed' ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        PASSED
                      </span>
                    ) : c.status === 'Failed' ? (
                      <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        FAILED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        WARNING
                      </span>
                    )}
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
