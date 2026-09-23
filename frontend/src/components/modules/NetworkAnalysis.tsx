import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Activity, Server, Radio, Play, Pause, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { SeverityBadge } from '../common/SeverityBadge';
import { AttackPathTopologyGraph } from '../common/AttackPathTopologyGraph';
import { formatTime } from '../../utils/dateUtils';

interface NetworkAnalysisProps {
  pcapData: any;
}

const DEFAULT_TALKERS = [
  { ip: "45.142.120.10", packets: 14200 },
  { ip: "192.168.1.10", packets: 12500 },
  { ip: "183.240.12.5", packets: 8900 },
  { ip: "192.168.1.50", packets: 5400 },
  { ip: "192.168.1.20", packets: 3370 }
];

const DEFAULT_FLOWS = [
  { id: "FLOW-901", timestamp: "12:04:12", src_ip: "45.142.120.10", dst_ip: "192.168.1.10", protocol: "TCP", port: 445, indicator: "MS17-010 EternalBlue SMB Exploit Payload (Metasploit buffer)", severity: "Critical", packet_count: 1420, bytes: "2.4 MB" },
  { id: "FLOW-902", timestamp: "12:03:50", src_ip: "183.240.12.5", dst_ip: "192.168.1.20", protocol: "TCP", port: 22, indicator: "SSH Brute Force Password Spraying Sweep (>50 auth pkts/min)", severity: "High", packet_count: 890, bytes: "1.1 MB" },
  { id: "FLOW-903", timestamp: "12:02:15", src_ip: "192.168.1.50", dst_ip: "192.168.1.10", protocol: "ARP", port: 0, indicator: "Duplicate IP Address / ARP Spoofing Probe (MITM Capture)", severity: "High", packet_count: 320, bytes: "450 KB" },
  { id: "FLOW-904", timestamp: "11:58:30", src_ip: "192.168.1.30", dst_ip: "8.8.8.8", protocol: "UDP", port: 53, indicator: "Anomalous High-Entropy TXT DNS Tunneling Query", severity: "Medium", packet_count: 150, bytes: "180 KB" }
];

export const NetworkAnalysis: React.FC<NetworkAnalysisProps> = ({ pcapData }) => {
  const [selectedFlow, setSelectedFlow] = useState<any | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  
  // Real-time Live Packet Counters
  const [livePackets, setLivePackets] = useState<number>(() => pcapData?.total_packets || 44370);
  const [liveBytesMB, setLiveBytesMB] = useState<number>(62.3);
  const [packetRate, setPacketRate] = useState<number>(240);
  const [activeFlows, setActiveFlows] = useState<any[]>(DEFAULT_FLOWS);
  const [livePacketTicker, setLivePacketTicker] = useState<string>("Initializing Wireshark PCAP live stream interface...");

  // Real-time Live Wireshark Packet Capture Simulation Engine
  useEffect(() => {
    if (!isCapturing) return;

    const sampleHeaders = [
      "TCP 45.142.120.10:49152 -> 192.168.1.10:445 [SYN, ECN, CWR] Seq=0 Win=64240 Len=0 MSS=1460",
      "UDP 183.240.12.5:53011 -> 192.168.1.20:53 DNS Standard query 0x4a1b PTR 10.120.142.45.in-addr.arpa",
      "ARP 192.168.1.50 Who has 192.168.1.10? Tell 192.168.1.50 (ARP Spoofing Probe)",
      "TCP 192.168.1.50:38902 -> 192.168.1.10:88 Kerberos TGS-REQ Target: krbtgt/CORP.DOMAIN",
      "ICMP 185.220.101.5 -> 192.168.1.1 Echo (ping) request id=0x1234 seq=1/256 ttl=54"
    ];

    const interval = setInterval(() => {
      const addedPackets = Math.floor(Math.random() * 180) + 120;
      const addedMB = parseFloat((addedPackets * 0.0008).toFixed(2));
      const rate = Math.floor(addedPackets / 1.2);

      setLivePackets((prev: number) => prev + addedPackets);
      setLiveBytesMB((prev: number) => parseFloat((prev + addedMB).toFixed(1)));
      setPacketRate(rate);

      const randomHeader = sampleHeaders[Math.floor(Math.random() * sampleHeaders.length)];
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLivePacketTicker(`[${now}] ${randomHeader}`);
    }, 1500);

    return () => clearInterval(interval);
  }, [isCapturing]);

  // Inject Packet Burst Action
  const handleInjectBurst = () => {
    setLivePackets((prev: number) => prev + 5000);
    setLiveBytesMB((prev: number) => parseFloat((prev + 8.4).toFixed(1)));
    
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const burstFlow = {
      id: `FLOW-${Date.now().toString().slice(-3)}`,
      timestamp: nowTime,
      src_ip: "185.220.101.5",
      dst_ip: "192.168.1.10",
      protocol: "TCP",
      port: 445,
      indicator: "Automated Packet Burst Injection — High-Frequency SMB Reconnaissance",
      severity: "High",
      packet_count: 5000,
      bytes: "8.4 MB"
    };

    setActiveFlows((prev: any[]) => [burstFlow, ...prev]);
  };

  const topTalkersData = (pcapData?.top_talkers && pcapData.top_talkers.length > 0) 
    ? pcapData.top_talkers 
    : DEFAULT_TALKERS;

  const protocolData = [
    { name: 'TCP (68%)', value: 68, color: '#2563EB' },
    { name: 'UDP (18%)', value: 18, color: '#9333EA' },
    { name: 'ICMP (6%)', value: 6, color: '#059669' },
    { name: 'DNS (5%)', value: 5, color: '#D97706' },
    { name: 'HTTP (3%)', value: 3, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Wireshark PCAP Live Stream Header Bar */}
      <div className="rounded-xl bg-slate-900 border border-indigo-900 p-4 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2.5 rounded-xl border ${isCapturing ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            <Radio className={`h-6 w-6 ${isCapturing ? 'animate-pulse text-rose-400' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-wider uppercase flex items-center gap-2">
                WIRESHARK PCAP LIVE PACKET STREAM
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                isCapturing ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isCapturing ? '🔴 PROMISCUOUS MODE CAPTURING' : '⏸️ CAPTURE PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5 truncate max-w-xl">
              {livePacketTicker}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCapturing(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              isCapturing 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
            }`}
          >
            {isCapturing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isCapturing ? 'Pause Capture' : 'Resume Capture'}</span>
          </button>

          <button
            onClick={handleInjectBurst}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition border border-indigo-500 shadow-md"
            title="Inject +5,000 simulated packets into live capture"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>+ Packet Burst</span>
          </button>
        </div>
      </div>

      {/* Lateral Movement Attack Path Topology Visualizer */}
      <AttackPathTopologyGraph />

      {/* Real-time Dynamic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Analyzed Packets</span>
            <Network className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
            {livePackets.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Authorized Wireshark PCAP</span>
            <span className="font-mono text-emerald-600 font-bold">{packetRate} pkts/sec</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Transferred Volume</span>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">{liveBytesMB} MB</p>
          <p className="text-xs text-slate-500 mt-1">Live Network Payload Stream</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Network Flows</span>
            <Server className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">{pcapData?.active_connections || 142}</p>
          <p className="text-xs text-slate-500 mt-1">Concurrent Sockets</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Suspicious Connections</span>
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 font-mono">{activeFlows.length}</p>
          <p className="text-xs text-slate-500 mt-1">Anomalously Flagged Flows</p>
        </div>
      </div>

      {/* Top Talkers & Protocol Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Talkers Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Top Communicating Hosts (Traffic Volume)</h3>
          <p className="text-xs text-slate-500 mb-4">Highest packet count IP endpoints across network subnets</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTalkersData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="ip" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="packets" fill="#2563EB" radius={[0, 4, 4, 0]} name="Packets Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Protocol Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of network protocols captured in packet trace</p>
          </div>
          
          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={protocolData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {protocolData.map((entry, index) => (
                    <Cell key={`p-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {protocolData.map((p) => (
              <div key={p.name} className="flex justify-between items-center text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="font-mono text-slate-500 font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suspicious Connections Inspection Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Suspicious Network Connection Patterns</h3>
            <p className="text-xs text-slate-500">Anomalous packet sweeps, SMB probes, and DNS tunneling indicators</p>
          </div>
          <span className="px-3 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
            <Radio className="h-3 w-3 animate-pulse text-rose-600" />
            Wireshark PCAP Deep Inspection
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold">Source IP</th>
                <th className="py-3 px-4 font-semibold">Destination IP</th>
                <th className="py-3 px-4 font-semibold">Protocol / Port</th>
                <th className="py-3 px-4 font-semibold">Suspicious Indicator</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeFlows.map((flow: any) => (
                <tr key={flow.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-slate-500">{formatTime(flow.timestamp)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">{flow.src_ip}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{flow.dst_ip}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium">{flow.protocol}/{flow.port}</td>
                  <td className="py-3 px-4 text-slate-900 font-medium">{flow.indicator}</td>
                  <td className="py-3 px-4"><SeverityBadge severity={flow.severity} size="sm" /></td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => setSelectedFlow(flow)}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition text-[11px]"
                    >
                      Packet Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet Inspection Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-600" />
                Packet Inspection: {selectedFlow.id}
              </h4>
              <button onClick={() => setSelectedFlow(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800">
                <span className="text-slate-500 font-sans">Source:</span> <span className="text-rose-600 font-bold">{selectedFlow.src_ip}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800">
                <span className="text-slate-500 font-sans">Destination:</span> <span className="text-blue-700 font-bold">{selectedFlow.dst_ip}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800">
                <span className="text-slate-500 font-sans">Protocol & Port:</span> {selectedFlow.protocol} / {selectedFlow.port}
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800">
                <span className="text-slate-500 font-sans">Packet Count:</span> {selectedFlow.packet_count} packets ({selectedFlow.bytes})
              </div>
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 font-sans">
                <span className="font-bold uppercase text-[10px] text-rose-700 block mb-1">Threat Indicator Rationale</span>
                {selectedFlow.indicator}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setSelectedFlow(null)} className="px-4 py-2 rounded bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
