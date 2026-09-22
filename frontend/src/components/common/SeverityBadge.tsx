import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  const sev = severity.toLowerCase();

  if (sev === 'critical') {
    colorStyle = 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs';
  } else if (sev === 'high') {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (sev === 'medium') {
    colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (sev === 'low') {
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (sev === 'informational' || sev === 'info') {
    colorStyle = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border uppercase tracking-wider ${padding} ${colorStyle}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {severity}
    </span>
  );
};
