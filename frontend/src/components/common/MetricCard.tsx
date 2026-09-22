import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'emerald' | 'amber' | 'purple';
  trend?: string;
  onClick?: () => void;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, color = 'cyan', trend, onClick, tooltip }) => {
  const iconColorMap = {
    cyan: 'bg-blue-50 text-blue-600 border-blue-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div 
      onClick={onClick}
      title={tooltip || (onClick ? `Click to view ${title} details` : undefined)}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-blue-300 hover:scale-[1.02] active:scale-[0.98]' : 'hover:scale-[1.01]'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`rounded-lg p-2.5 border ${iconColorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-900">{value}</span>
        {trend && <span className="text-xs font-bold text-emerald-600">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>}
    </div>
  );
};
