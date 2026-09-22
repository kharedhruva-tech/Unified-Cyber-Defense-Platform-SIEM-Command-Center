import React, { useState } from 'react';
import { Zap, Plus, Play, CheckCircle2, XCircle } from 'lucide-react';
import type { DetectionRule } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface ThreatDetectionProps {
  rules: DetectionRule[];
  onToggleRule: (id: number) => void;
  onCreateRule: (data: any) => void;
  onRunEvaluation: () => void;
}

export const ThreatDetection: React.FC<ThreatDetectionProps> = ({ rules, onToggleRule, onCreateRule, onRunEvaluation }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [category, setCategory] = useState('Authentication');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [queryPattern, setQueryPattern] = useState('');
  const [threshold, setThreshold] = useState(5);
  const [windowSeconds, setWindowSeconds] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRule({
      rule_name: ruleName,
      category,
      severity,
      description,
      query_pattern: queryPattern,
      threshold,
      window_seconds: windowSeconds
    });
    setShowCreateModal(false);
  };

  const activeCount = rules.filter(r => r.is_active).length;

  return (
    <div className="space-y-6">
      {/* Auto-Detection Status Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              AUTOMATED REAL-TIME THREAT DETECTION ENGINE ACTIVE
            </h3>
            <p className="text-[11px] text-slate-600">
              Continuously matching log stream against {activeCount} active SIGMA rules. Real-time correlation enabled.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-700">
          <div className="rounded-md bg-white px-3 py-1 border border-emerald-200 shadow-2xs font-sans">
            Active Rules: <span className="font-bold text-blue-700">{activeCount} / {rules.length}</span>
          </div>
        </div>
      </div>

      {/* Hero Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">Rule-Based Threat Correlation Engine</h2>
          </div>
          <p className="text-xs text-slate-500">
            SIGMA-inspired security detection rules for brute force, privilege escalations, network sweeps, and authentication anomalies.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRunEvaluation}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
          >
            <Play className="h-4 w-4" />
            <span>Evaluate Active Rules</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold font-mono text-blue-700">RULE #{rule.id}</span>
                  <SeverityBadge severity={rule.severity} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{rule.rule_name}</h3>
              </div>

              {/* Active Toggle Switch */}
              <button
                onClick={() => onToggleRule(rule.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                  rule.is_active 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {rule.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-slate-400" />}
                <span>{rule.is_active ? 'ACTIVE' : 'DISABLED'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <span className="text-slate-900 font-sans font-semibold">{rule.category}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Query Pattern:</span>
                <span className="text-rose-600 font-bold">{rule.query_pattern}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Threshold Window:</span>
                <span className="text-amber-700 font-bold">{rule.threshold} events / {rule.window_seconds}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Create Detection Rule
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Brute Force SSH Password Spray"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Authentication">Authentication</option>
                    <option value="Active Directory">Active Directory</option>
                    <option value="Network">Network Security</option>
                    <option value="Web Application Security">Web Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Log Pattern Matching Query</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4625 or Failed password"
                  value={queryPattern}
                  onChange={(e) => setQueryPattern(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Event Threshold Count</label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Lookback Window (Seconds)</label>
                  <input
                    type="number"
                    value={windowSeconds}
                    onChange={(e) => setWindowSeconds(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Rule Description & Rationale</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm"
                >
                  Save & Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
