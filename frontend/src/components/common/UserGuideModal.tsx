import React from 'react';
import { 
  BookOpen, Zap, Bell, Server, X, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onRunEvaluation: () => void;
  onTriggerUserEvent: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunEvaluation,
  onTriggerUserEvent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Unified SOC Command Center — Operations Guide</h2>
              <p className="text-xs text-slate-500">Quick start guide & operations cheatsheet for security analysts.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Steps Operations Walkthrough */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 border border-blue-200 text-[11px]">1</span>
              <span>Real-Time Security Logs</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log events are streamed every 4 seconds. Click <strong>+ Sim User Event</strong> in the top bar to inject simulated logins or web attack events instantly.
            </p>
            <button
              onClick={() => { onTriggerUserEvent(); onClose(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-1"
            >
              <span>+ Inject Test Event</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-[11px]">2</span>
              <span>Threat Correlation Engine</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SIGMA rules scan incoming logs dynamically for brute force, privilege escalation, and SQL injection patterns to generate alerts.
            </p>
            <button
              onClick={() => { onRunEvaluation(); onClose(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 pt-1"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Evaluate SIGMA Rules Now</span>
            </button>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 border border-rose-200 text-[11px]">3</span>
              <span>Alert & Incident Management</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review flagged alerts under <strong>Security Alerts</strong>. One-click escalate high-risk alerts into incident tickets with automated containment actions.
            </p>
            <button
              onClick={() => { onNavigate('alerts'); onClose(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 pt-1"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>View Active Alerts</span>
            </button>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-[11px]">4</span>
              <span>GIS Map & Asset Discovery</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track real-world geographic data exfiltration trajectories on the <strong>GIS Breach Map</strong> and discover network assets with authorized Nmap scans.
            </p>
            <button
              onClick={() => { onNavigate('gis-map'); onClose(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-1"
            >
              <Server className="h-3.5 w-3.5" />
              <span>Open GIS Cartography Map</span>
            </button>
          </div>

        </div>

        {/* Quick Operations Shortcuts */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Click any metric card on the main dashboard to jump directly to its detailed module.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition whitespace-nowrap"
          >
            Got it, Start Monitoring!
          </button>
        </div>

      </div>
    </div>
  );
};
