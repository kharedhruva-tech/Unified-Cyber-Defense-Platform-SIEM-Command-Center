import React from 'react';
import { Shield, Bell, RefreshCw, Play, Pause, Zap, LogOut, BookOpen, Lock, Sparkles, Compass, BellRing, Radio } from 'lucide-react';
import { getRoleConfig } from '../../config/rbac';

interface HeaderProps {
  activeModule: string;
  onRefresh: () => void;
  isLoading: boolean;
  alertCount: number;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
  onTriggerUserEvent: () => void;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
  onOpenGuide: () => void;
  onOpenTechModal?: () => void;
  onOpenCaptureConsole?: () => void;
  onOpenCopilot?: () => void;
  onOpenTour?: () => void;
  onOpenNotifications?: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeModule, 
  onRefresh, 
  isLoading, 
  alertCount,
  isAutoSimulating,
  onToggleAutoSim,
  onTriggerUserEvent,
  currentUser,
  onLogout,
  onOpenGuide,
  onOpenTechModal,
  onOpenCaptureConsole,
  onOpenCopilot,
  onOpenTour,
  onOpenNotifications,
  onNavigate
}) => {
  const initials = currentUser?.username ? currentUser.username.slice(0, 2).toUpperCase() : 'OP';
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md shadow-sm">
      {/* Title & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 border border-blue-200">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-black text-blue-900 uppercase tracking-wider">UNIFIED SOC COMMAND</span>
        </div>
        <div className="h-4 w-px bg-slate-300" />
        <h1 className="text-base font-bold text-slate-900 capitalize">{activeModule.replace('-', ' ')}</h1>
      </div>

      {/* Ticker & Actions */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {/* Real-Time Live Monitoring Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-sm shrink-0" title="Real-time security telemetry is continuously streaming every 4 seconds">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span>MONITORING: LIVE (4s)</span>
        </div>

        {/* Live Capture Console Button */}
        {onOpenCaptureConsole && (
          <button
            onClick={onOpenCaptureConsole}
            title="Open Live Telemetry & Packet Ingestion Console"
            className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-black text-rose-900 transition shadow-sm shrink-0"
          >
            <Radio className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
            <span>Live Capture</span>
          </button>
        )}

        {/* CompTIA Security+ 701 Tech Stack Button */}
        {onOpenTechModal && (
          <button
            onClick={onOpenTechModal}
            title="View Integrated CompTIA Security+ 701 Technologies & Tools Matrix"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 text-xs font-black text-emerald-900 transition shadow-sm shrink-0"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Security+ 701 Stack</span>
          </button>
        )}

        {/* AI Security Copilot Button */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Launch AI Security Assistant & Plain-English Copilot"
            className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 text-xs font-bold text-purple-900 transition shadow-sm animate-pulse shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>AI Copilot</span>
          </button>
        )}

        {/* Guided Onboarding Tour Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            title="Start Interactive Guided Onboarding Tour"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 text-xs font-bold text-indigo-900 transition shadow-sm shrink-0"
          >
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tour Platform</span>
          </button>
        )}

        {/* User Guide Button */}
        <button
          onClick={onOpenGuide}
          title="Open User Guide & Operations Cheatsheet"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800 transition shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5 text-blue-600" />
          <span>User Guide</span>
        </button>

        {/* Automated User Activity Toggle Button */}
        <button
          onClick={onToggleAutoSim}
          title={isAutoSimulating ? "Click to Pause Background User Activity Simulation" : "Click to Start Background User Activity Simulation"}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition shrink-0 ${
            isAutoSimulating 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-sm' 
              : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isAutoSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{isAutoSimulating ? 'AUTO-USERS' : 'PAUSED'}</span>
          {isAutoSimulating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>

        {/* Trigger Single Simulated User Event */}
        <button
          onClick={onTriggerUserEvent}
          title="Instantly generate 1 simulated user logon or threat activity event"
          className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 text-xs font-bold text-amber-900 transition shadow-sm shrink-0"
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span>+ Event</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Manually sync telemetry from backend database"
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          <span>SYNC</span>
        </button>

        {/* Multichannel Notification Settings */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            title="Configure Multichannel Alerts (Web Push, Slack & Discord Webhooks)"
            className="flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-100 p-2 text-slate-700 transition shadow-sm shrink-0"
          >
            <BellRing className="h-4 w-4 text-amber-600" />
          </button>
        )}

        {/* Active Alerts Bell */}
        <div 
          onClick={() => onNavigate('alerts')}
          title="Click to view Security Alerts"
          className="relative cursor-pointer rounded-lg border border-slate-300 bg-white hover:bg-slate-100 p-2 text-slate-700 transition shadow-sm shrink-0"
        >
          <Bell className="h-4 w-4 text-amber-600" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white animate-pulse">
              {alertCount}
            </span>
          )}
        </div>

        {/* User Badge & Logged-In Account Info (ALWAYS VISIBLE) */}
        <div 
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/90 px-3 py-1.5 shrink-0 shadow-sm"
          title={`Logged in User: ${currentUser?.username || 'Operator'} (${roleConfig.name}). Features: ${roleConfig.featuresDescription}`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-sm shrink-0">
            {initials}
          </div>
          <div className="block text-left">
            <p className="text-xs font-extrabold text-blue-950 leading-tight flex items-center gap-1">
              <span>{currentUser?.username || 'Operator'}</span>
              {roleConfig.isReadOnly && <Lock className="h-3 w-3 text-amber-600 shrink-0" />}
            </p>
            <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${roleConfig.badgeBg} ${roleConfig.badgeTextClass} ${roleConfig.badgeBorder}`}>
              {roleConfig.name}
            </span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out of SOC Portal"
              className="ml-1 p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
