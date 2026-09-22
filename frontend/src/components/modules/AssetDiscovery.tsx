import React, { useState } from 'react';
import { Server, ShieldAlert, Cpu, Play, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Asset } from '../../types';
import { MetricCard } from '../common/MetricCard';

interface AssetDiscoveryProps {
  assets: Asset[];
  onRunScan: (target: string) => void;
  isLoading: boolean;
}

export const AssetDiscovery: React.FC<AssetDiscoveryProps> = ({ assets, onRunScan, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetSubnet, setTargetSubnet] = useState('192.168.1.0/24');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter(a => 
    a.ip_address.includes(searchTerm) || 
    (a.hostname && a.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.os_name && a.os_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAssets = assets.length;
  const onlineAssets = assets.filter(a => a.status === 'Online').length;
  const unknownAssets = assets.filter(a => a.is_unknown).length;
  const totalOpenServices = assets.reduce((sum, a) => sum + (a.services ? a.services.length : 0), 0);
  const criticalExposures = assets.filter(a => a.risk_score >= 75).length;

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Assets" value={totalAssets} subtitle="Inventory Catalog" icon={Server} color="cyan" />
        <MetricCard title="Online Assets" value={onlineAssets} subtitle="Active Host Responders" icon={CheckCircle2} color="emerald" />
        <MetricCard title="Unknown / Shadow IT" value={unknownAssets} subtitle="Unsanctioned Devices" icon={AlertCircle} color="rose" />
        <MetricCard title="Open Services" value={totalOpenServices} subtitle="Enumerated Ports" icon={Cpu} color="amber" />
        <MetricCard title="Critical Exposures" value={criticalExposures} subtitle="Risk Score >= 75.0" icon={ShieldAlert} color="purple" />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP, Hostname, OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Nmap Scan Trigger */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={targetSubnet}
            onChange={(e) => setTargetSubnet(e.target.value)}
            className="w-36 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
          />
          <button
            onClick={() => onRunScan(targetSubnet)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Launch Nmap Scan</span>
          </button>
        </div>
      </div>

      {/* Asset Table & Detail Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Discovered Infrastructure Inventory</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Host IP</th>
                  <th className="py-3 px-4 font-semibold">Hostname</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Operating System</th>
                  <th className="py-3 px-4 font-semibold">Open Ports</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    onClick={() => setSelectedAsset(asset)}
                    className={`cursor-pointer hover:bg-slate-50 transition ${selectedAsset?.id === asset.id ? 'bg-blue-50/60 border-l-2 border-blue-600' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 flex items-center gap-2">
                      {asset.ip_address}
                      {asset.is_unknown && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-50 text-rose-700 border border-rose-200">
                          SHADOW IT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{asset.hostname || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.category}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.os_name || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">{asset.services ? asset.services.length : 0} Ports</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        asset.risk_score >= 75 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        asset.risk_score >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {asset.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:underline text-xs font-semibold">Inspect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Host Detail Drawer / Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">{selectedAsset.ip_address}</h4>
                  <p className="text-xs text-slate-500">{selectedAsset.hostname}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  {selectedAsset.category}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">MAC Address:</span>
                  <span className="font-mono text-slate-900 font-medium">{selectedAsset.mac_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Operating System:</span>
                  <span className="text-slate-900 font-medium">{selectedAsset.os_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Asset Status:</span>
                  <span className="text-emerald-700 font-semibold">{selectedAsset.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Host Risk Metric:</span>
                  <span className="font-bold text-rose-600">{selectedAsset.risk_score} / 100</span>
                </div>
              </div>

              {/* Enumerated Services List */}
              <div className="mt-4">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Enumerated Open Services</h5>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedAsset.services && selectedAsset.services.length > 0 ? (
                    selectedAsset.services.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{svc.port}/{svc.protocol}</span>
                          <span className="font-semibold text-slate-900">{svc.service_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{svc.version}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No open services enumerated.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-12">
              <Server className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-500">Select an asset from the table to view service details & vulnerabilities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
