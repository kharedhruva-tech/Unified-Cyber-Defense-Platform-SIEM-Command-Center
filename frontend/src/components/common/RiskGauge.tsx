import React from 'react';

interface RiskGaugeProps {
  score: number;
  label?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, label = "Security Posture Score" }) => {
  let colorClass = "text-emerald-500";
  let statusText = "SECURE / OPTIMAL";
  
  if (score < 40) {
    colorClass = "text-rose-500";
    statusText = "CRITICAL RISK";
  } else if (score < 70) {
    colorClass = "text-amber-500";
    statusText = "ELEVATED THREAT";
  } else if (score < 85) {
    colorClass = "text-cyan-400";
    statusText = "MODERATE POSTURE";
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <svg className="h-36 w-36 -rotate-90 transform">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="text-slate-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-slate-900">{score}%</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{statusText}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
};
