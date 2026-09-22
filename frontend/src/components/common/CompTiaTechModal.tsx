import React from 'react';
import { 
  ShieldCheck, Server, Terminal, ShieldAlert, Cpu, 
  Activity, Key, FileCode, Globe, Cloud, X, ExternalLink, CheckCircle2
} from 'lucide-react';

interface CompTiaTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface TechCategory {
  category: string;
  tool: string;
  purpose: string;
  icon: any;
  tabTarget: string;
  badge: string;
  badgeColor: string;
}

const TECH_MATRIX: TechCategory[] = [
  {
    category: 'Operating Systems',
    tool: 'Kali Linux & Windows Server 2022',
    purpose: 'Security testing baseline environment & enterprise target infrastructure domain controller.',
    icon: Server,
    tabTarget: 'hardening',
    badge: 'LAB OS ONLINE',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    category: 'Network Scanning',
    tool: 'Nmap Subnet Scanner Engine',
    purpose: 'Network discovery, open port baselining, and live host IP enumeration across lab subnets.',
    icon: Activity,
    tabTarget: 'assets',
    badge: 'NMAP PROBE ACTIVE',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    category: 'Vulnerability Assessment',
    tool: 'Nessus (Tenable Nessus Expert)',
    purpose: 'Credentialed vulnerability scanning against Windows Server 2022 and automated CVE rating.',
    icon: ShieldCheck,
    tabTarget: 'vulnerabilities',
    badge: 'NESSUS CONNECTED',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  {
    category: 'Penetration Testing',
    tool: 'Metasploit Framework (MS17-010 SMB)',
    purpose: 'Simulated exploit payload testing against SMB vulnerabilities and honeypot attack validation.',
    icon: ShieldAlert,
    tabTarget: 'threat-detection',
    badge: 'METASPLOIT ACTIVE',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  {
    category: 'Network Analysis',
    tool: 'Wireshark & PCAP Packet Inspector',
    purpose: 'Deep packet inspection, ARP spoofing detection, MITM attack capture, and HTTPS certificate analysis.',
    icon: Cpu,
    tabTarget: 'network',
    badge: 'WIRESHARK CAPTURE LIVE',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200'
  },
  {
    category: 'Log Analysis & SIEM',
    tool: 'Unified SIEM & SSH Log Stream',
    purpose: 'Correlating System & SSH logs, identifying failed login spikes, brute-force attempts, and SIGMA rules.',
    icon: FileCode,
    tabTarget: 'logs',
    badge: 'SIEM STREAMING',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    category: 'Scripting & Automation',
    tool: 'Bash/Shell & Python Scripts',
    purpose: 'Automating log processing, payload evaluation, automated containment, and threat detection rules.',
    icon: Terminal,
    tabTarget: 'threat-detection',
    badge: 'AUTOMATION READY',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  {
    category: 'Identity & Access',
    tool: 'Active Directory Domain Services (AD DS)',
    purpose: 'User accounts, Security Groups, Organizational Units (OUs), and Domain Controller role management.',
    icon: Key,
    tabTarget: 'active-directory',
    badge: 'AD DS ONLINE',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200'
  },
  {
    category: 'Security Policies',
    tool: 'Group Policy (GPO)',
    purpose: 'Enforcing password lockout policies, Kerberos ticket rules, and enterprise infrastructure hardening.',
    icon: ShieldCheck,
    tabTarget: 'hardening',
    badge: 'GPO ENFORCED',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    category: 'Network Security',
    tool: 'HTTPS / SSL/TLS Certificates',
    purpose: 'HTTPS certificate validation, TLS cipher suite audit, and encrypted payload inspection.',
    icon: Globe,
    tabTarget: 'network',
    badge: 'SSL/TLS VALIDATED',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  {
    category: 'Cloud Security',
    tool: 'Cloud Resources & GIS Shield',
    purpose: 'Securing cloud subnets, breach geo-mapping, and cloud firewall IP containment.',
    icon: Cloud,
    tabTarget: 'gis-map',
    badge: 'CLOUD SHIELD ACTIVE',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  }
];

export const CompTiaTechModal: React.FC<CompTiaTechModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
              <ShieldCheck className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider flex items-center gap-2">
                CompTIA SECURITY+ 701 LAB TECH STACK
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold uppercase">
                  UNIFIED DEFENSE APPROVED
                </span>
              </h2>
              <p className="text-xs text-slate-400">Integrated Security Tools & Industry Standard Defense Frameworks</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Matrix Table / Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TECH_MATRIX.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    onNavigate(item.tabTarget);
                    onClose();
                  }}
                  className="group relative p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                      {item.tool}
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-500" />
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.purpose}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>View Module Details</span>
                    <span>Go to Tab →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-bold">CompTIA Security+ SY0-701 Course-End Project Compliance: 100% Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
