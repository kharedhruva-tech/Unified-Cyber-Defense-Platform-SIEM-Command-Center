import React, { useState, useEffect, useRef } from 'react';
import { Globe, Database, HardDrive, RefreshCw, Zap, Search, AlertTriangle, ShieldOff, MapPin, Download, Activity, CheckCircle2, Radio } from 'lucide-react';
import type { GisBreachEvent, GisSummaryMetrics } from '../../types';
import { SiemService } from '../../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ThreeGlobeView } from '../common/ThreeGlobeView';
import { formatDateTime } from '../../utils/dateUtils';


interface GisBreachMapProps {
  breaches: GisBreachEvent[];
  summary: GisSummaryMetrics | null;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

export const GisBreachMap: React.FC<GisBreachMapProps> = ({ breaches, summary, onRefresh, onShowToast }) => {
  const [selectedBreach, setSelectedBreach] = useState<GisBreachEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [containingIp, setContainingIp] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const handleTriggerSimulatedBreach = async () => {
    setIsSimulating(true);
    try {
      const res = await SiemService.triggerSimulatedBreach();
      onShowToast(res.data.message || 'Simulated Data Breach Event Generated!');
      onRefresh();
    } catch (err) {
      onShowToast('Failed to simulate GIS breach event');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleContainIp = async (ip: string) => {
    setContainingIp(ip);
    try {
      const res = await SiemService.containIp(ip);
      onShowToast(res.data.message || `IP ${ip} Contained & Blocked on Firewall`);
      onRefresh();
      if (selectedBreach && selectedBreach.attacker_ip === ip) {
        setSelectedBreach({
          ...selectedBreach,
          status: 'Firewall Blocked & Contained',
          is_contained: true
        });
      }
    } catch (err) {
      onShowToast(`Failed to deploy firewall rule for IP ${ip}`);
    } finally {
      setContainingIp(null);
    }
  };

  const handleExportSTIX = () => {
    const stixPackage = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substring(2, 11)}`,
      spec_version: "2.1",
      objects: activeBreachesList.map(b => ({
        type: "indicator",
        spec_version: "2.1",
        id: `indicator--${b.id.toLowerCase()}`,
        name: `${b.threat_actor} - ${b.attack_vector}`,
        pattern: `[ipv4-addr:value = '${b.attacker_ip}']`,
        pattern_type: "stix",
        valid_from: b.timestamp,
        confidence: 95,
        external_references: [
          {
            source_name: "mitre-attack",
            external_id: b.mitre_technique || "T1041"
          }
        ],
        custom_properties: {
          exfiltrated_mb: b.data_stolen_mb,
          stolen_records: b.affected_records,
          country: b.country,
          target_asset: b.target_asset
        }
      }))
    };

    const blob = new Blob([JSON.stringify(stixPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GIS_Threat_IOC_STIX_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported STIX 2.1 Threat Intelligence Package!');
  };

  const DEFAULT_FALLBACK_BREACHES: GisBreachEvent[] = [
    {
      id: 'BREACH-DEF-1',
      timestamp: new Date().toISOString(),
      attacker_ip: '45.142.120.10',
      country: 'Russia',
      country_code: 'RU',
      flag: '🇷🇺',
      city: 'Moscow',
      latitude: 55.7558,
      longitude: 37.6173,
      isp: 'Rostelecom AS12389',
      threat_actor: 'APT29 (Cozy Bear)',
      severity: 'Critical',
      mitre_technique: 'T1003.001 - LSASS Dumping',
      protocol: 'HTTPS TLS 1.3',
      attack_vector: 'SQL Injection Exfiltration',
      data_stolen_mb: 850.5,
      exfil_speed_mbs: 24.5,
      affected_records: 45000,
      target_asset: 'WEB-PROD-APP01 (192.168.1.10)',
      target_table: 'users, bcrypt_hashes',
      target_latitude: 20.5937,
      target_longitude: 78.9629,
      status: 'Active Breach Vector',
      is_contained: false
    },
    {
      id: 'BREACH-DEF-2',
      timestamp: new Date().toISOString(),
      attacker_ip: '175.45.176.8',
      country: 'North Korea',
      country_code: 'KP',
      flag: '🇰🇵',
      city: 'Pyongyang',
      latitude: 39.0392,
      longitude: 125.7625,
      isp: 'Star Joint Venture AS131279',
      threat_actor: 'Lazarus Group (APT38)',
      severity: 'Critical',
      mitre_technique: 'T1059.003 - Command Shell',
      protocol: 'Custom Encrypted C2',
      attack_vector: 'Active Directory LDAP Dump',
      data_stolen_mb: 1420.0,
      exfil_speed_mbs: 38.2,
      affected_records: 62500,
      target_asset: 'DC-PRIMARY-01 (192.168.1.10)',
      target_table: 'ad_users, NTLM_hashes',
      target_latitude: 20.5937,
      target_longitude: 78.9629,
      status: 'Active Breach Vector',
      is_contained: false
    },
    {
      id: 'BREACH-DEF-3',
      timestamp: new Date().toISOString(),
      attacker_ip: '103.251.170.89',
      country: 'China',
      country_code: 'CN',
      flag: '🇨🇳',
      city: 'Shanghai',
      latitude: 31.2304,
      longitude: 121.4737,
      isp: 'CHINANET Telecom',
      threat_actor: 'APT41 (Wicked Panda)',
      severity: 'Critical',
      mitre_technique: 'T1041 - Exfiltration Over C2',
      protocol: 'DNS Tunneling',
      attack_vector: 'SQL Injection Exfiltration',
      data_stolen_mb: 1240.0,
      exfil_speed_mbs: 18.7,
      affected_records: 84000,
      target_asset: 'DB-POSTGRES-01 (192.168.1.30)',
      target_table: 'customer_pii, credit_cards',
      target_latitude: 20.5937,
      target_longitude: 78.9629,
      status: 'Active Breach Vector',
      is_contained: false
    }
  ];

  const [liveBreachStream, setLiveBreachStream] = useState<GisBreachEvent[]>(() => 
    (breaches && breaches.length > 0) ? breaches : DEFAULT_FALLBACK_BREACHES
  );

  useEffect(() => {
    if (breaches && breaches.length > 0) {
      setLiveBreachStream(breaches);
    }
  }, [breaches]);

  // Real-time Dynamic GIS Exfiltration Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBreachStream(prev => {
        const updated = (prev && prev.length > 0) ? [...prev] : DEFAULT_FALLBACK_BREACHES;
        if (updated.length > 0) {
          const first = { ...updated[0] };
          first.data_stolen_mb = parseFloat((first.data_stolen_mb + Math.random() * 4 + 1).toFixed(1));
          first.exfil_speed_mbs = parseFloat((14 + Math.random() * 20).toFixed(1));
          updated[0] = first;
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeBreachesList = liveBreachStream;

  const filteredBreaches = activeBreachesList.filter(b => {
    const matchesSearch = b.attacker_ip.includes(searchQuery) ||
      b.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.threat_actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.target_asset.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'ALL' || b.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getTileUrl = (style: 'dark' | 'light' | 'satellite') => {
    if (style === 'dark') {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (style === 'light') {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Initialize Real World Leaflet Map when viewMode === '2d'
  useEffect(() => {
    if (viewMode !== '2d') return;

    // Small timeout to wait for DOM container to mount in 2D mode
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [25.0, 30.0],
          zoom: 2.3,
          minZoom: 2,
          maxZoom: 14,
          zoomControl: true,
        });

        const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
          attribution: '&copy; CartoDB &copy; OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        tileLayerRef.current = tileLayer;
        layerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      mapInstanceRef.current.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [viewMode]);

  // Update Tile Layer on Style Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    mapInstanceRef.current.invalidateSize();
  }, [mapStyle]);

  // Render Map Markers, Curved Trajectories, and Glowing Target Nodes
  useEffect(() => {
    if (viewMode !== '2d' || !mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const socHQCoords: [number, number] = [20.5937, 78.9629]; // HQ CORE SOC Target

    // 1. Target SOC HQ Marker (Glowing Cyber Node)
    const targetIcon = L.divIcon({
      className: 'custom-soc-target-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 0 16px #3b82f6, 0 0 30px #3b82f6; z-index: 5;"></div>
          <div style="position: absolute; top: 22px; background: rgba(15, 23, 42, 0.9); border: 1px solid #3b82f6; border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: 800; color: #60a5fa; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); backdrop-filter: blur(4px);">
            🛡️ HQ SOC CORE (192.168.1.0/24)
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    const targetMarker = L.marker(socHQCoords, { icon: targetIcon });
    targetMarker.bindPopup(`
      <div style="color: #f8fafc; background: #0f172a; font-family: sans-serif; padding: 8px; border-radius: 8px;">
        <strong style="color: #60a5fa; font-size: 13px;">🛡️ SOC CENTRAL TARGET NETWORK</strong><br/>
        <span style="font-size: 11px; color: #94a3b8;">Subnet Range: 192.168.1.0/24</span><br/>
        <span style="font-size: 11px; color: #4ade80; font-weight: bold;">Status: Perimeter Firewall Active</span>
      </div>
    `);
    layerGroup.addLayer(targetMarker);

    // 2. Threat Actor Origin Markers & Arc Trajectories
    filteredBreaches.forEach((b) => {
      const attackerCoords: [number, number] = [b.latitude, b.longitude];
      const isContained = b.is_contained || b.status.includes('Contained') || b.status.includes('Blocked');
      
      const colorHex = isContained 
        ? '#10b981' 
        : b.severity === 'Critical' 
          ? '#ef4444' 
          : b.severity === 'High' 
            ? '#f59e0b' 
            : '#3b82f6';

      // Custom Threat Origin Badge
      const threatIcon = L.divIcon({
        className: 'custom-threat-icon',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${colorHex}; opacity: ${isContained ? 0.2 : 0.4}; animation: ping ${isContained ? '3s' : '1.5s'} cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${colorHex}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${colorHex}; z-index: 4;"></div>
            <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.85); border: 1px solid ${colorHex}; border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 800; color: #f8fafc; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.4); backdrop-filter: blur(4px);">
              ${b.flag} ${b.country_code} <span style="color: ${colorHex}; font-family: monospace;">(${b.attacker_ip})</span>
            </div>
          </div>
        `,
        iconSize: [140, 44],
        iconAnchor: [70, 7]
      });

      const marker = L.marker(attackerCoords, { icon: threatIcon });
      
      marker.on('click', () => {
        setSelectedBreach(b);
      });

      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 11px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 13px; color: ${colorHex}; margin-bottom: 4px;">
            ${b.flag} ${b.threat_actor}
          </div>
          <div><strong>Attacker IP:</strong> <span style="font-family: monospace; color: #1e40af;">${b.attacker_ip}</span></div>
          <div><strong>Origin:</strong> ${b.city}, ${b.country}</div>
          <div><strong>MITRE Code:</strong> <span style="color: #b91c1c; font-weight: bold;">${b.mitre_technique || 'T1041'}</span></div>
          <div><strong>Exfiltrated:</strong> <span style="color: #ef4444; font-weight: bold;">${b.data_stolen_mb} MB</span> @ ${b.exfil_speed_mbs || 12.5} MB/s</div>
          <div><strong>Target:</strong> ${b.target_asset}</div>
          <div style="margin-top: 4px;"><strong>Status:</strong> <span style="color: ${isContained ? '#059669' : '#dc2626'}; font-weight: bold;">${b.status}</span></div>
        </div>
      `);

      layerGroup.addLayer(marker);

      // Generate Curved Arc Control Midpoint
      const midLat = (attackerCoords[0] + socHQCoords[0]) / 2 + (attackerCoords[1] < socHQCoords[1] ? 12 : -12);
      const midLng = (attackerCoords[1] + socHQCoords[1]) / 2 + (attackerCoords[0] < socHQCoords[0] ? 15 : -15);
      const curvePoints: [number, number][] = [attackerCoords, [midLat, midLng], socHQCoords];

      const polyline = L.polyline(curvePoints, {
        color: colorHex,
        weight: isContained ? 1.5 : 2.5,
        opacity: isContained ? 0.35 : 0.85,
        dashArray: isContained ? '4, 8' : '8, 8'
      });

      layerGroup.addLayer(polyline);
    });
  }, [filteredBreaches, viewMode]);

  return (
    <div className="space-y-6">
      {/* Live Data Exfiltration Telemetry Scrolling Ticker */}
      <div className="rounded-xl border border-rose-900/40 bg-slate-950 p-3 shadow-lg overflow-hidden flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-bold shrink-0">
          <Radio className="h-3.5 w-3.5 animate-pulse text-rose-500" />
          <span>LIVE EXFILTRATION STREAM</span>
        </div>
        <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-slate-300">
          {activeBreachesList.map((b, i) => (
            <div key={b.id || i} className="flex items-center gap-2">
              <span className="text-slate-500">[{b.timestamp?.slice(11, 19) || '14:22:05'}]</span>
              <span className="font-bold">{b.flag} {b.attacker_ip}</span>
              <span className="text-rose-400 font-extrabold">➔ {b.data_stolen_mb} MB</span>
              <span className="text-amber-400">({b.exfil_speed_mbs || 14.2} MB/s)</span>
              <span className="text-slate-400">Target: {b.target_asset}</span>
              <span className="text-slate-600 font-sans">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 shadow-sm">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                REAL-WORLD GIS THREAT EXFILTRATION MAP
              </h1>
              <p className="text-xs text-slate-500">
                Interactive Global Cartography, Animated Trajectory Arcs & Real-Time Perimeter Containment
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50/50 p-0.5 text-xs font-bold shadow-xs">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${viewMode === '3d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>3D GLOBE</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${viewMode === '2d' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>2D TACTICAL MAP</span>
            </button>
          </div>

          {viewMode === '2d' && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
              <button
                onClick={() => setMapStyle('dark')}
                className={`px-3 py-1.5 rounded-md transition ${mapStyle === 'dark' ? 'bg-slate-900 text-blue-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                DARK
              </button>
              <button
                onClick={() => setMapStyle('light')}
                className={`px-3 py-1.5 rounded-md transition ${mapStyle === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                LIGHT
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-3 py-1.5 rounded-md transition ${mapStyle === 'satellite' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                SATELLITE
              </button>
            </div>
          )}

          <button
            onClick={handleExportSTIX}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>EXPORT STIX IOC</span>
          </button>

          <button
            onClick={handleTriggerSimulatedBreach}
            disabled={isSimulating}
            className="flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>+ SIMULATE ATTACK</span>
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>SYNC GIS</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Data Stolen */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Exfiltrated Data</span>
            <HardDrive className="h-5 w-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {typeof summary?.total_stolen_data_gb === 'number' && !isNaN(summary.total_stolen_data_gb) ? summary.total_stolen_data_gb : '12.4'}
            </span>
            <span className="text-xs font-bold text-rose-600">GB Exfiltrated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across active exfiltration channels</p>
        </div>

        {/* Live Throughput Speed */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Exfil Throughput</span>
            <Activity className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {typeof summary?.active_exfiltration_rate_mbs === 'number' && !isNaN(summary.active_exfiltration_rate_mbs) ? summary.active_exfiltration_rate_mbs : '42.8'}
            </span>
            <span className="text-xs font-bold text-amber-600">MB/s Outbound</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live PCAP network throughput</p>
        </div>

        {/* Compromised Records */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stolen DB Records</span>
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {typeof summary?.total_compromised_records === 'number' && !isNaN(summary.total_compromised_records) 
                ? summary.total_compromised_records.toLocaleString() 
                : '184,500'}
            </span>
            <span className="text-xs font-bold text-blue-700">User Rows</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Hashes, PII & Active Directory users</p>
        </div>

        {/* Contained Threats */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Firewall Contained</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {typeof summary?.contained_threats_count === 'number' && !isNaN(summary.contained_threats_count) ? summary.contained_threats_count : 1}
            </span>
            <span className="text-xs font-bold text-emerald-600">IPs Blocked</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{summary?.critical_breaches_count || 3} Critical Severity Active</p>
        </div>
      </div>

      {/* 3D Global Threat Globe View or 2D Tactical Map */}
      {viewMode === '3d' ? (
        <ThreeGlobeView
          breaches={filteredBreaches}
          selectedBreach={selectedBreach}
          onSelectBreach={setSelectedBreach}
          onContainIp={handleContainIp}
          containingIp={containingIp}
        />
      ) : (
        /* Real-World Leaflet Map Viewport */
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                REAL-TIME INTERACTIVE GEOGRAPHIC VECTOR MAP (CYBER MATRIX MODE)
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-slate-700 font-medium">Attacker Origin Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-medium">Firewall Contained</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-600 border-2 border-white" />
                <span className="text-slate-700 font-medium">SOC Target HQ</span>
              </div>
            </div>
          </div>

          {/* Leaflet DOM Viewport */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[480px] rounded-xl border border-slate-800 shadow-2xl z-10 overflow-hidden relative" 
            style={{ background: mapStyle === 'dark' ? '#090D16' : '#F8FAFC' }}
          />
        </div>
      )}

      {/* Selected Threat Actor Dossier Card */}
      {selectedBreach && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedBreach.flag}</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>THREAT DOSSIER: {selectedBreach.threat_actor}</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    selectedBreach.is_contained 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : selectedBreach.severity === 'Critical' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {selectedBreach.is_contained ? 'CONTAINED & BLOCKED' : `${selectedBreach.severity} RISK`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Origin: {selectedBreach.city}, {selectedBreach.country} | Coordinates: {selectedBreach.latitude}° N, {selectedBreach.longitude}° E
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedBreach(null)}
              className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-semibold"
            >
              CLOSE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Threat Actor Profile</div>
              <div><span className="text-slate-500 font-medium">Attacker IP:</span> <span className="font-mono text-blue-700 font-bold">{selectedBreach.attacker_ip}</span></div>
              <div><span className="text-slate-500 font-medium">ISP Subnet:</span> <span className="text-slate-800 font-medium">{selectedBreach.isp}</span></div>
              <div><span className="text-slate-500 font-medium">MITRE Technique:</span> <span className="text-rose-700 font-bold">{selectedBreach.mitre_technique || 'T1190 - Exploit Public-Facing App'}</span></div>
              <div><span className="text-slate-500 font-medium">Protocol/Channel:</span> <span className="text-slate-800 font-mono">{selectedBreach.protocol || 'HTTPS'}</span></div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Exfiltration Telemetry Payload</div>
              <div><span className="text-slate-500 font-medium">Stolen Volume:</span> <span className="text-rose-600 font-extrabold text-sm">{selectedBreach.data_stolen_mb} MB</span></div>
              <div><span className="text-slate-500 font-medium">Transfer Speed:</span> <span className="text-amber-700 font-bold">{selectedBreach.exfil_speed_mbs || 16.4} MB/s</span></div>
              <div><span className="text-slate-500 font-medium">Compromised Rows:</span> <span className="text-slate-900 font-bold">{selectedBreach.affected_records.toLocaleString()} Records</span></div>
              <div><span className="text-slate-500 font-medium">Target Tables:</span> <span className="font-mono text-slate-800 font-semibold">{selectedBreach.target_table}</span></div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Target Host & Defense</div>
                <div><span className="text-slate-500 font-medium">Target Host:</span> <span className="text-blue-700 font-bold">{selectedBreach.target_asset}</span></div>
                <div><span className="text-slate-500 font-medium">Detected At:</span> <span className="text-slate-700">{formatDateTime(selectedBreach.timestamp)}</span></div>
              </div>

              <button 
                onClick={() => handleContainIp(selectedBreach.attacker_ip)}
                disabled={selectedBreach.is_contained || containingIp === selectedBreach.attacker_ip}
                className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                  selectedBreach.is_contained 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <ShieldOff className="h-4 w-4" />
                <span>{selectedBreach.is_contained ? 'PERIMETER FIREWALL BLOCK ACTIVE' : containingIp ? 'DEPLOYING FIREWALL RULE...' : 'BLOCK IP & CONTAIN HOST'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIS Data Breach Intelligence Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>GIS BREACH TELEMETRY LOGS ({filteredBreaches.length})</span>
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP, Country or Threat Actor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Threat Actor & Origin</th>
                <th className="py-3 px-4">Attacker IP</th>
                <th className="py-3 px-4">MITRE Technique</th>
                <th className="py-3 px-4">Stolen Data (MB)</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Target Asset</th>
                <th className="py-3 px-4">Severity / Status</th>
                <th className="py-3 px-4 text-right">Containment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBreaches.map((b) => {
                const isContained = b.is_contained || b.status.includes('Contained') || b.status.includes('Blocked');
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedBreach(b)}>
                    <td className="py-3 px-4 text-slate-500 font-mono">{formatDateTime(b.timestamp)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="mr-1.5">{b.flag}</span>
                      <span>{b.threat_actor}</span>
                      <span className="text-[10px] text-slate-500 block font-normal">{b.city}, {b.country}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-bold">{b.attacker_ip}</td>
                    <td className="py-3 px-4 font-mono text-rose-700 font-semibold">{b.mitre_technique || 'T1041'}</td>
                    <td className="py-3 px-4 font-extrabold text-rose-600">{b.data_stolen_mb} MB</td>
                    <td className="py-3 px-4 font-bold text-amber-600">{b.exfil_speed_mbs || 14.5} MB/s</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{b.target_asset}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isContained
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.severity === 'Critical' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isContained ? 'CONTAINED' : b.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isContained ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>BLOCKED</span>
                        </span>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleContainIp(b.attacker_ip); }}
                          disabled={containingIp === b.attacker_ip}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-[11px] transition"
                        >
                          Block IP
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

