import React, { useState } from 'react';
import { 
  Compass, LayoutDashboard, Server, ShieldAlert, FileText, Zap, Globe, 
  ChevronRight, ChevronLeft, Check, X
} from 'lucide-react';

interface TourStep {
  title: string;
  tabId: string;
  icon: any;
  badgeText: string;
  description: string;
  keyActions: string[];
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. SIEM Command Center",
    tabId: "dashboard",
    icon: LayoutDashboard,
    badgeText: "EXECUTIVE & SOC OVERVIEW",
    description: "Your central security posture command dashboard displaying real-time threat gauges, posture risk scores, and active incident metrics.",
    keyActions: [
      "View overall security score & active threat gauges",
      "Monitor recent high-severity alerts",
      "Track incident escalation and active SOC tickets"
    ]
  },
  {
    title: "2. Asset Discovery & Nmap Scans",
    tabId: "assets",
    icon: Server,
    badgeText: "NETWORK INVENTORY",
    description: "Automated network asset discovery engine that inventories Domain Controllers, Web Servers, Database Clusters, and exposes open network ports.",
    keyActions: [
      "Run authorized Nmap subnet scans (e.g. 192.168.1.0/24)",
      "View OS fingerprinting & critical host tags",
      "Discover unauthorized Shadow IT devices"
    ]
  },
  {
    title: "3. Vulnerability Management & CVEs",
    tabId: "vulnerabilities",
    icon: ShieldAlert,
    badgeText: "RISK & REMEDIATION",
    description: "Centralized vulnerability management module tracking CVE scores, exploitability metrics, and patch remediation tasks.",
    keyActions: [
      "Filter CVEs by severity (Critical, High, Medium)",
      "Update remediation statuses (Open, In Progress, Resolved)",
      "Review patch guidelines for security analysts"
    ]
  },
  {
    title: "4. Real-Time Log Analytics",
    tabId: "logs",
    icon: FileText,
    badgeText: "TELEMETRY INGESTION",
    description: "High-throughput security log ingestion engine that parses Windows Event Logs, Syslog streams, and Web Server access logs.",
    keyActions: [
      "Ingest custom test logs and view parsed JSON attributes",
      "Filter logs by event code, source IP, or severity",
      "View network dependency maps between hosts"
    ]
  },
  {
    title: "5. Threat Detection & SIGMA Engine",
    tabId: "threat-detection",
    icon: Zap,
    badgeText: "CORRELATION ENGINE",
    description: "Dynamic correlation engine matching security logs against standard SIGMA threat rules in real time.",
    keyActions: [
      "Create and edit SIGMA YAML threat detection rules",
      "Trigger manual correlation evaluations against logs",
      "Auto-escalate rule matches to Security Alerts"
    ]
  },
  {
    title: "6. GIS Breach Map & Geographic Cartography",
    tabId: "gis-map",
    icon: Globe,
    badgeText: "REAL-WORLD CARTOGRAPHY",
    description: "Interactive Leaflet GIS map displaying real-time geographic breach trajectories, attacker origin IPs, and exfiltration targets.",
    keyActions: [
      "Visualize global attack origin trajectories",
      "Click malicious IPs to inspect threat intelligence",
      "Execute instant IP containment and block rules"
    ]
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onNavigate(TOUR_STEPS[nextIdx].tabId);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onNavigate(TOUR_STEPS[prevIdx].tabId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Compass className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">SOC PLATFORM GUIDED TOUR</span>
              <h2 className="text-base font-extrabold text-slate-900">{currentStep.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 font-bold transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Card Body */}
        <div className="p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              {currentStep.badgeText}
            </span>
            <span className="text-xs font-bold text-slate-400">Step {currentStepIdx + 1} of {TOUR_STEPS.length}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shrink-0">
              <StepIcon className="h-7 w-7" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentStep.description}
            </p>
          </div>

          {/* Key Actions Checklist */}
          <div className="pt-2 border-t border-indigo-100/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Capabilities & Actions:</span>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              {currentStep.keyActions.map((action, aIdx) => (
                <li key={aIdx} className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress Step Indicators */}
        <div className="flex items-center justify-center gap-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIdx ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
