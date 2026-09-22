import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, KeyRound, Server, Activity, ArrowRight, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { SiemService } from '../../services/api';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: { username: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await SiemService.login(username.trim(), password.trim());
      const { access_token, username: resUser, role } = res.data;
      onLoginSuccess(access_token, { username: resUser, role });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      {/* Dynamic Background Mesh Grids & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#eff6ff_0%,#f8fafc_70%)] opacity-80 pointer-events-none" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Cyber Grid Lines Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ 
          backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 border border-blue-200 shadow-md mb-4">
            <Shield className="h-10 w-10 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            UNIFIED SOC PORTAL
          </h1>
          <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-widest flex items-center justify-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-600 animate-ping" />
            Cyber Threat Defense & Telemetry Platform
          </p>
        </div>

        {/* Main Light Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-all">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                SECURE AUTHENTICATION
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter authorized SOC operator credentials</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PORTAL READY
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Operator Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or analyst_dhruva"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Access Key / Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 py-3 text-sm font-bold text-white shadow-md transition-all"
            >
              {isLoading ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin text-blue-200" />
                  <span>AUTHENTICATING WITH SOC BACKEND...</span>
                </>
              ) : (
                <>
                  <span>INITIALIZE SESSION</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Security Specs Footer */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
            <span>256-BIT JWT SECURE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-emerald-600" />
            <span>SUPABASE CLOUD SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
