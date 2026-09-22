import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ADUser, ADGroup } from '../../types';
import { RiskGauge } from '../common/RiskGauge';

interface ActiveDirectorySecurityProps {
  auditData: any;
  users: ADUser[];
  groups: ADGroup[];
}

export const ActiveDirectorySecurity: React.FC<ActiveDirectorySecurityProps> = ({ auditData, users, groups }) => {
  const policyChecks = auditData?.policy_checks || [];

  return (
    <div className="space-y-6">
      {/* AD Hardening Score Hero Banner */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <RiskGauge score={auditData?.ad_hardening_score || 87.5} label="AD Hardening Score" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                ACTIVE DIRECTORY DOMAIN AUDIT
              </span>
              <span className="text-xs text-slate-500 font-medium">Windows Server 2022 Lab Domain</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Active Directory Security & GPO Benchmark</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              Auditing domain user accounts, privileged administrative groups, password policy complexity, lockout thresholds, and Kerberos TGT key hygiene.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-[240px]">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl font-extrabold text-slate-900">{auditData?.total_users || users.length}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">Domain Users</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl font-extrabold text-rose-600">{auditData?.admin_users || 3}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">Domain Admins</span>
          </div>
        </div>
      </div>

      {/* Domain Policy Audit Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Group Policy Security Control Checks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Security Policy Control</th>
                <th className="py-3 px-4">Required Benchmark</th>
                <th className="py-3 px-4">Current AD Value</th>
                <th className="py-3 px-4 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policyChecks.map((check: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{check.policy}</td>
                  <td className="py-3 px-4 text-slate-600">{check.required}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{check.current}</td>
                  <td className="py-3 px-4 text-right">
                    {check.status === 'Passed' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" /> FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users & Groups Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AD Users List */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Domain Accounts Audit</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{user.username}</span>
                    {user.is_admin && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-50 text-rose-700 border border-rose-200">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{user.display_name}</p>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  {user.password_never_expires && (
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                      Pwd Never Expires
                    </span>
                  )}
                  {user.bad_pwd_count > 0 && (
                    <span className="text-rose-600 font-bold">
                      Bad Pwd: {user.bad_pwd_count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Groups */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Privileged Security Groups</h3>
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{group.group_name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {group.member_count} Members
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
