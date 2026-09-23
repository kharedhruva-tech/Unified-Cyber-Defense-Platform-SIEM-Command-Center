import React, { useState } from 'react';
import { AlertTriangle, ShieldOff, Lock, UserCheck, Plus, Clock } from 'lucide-react';
import type { Incident, IncidentStatus } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { formatDateTime } from '../../utils/dateUtils';

interface IncidentManagementProps {
  incidents: Incident[];
  onUpdateStatus: (id: number, status: string, analyst?: string, note?: string) => void;
  onExecuteContainment: (id: number, actionType: string) => void;
  onCreateIncident: (data: any) => void;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({ 
  incidents, 
  onUpdateStatus, 
  onExecuteContainment, 
  onCreateIncident 
}) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');
  const [assignedAnalyst, setAssignedAnalyst] = useState('Dhruva (SOC L2)');

  const statuses: IncidentStatus[] = [
    'Detection', 'Alert', 'Investigation', 'Risk Assessment', 
    'Containment', 'Remediation', 'Verification', 'Resolved'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateIncident({ title, description, severity, assigned_analyst: assignedAnalyst });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Automated Incident Management & Active Containment Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track incident lifecycle from initial detection to automated containment, remediation, and resolution.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Incident Ticket</span>
        </button>
      </div>

      {/* Main Kanban / List View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-4">
          {incidents.map((inc) => (
            <div 
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm space-y-4 transition hover:border-slate-300 ${
                selectedIncident?.id === inc.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {inc.incident_id_str}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{inc.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={inc.severity} size="sm" />
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                    {inc.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{inc.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Assigned: <strong className="text-slate-800">{inc.assigned_analyst}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDateTime(inc.created_at)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Ticket Action Drawer */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">{selectedIncident.incident_id_str}</span>
                  <SeverityBadge severity={selectedIncident.severity} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{selectedIncident.title}</h4>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lifecycle Stage</label>
                <select
                  value={selectedIncident.status}
                  onChange={(e) => onUpdateStatus(selectedIncident.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-blue-700 focus:border-blue-600 focus:bg-white"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Automated Containment Action Triggers */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Active Containment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onExecuteContainment(selectedIncident.id, 'isolate_host')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition"
                  >
                    <ShieldOff className="h-3.5 w-3.5 text-rose-600" />
                    <span>Isolate Host</span>
                  </button>
                  <button
                    onClick={() => onExecuteContainment(selectedIncident.id, 'block_ip')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Block IP</span>
                  </button>
                </div>
              </div>

              {/* Timeline Notes */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Timeline History</label>
                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] pr-1">
                  {JSON.parse(selectedIncident.timeline_json || '[]').map((t: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                      <span className="text-blue-700 font-bold">[{t.time}]</span> {t.event}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400">
              <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Select an incident ticket from the board to view timeline & trigger containment responses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Open Incident Ticket</h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Domain Controller Kerberos Ticket Forgery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-bold focus:border-blue-600 focus:bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assigned SOC Analyst</label>
                <input
                  type="text"
                  value={assignedAnalyst}
                  onChange={(e) => setAssignedAnalyst(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-semibold focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Incident Description & Evidence</label>
                <textarea
                  rows={3}
                  required
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
                  className="px-4 py-2 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
                >
                  Create Incident Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
