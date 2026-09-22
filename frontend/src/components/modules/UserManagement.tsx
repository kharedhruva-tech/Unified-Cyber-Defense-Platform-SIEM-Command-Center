import React, { useState, useEffect } from 'react';
import { Users, Shield, Lock, UserPlus, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { SiemService } from '../../services/api';
import { ROLE_CONFIGS, getRoleConfig } from '../../config/rbac';

interface UserManagementProps {
  currentUserRole?: string;
  onShowToast: (msg: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUserRole, onShowToast }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('analyst');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await SiemService.getUsers();
      setUsers(res.data);
    } catch (err) {
      onShowToast('Failed to fetch user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, username: string, updatedRole: string) => {
    try {
      await SiemService.updateUserRole(userId, updatedRole);
      onShowToast(`Updated role for ${username} to ${getRoleConfig(updatedRole).name}!`);
      fetchUsers();
    } catch (err) {
      onShowToast(`Failed to update role for ${username}`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      onShowToast('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SiemService.registerUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        role: newRole
      });
      onShowToast(`Created user account '${newUsername}' with role '${getRoleConfig(newRole).name}'!`);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('analyst');
      fetchUsers();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to create user account.';
      onShowToast(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = currentUserRole !== 'admin';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              USER MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure SOC operator accounts, enforce granular permissions, and inspect feature access policies across 8 security tiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>SYNC USER DIRECTORY</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: User Directory & New User Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                REGISTERED SOC OPERATORS ({users.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage operator permissions & active roles</p>
            </div>
            {isReadOnly && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                ADMIN ROLE REQUIRED TO EDIT
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4 text-right">Role Reassignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 uppercase">
                            {user.username.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.username}</span>
                            <span className="text-[10px] text-slate-400">ID #{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeTextClass} ${roleConfig.badgeBorder}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {roleConfig.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          disabled={isReadOnly}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, user.username, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 disabled:opacity-50 shadow-sm"
                        >
                          {Object.values(ROLE_CONFIGS).map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.isReadOnly ? '(Read-Only)' : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Panel (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">PROVISION NEW OPERATOR</h2>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. jsmith_ir"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={isReadOnly}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. jsmith@cyberdefense.lab"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  disabled={isReadOnly}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned SOC Role
                </label>
                <select
                  disabled={isReadOnly}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none transition disabled:opacity-50"
                >
                  {Object.values(ROLE_CONFIGS).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isReadOnly || isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 py-2.5 text-xs font-bold text-white shadow-md transition-all mt-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>PROVISION OPERATOR ACCOUNT</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Bcrypt Password Encryption Active</span>
            </div>
            <p>User credentials are encrypted and stored in PostgreSQL / Supabase auth datastore.</p>
          </div>
        </div>
      </div>

      {/* Comprehensive 8-Role Access Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            ENTERPRISE SOC ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full permissions breakdown mapping roles to authorized feature modules & write capabilities.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Features & Authorized Access</th>
                <th className="py-3 px-4">Access Mode</th>
                <th className="py-3 px-4">Authorized Modules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {Object.values(ROLE_CONFIGS).map((rc) => (
                <tr key={rc.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rc.badgeBg} ${rc.badgeTextClass} ${rc.badgeBorder}`}>
                      {rc.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-semibold max-w-sm">
                    {rc.featuresDescription}
                  </td>
                  <td className="py-4 px-4">
                    {rc.isReadOnly ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Lock className="h-3 w-3" /> READ-ONLY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> FULL READ / WRITE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {rc.allowedTabs.map((tab) => (
                        <span key={tab} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
                          {tab}
                        </span>
                      ))}
                    </div>
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
