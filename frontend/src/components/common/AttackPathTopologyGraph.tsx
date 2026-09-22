import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Server, ShieldCheck, Zap, Lock, Cpu, Database } from 'lucide-react';

export interface TopologyNode {
  id: string;
  name: string;
  ip: string;
  type: 'WORKSTATION' | 'DOMAIN_CONTROLLER' | 'SERVER' | 'DATABASE' | 'FIREWALL' | 'EXTERNAL';
  status: 'COMPROMISED' | 'AT_RISK' | 'SECURE' | 'CONTAINED';
  role: string;
  os: string;
  x: number;
  y: number;
  riskScore: number;
  vulnerabilities: string[];
  compromisedUser?: string;
  attackTechnique?: string;
}

export interface TopologyEdge {
  from: string;
  to: string;
  label: string;
  techniqueId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  activePulse: boolean;
}

const DEFAULT_NODES: TopologyNode[] = [
  {
    id: 'node-ext',
    name: 'External Adversary Node',
    ip: '185.220.101.5',
    type: 'EXTERNAL',
    status: 'COMPROMISED',
    role: 'Threat Actor Command & Control (C2)',
    os: 'Kali Linux 2026.1',
    x: 80,
    y: 180,
    riskScore: 100,
    vulnerabilities: ['C2 Beaconing', 'Cobalt Strike Malleable Profile'],
    attackTechnique: 'T1071 - Application Layer Protocol'
  },
  {
    id: 'node-ws1',
    name: 'FIN-WORKSTATION-04',
    ip: '192.168.1.104',
    type: 'WORKSTATION',
    status: 'COMPROMISED',
    role: 'Finance Specialist PC',
    os: 'Windows 11 Enterprise (23H2)',
    x: 280,
    y: 180,
    riskScore: 92,
    vulnerabilities: ['CVE-2024-30078 (MSHTML RCE)', 'Unpatched Chrome v121'],
    compromisedUser: 'corp\\j.doe (Finance Lead)',
    attackTechnique: 'T1566 - Spearphishing Attachment'
  },
  {
    id: 'node-dc1',
    name: 'DC-PRIMARY-01',
    ip: '192.168.1.10',
    type: 'DOMAIN_CONTROLLER',
    status: 'COMPROMISED',
    role: 'Primary Active Directory DC',
    os: 'Windows Server 2022 Datacenter',
    x: 520,
    y: 100,
    riskScore: 98,
    vulnerabilities: ['CVE-2022-26923 (Active Directory Cert Service)', 'Kerberoasting Weak SPN'],
    compromisedUser: 'corp\\krbtgt & corp\\domain_admin',
    attackTechnique: 'T1558.003 - Kerberoasting'
  },
  {
    id: 'node-srv1',
    name: 'JUMP-HOST-PROD',
    ip: '192.168.1.50',
    type: 'SERVER',
    status: 'AT_RISK',
    role: 'DevOps Bastion Jump Host',
    os: 'Ubuntu 24.04 LTS Server',
    x: 520,
    y: 280,
    riskScore: 65,
    vulnerabilities: ['Exposed SSH Port 22', 'Sudoers Cache Timeout'],
    compromisedUser: 'deploy\\admin',
    attackTechnique: 'T1021.004 - SSH Lateral Movement'
  },
  {
    id: 'node-db1',
    name: 'DB-POSTGRES-PROD',
    ip: '192.168.1.30',
    type: 'DATABASE',
    status: 'COMPROMISED',
    role: 'Core PII & Transaction Database',
    os: 'RHEL 9.3 (PostgreSQL 16.2)',
    x: 760,
    y: 180,
    riskScore: 95,
    vulnerabilities: ['Default Admin Password', 'SQL Injection in REST Endpoint'],
    compromisedUser: 'postgres_super_admin',
    attackTechnique: 'T1041 - Exfiltration Over C2'
  }
];

const DEFAULT_EDGES: TopologyEdge[] = [
  {
    from: 'node-ext',
    to: 'node-ws1',
    label: 'Initial Access (Spearphishing PDF)',
    techniqueId: 'T1566.001',
    severity: 'CRITICAL',
    activePulse: true
  },
  {
    from: 'node-ws1',
    to: 'node-dc1',
    label: 'Privilege Escalation & Kerberoasting',
    techniqueId: 'T1558.003',
    severity: 'CRITICAL',
    activePulse: true
  },
  {
    from: 'node-ws1',
    to: 'node-srv1',
    label: 'SSH Credential Reuse Lateral Move',
    techniqueId: 'T1021.004',
    severity: 'HIGH',
    activePulse: false
  },
  {
    from: 'node-dc1',
    to: 'node-db1',
    label: 'Domain Admin DB Access & Data Theft',
    techniqueId: 'T1041',
    severity: 'CRITICAL',
    activePulse: true
  }
];

export const AttackPathTopologyGraph: React.FC = () => {
  const [nodes, setNodes] = useState<TopologyNode[]>(DEFAULT_NODES);
  const [edges] = useState<TopologyEdge[]>(DEFAULT_EDGES);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(DEFAULT_NODES[1]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LATERAL_MOVEMENT' | 'CRITICAL_ONLY'>('ALL');
  const [animProgress, setAnimProgress] = useState(0);

  // Animation pulse loop along attack edges
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setAnimProgress(prev => (prev + 0.015) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleIsolateNode = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId ? { ...n, status: 'CONTAINED', riskScore: 10 } : n
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, status: 'CONTAINED', riskScore: 10 });
    }
  };

  const getNodeColor = (status: TopologyNode['status']) => {
    switch (status) {
      case 'COMPROMISED':
        return { bg: '#EF4444', border: '#DC2626', text: '#FEE2E2', glow: 'rgba(239, 68, 68, 0.5)' };
      case 'AT_RISK':
        return { bg: '#F59E0B', border: '#D97706', text: '#FEF3C7', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'CONTAINED':
        return { bg: '#3B82F6', border: '#2563EB', text: '#DBEAFE', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'SECURE':
      default:
        return { bg: '#10B981', border: '#059669', text: '#D1FAE5', glow: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
      {/* Topology Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Network className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              INTERACTIVE LATERAL MOVEMENT ATTACK TOPOLOGY GRAPH
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                ACTIVE BREACH PATH DETECTED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Active Directory Domain Trust Relationships, Lateral Movement Hops & Asset Isolation
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Filter Path:</span>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-md transition ${
                filterMode === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Assets (5)
            </button>
            <button
              onClick={() => setFilterMode('LATERAL_MOVEMENT')}
              className={`px-3 py-1 rounded-md transition ${
                filterMode === 'LATERAL_MOVEMENT' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lateral Path Only
            </button>
          </div>
        </div>
      </div>

      {/* SVG / Interactive Graph Canvas Viewport */}
      <div className="relative w-full h-[420px] bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full">
          <defs>
            {/* Arrow Marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
            </marker>
            <marker id="arrow-critical" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
            </marker>
          </defs>

          {/* Render Attack Connections (Edges) */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(n => n.id === edge.from);
            const targetNode = nodes.find(n => n.id === edge.to);
            if (!sourceNode || !targetNode) return null;

            const isSelectedEdge = selectedNode?.id === sourceNode.id || selectedNode?.id === targetNode.id;
            const strokeColor = edge.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B';

            // Pulse particle interpolation along line
            const pulseX = sourceNode.x + (targetNode.x - sourceNode.x) * animProgress;
            const pulseY = sourceNode.y + (targetNode.y - sourceNode.y) * animProgress;

            return (
              <g key={`edge-${idx}`}>
                {/* Edge Line */}
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={isSelectedEdge ? 3 : 2}
                  strokeDasharray={edge.severity === 'CRITICAL' ? '6,6' : 'none'}
                  markerEnd={edge.severity === 'CRITICAL' ? 'url(#arrow-critical)' : 'url(#arrow)'}
                  opacity={0.8}
                />

                {/* Edge Label Badge */}
                <foreignObject
                  x={(sourceNode.x + targetNode.x) / 2 - 80}
                  y={(sourceNode.y + targetNode.y) / 2 - 14}
                  width={160}
                  height={28}
                >
                  <div className="flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/90 text-rose-300 border border-rose-500/40 shadow-md backdrop-blur-md">
                      {edge.techniqueId}
                    </span>
                  </div>
                </foreignObject>

                {/* Flowing Pulse Particle */}
                {edge.activePulse && (
                  <circle
                    cx={pulseX}
                    cy={pulseY}
                    r={5}
                    fill={strokeColor}
                    className="animate-pulse"
                    style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}
                  />
                )}
              </g>
            );
          })}

          {/* Render Graph Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            const colors = getNodeColor(node.status);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Outer Glow Halo */}
                <circle
                  r={isSelected ? 32 : 26}
                  fill="none"
                  stroke={colors.bg}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={0.8}
                  style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
                />

                {/* Inner Base Circle */}
                <circle
                  r={22}
                  fill="#0F172A"
                  stroke={colors.bg}
                  strokeWidth={2}
                />

                {/* Node Icon */}
                <g transform="translate(-10, -10)">
                  {node.type === 'DOMAIN_CONTROLLER' && <Lock className="h-5 w-5 text-amber-400" />}
                  {node.type === 'WORKSTATION' && <Cpu className="h-5 w-5 text-rose-400" />}
                  {node.type === 'DATABASE' && <Database className="h-5 w-5 text-rose-500" />}
                  {node.type === 'SERVER' && <Server className="h-5 w-5 text-blue-400" />}
                  {node.type === 'EXTERNAL' && <ShieldAlert className="h-5 w-5 text-rose-600" />}
                </g>

                {/* Node Label Card */}
                <text
                  y={38}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                >
                  {node.name}
                </text>
                <text
                  y={52}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspection Dossier Panel */}
      {selectedNode && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node Summary */}
          <div className="space-y-2 border-r border-slate-800 pr-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded uppercase ${
                selectedNode.status === 'COMPROMISED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                selectedNode.status === 'CONTAINED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {selectedNode.status}
              </span>
              <span className="text-xs font-mono text-blue-400">{selectedNode.ip}</span>
            </div>
            <h3 className="text-lg font-black text-white">{selectedNode.name}</h3>
            <p className="text-xs text-slate-400">{selectedNode.role}</p>
            <p className="text-xs text-slate-500 font-mono">OS: {selectedNode.os}</p>
          </div>

          {/* Vulnerabilities & MITRE Attack Details */}
          <div className="space-y-2 border-r border-slate-800 pr-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Attack Vector & Exploited CVEs</h4>
            <div className="space-y-1">
              <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-rose-500" />
                {selectedNode.attackTechnique || 'Lateral Movement Vector'}
              </p>
              {selectedNode.compromisedUser && (
                <p className="text-xs text-slate-300">
                  Compromised User: <strong className="text-amber-300 font-mono">{selectedNode.compromisedUser}</strong>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedNode.vulnerabilities.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-mono">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Risk Score & Isolation Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Node Risk Score:</span>
                <span className={`text-base font-black ${selectedNode.riskScore > 80 ? 'text-rose-500' : 'text-amber-500'}`}>
                  {selectedNode.riskScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${selectedNode.riskScore > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${selectedNode.riskScore}%` }}
                />
              </div>
            </div>

            <button
              disabled={selectedNode.status === 'CONTAINED'}
              onClick={() => handleIsolateNode(selectedNode.id)}
              className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedNode.status === 'CONTAINED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {selectedNode.status === 'CONTAINED' ? 'Asset Network Isolated' : 'Trigger Automated Host Containment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
