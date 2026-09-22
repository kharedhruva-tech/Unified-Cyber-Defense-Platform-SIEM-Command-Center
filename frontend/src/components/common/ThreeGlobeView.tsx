import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, ShieldOff, Globe, AlertTriangle } from 'lucide-react';
import type { GisBreachEvent } from '../../types';

interface ThreeGlobeViewProps {
  breaches: GisBreachEvent[];
  selectedBreach: GisBreachEvent | null;
  onSelectBreach: (breach: GisBreachEvent) => void;
  onContainIp: (ip: string) => void;
  containingIp: string | null;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ThreatArc {
  source: { lat: number; lng: number; name: string; ip: string };
  target: { lat: number; lng: number; name: string };
  color: string;
  progress: number;
  speed: number;
  breach: GisBreachEvent;
}

// Target Enterprise Datacenters
const SOC_TARGETS = [
  { name: 'HQ Datacenter (US-East)', lat: 38.8951, lng: -77.0364 },
  { name: 'EU Cloud Hub (Frankfurt)', lat: 50.1109, lng: 8.6821 },
  { name: 'APAC SOC (Tokyo)', lat: 35.6762, lng: 139.6503 },
  { name: 'UK Gateway (London)', lat: 51.5074, lng: -0.1278 }
];

export const ThreeGlobeView: React.FC<ThreeGlobeViewProps> = ({
  breaches,
  selectedBreach,
  onSelectBreach,
  onContainIp,
  containingIp
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);

  // Globe rotation state
  const rotationRef = useRef({ rotX: 0.3, rotY: 0.5 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const radius = 220; // 3D Globe Radius in pixels

  // Helper to convert Lat/Long to 3D Sphere Coordinates
  const latLngToVector3 = (lat: number, lng: number, r: number = radius): Point3D => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
      x: -(r * Math.sin(phi) * Math.sin(theta)),
      y: r * Math.cos(phi),
      z: r * Math.sin(phi) * Math.cos(theta)
    };
  };

  // 3D Point Rotation around X and Y axes
  const rotatePoint = (p: Point3D, rotX: number, rotY: number): Point3D => {
    // Rotate Y (Longitude spin)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = p.x * cosY + p.z * sinY;
    const z1 = -p.x * sinY + p.z * cosY;

    // Rotate X (Latitude tilt)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  };

  // 3D Quadratic Bezier Arc calculation
  const get3DBezierPoint = (p0: Point3D, p1: Point3D, p2: Point3D, t: number): Point3D => {
    const oneMinusT = 1 - t;
    return {
      x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
      y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
      z: oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Create Arc trajectories from breaches to SOC targets
    const arcs: ThreatArc[] = breaches.map((b, idx) => {
      const target = SOC_TARGETS[idx % SOC_TARGETS.length];
      const color = String(b.severity).toUpperCase() === 'CRITICAL' ? '#EF4444' : String(b.severity).toUpperCase() === 'HIGH' ? '#F59E0B' : '#3B82F6';
      return {
        source: { lat: b.latitude, lng: b.longitude, name: b.country, ip: b.attacker_ip },
        target,
        color,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008,
        breach: b
      };
    });

    // Main 3D Render Loop
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto-rotation update
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current.rotY += 0.003 * animSpeed;
      }

      const { rotX, rotY } = rotationRef.current;

      // Draw Outer Glowing Atmosphere
      const atmosphereGradient = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.35);
      atmosphereGradient.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
      atmosphereGradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      atmosphereGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Draw Base Dark Globe Sphere
      const sphereGradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 10, cx, cy, radius);
      sphereGradient.addColorStop(0, '#1E293B');
      sphereGradient.addColorStop(0.6, '#0F172A');
      sphereGradient.addColorStop(1, '#020617');
      ctx.fillStyle = sphereGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Latitude & Longitude Mesh Grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;

      // Latitudes
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 10) {
          const pt = rotatePoint(latLngToVector3(lat, lng), rotX, rotY);
          if (pt.z > 0) {
            const sx = cx + pt.x;
            const sy = cy - pt.y;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Longitudes
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 10) {
          const pt = rotatePoint(latLngToVector3(lat, lng), rotX, rotY);
          if (pt.z > 0) {
            const sx = cx + pt.x;
            const sy = cy - pt.y;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Render SOC Datacenter Target Nodes
      SOC_TARGETS.forEach(t => {
        const pt = rotatePoint(latLngToVector3(t.lat, t.lng), rotX, rotY);
        if (pt.z > 0) {
          const sx = cx + pt.x;
          const sy = cy - pt.y;

          // Target Pulsing Beacon
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const pulseR = 6 + (Date.now() % 1200) / 100;
          ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#94A3B8';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(t.name, sx + 8, sy + 3);
        }
      });

      // Render 3D Attack Arcs & Particle Flows
      arcs.forEach(arc => {
        const p0 = rotatePoint(latLngToVector3(arc.source.lat, arc.source.lng), rotX, rotY);
        const p2 = rotatePoint(latLngToVector3(arc.target.lat, arc.target.lng), rotX, rotY);

        // Calculate elevated 3D Midpoint for trajectory curvature
        const midLat = (arc.source.lat + arc.target.lat) / 2;
        const midLng = (arc.source.lng + arc.target.lng) / 2;
        const p1 = rotatePoint(latLngToVector3(midLat, midLng, radius * 1.45), rotX, rotY);

        // Only draw if either endpoint is on visible front hemisphere
        if (p0.z > -50 || p2.z > -50) {
          ctx.strokeStyle = arc.color === '#EF4444' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();

          const steps = 30;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pt = get3DBezierPoint(p0, p1, p2, t);
            const sx = cx + pt.x;
            const sy = cy - pt.y;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();

          // Flowing Attack Particle along Curve
          arc.progress = (arc.progress + arc.speed * animSpeed) % 1;
          const currentPt = get3DBezierPoint(p0, p1, p2, arc.progress);
          const px = cx + currentPt.x;
          const py = cy - currentPt.y;

          if (currentPt.z > 0) {
            ctx.fillStyle = arc.color;
            ctx.shadowColor = arc.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // Render Breach Origin Threat Nodes
      breaches.forEach(b => {
        const pt = rotatePoint(latLngToVector3(b.latitude, b.longitude), rotX, rotY);
        if (pt.z > 0) {
          const sx = cx + pt.x;
          const sy = cy - pt.y;

          const isSelected = selectedBreach?.id === b.id;
          const nodeColor = b.is_contained ? '#10B981' : String(b.severity).toUpperCase() === 'CRITICAL' ? '#EF4444' : '#F59E0B';

          // Node Marker
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(sx, sy, isSelected ? 8 : 5, 0, Math.PI * 2);
          ctx.fill();

          if (!b.is_contained) {
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            const ring = 6 + (Date.now() % 1500) / 120;
            ctx.arc(sx, sy, ring, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Flag / IP Tag
          ctx.fillStyle = '#FFFFFF';
          ctx.font = isSelected ? 'bold 11px Inter' : '10px Inter';
          ctx.fillText(`${b.country} (${b.attacker_ip})`, sx + 8, sy - 4);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [breaches, selectedBreach, isRotating, animSpeed]);

  // Mouse Drag Orbit Control handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    rotationRef.current.rotY += dx * 0.005;
    rotationRef.current.rotX += dy * 0.005;

    // Clamp X rotation to avoid flipping upside down
    rotationRef.current.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotationRef.current.rotX));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const { rotX, rotY } = rotationRef.current;

    // Find closest threat node within 15px radius
    let closest: GisBreachEvent | null = null;
    let minDist = 20;

    breaches.forEach(b => {
      const pt = rotatePoint(latLngToVector3(b.latitude, b.longitude), rotX, rotY);
      if (pt.z > 0) {
        const sx = cx + pt.x;
        const sy = cy - pt.y;
        const dist = Math.hypot(clickX - sx, clickY - sy);
        if (dist < minDist) {
          minDist = dist;
          closest = b;
        }
      }
    });

    if (closest) {
      onSelectBreach(closest);
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-6">
      {/* HUD Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Globe className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              3D EXECUTIVE WAR ROOM THREAT GLOBE
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                GPU 60 FPS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-Time Ballistic Attack Trajectories & Global Geospatial Cyber Ingress
            </p>
          </div>
        </div>

        {/* HUD Control Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isRotating
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRotating ? 'Pause Orbit' : 'Auto Rotate'}
          </button>

          <button
            onClick={() => {
              rotationRef.current = { rotX: 0.3, rotY: 0.5 };
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset View
          </button>

          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs text-slate-300">
            <span className="px-2 font-semibold text-[11px] text-slate-400">Speed:</span>
            {[1, 2, 4].map(s => (
              <button
                key={`speed-${s}`}
                onClick={() => setAnimSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  animSpeed === s ? 'bg-blue-600 text-white' : 'hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D WebGL / Canvas Container */}
      <div className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={900}
          height={620}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="max-w-full max-h-full"
        />
      </div>

      {/* Selected Node Bottom Drawer Detail Overlay */}
      {selectedBreach && (
        <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${
              String(selectedBreach.severity).toUpperCase() === 'CRITICAL'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{selectedBreach.country} Target Attack Vector</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                  String(selectedBreach.severity).toUpperCase() === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedBreach.severity} SEVERITY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Attacker IP: <strong className="text-blue-400 font-mono">{selectedBreach.attacker_ip}</strong> | MITRE:{' '}
                <strong className="text-slate-200">{selectedBreach.mitre_technique || 'T1041 Exfiltration'}</strong> | Stolen: {selectedBreach.data_stolen_mb} MB ({selectedBreach.affected_records.toLocaleString()} records)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={selectedBreach.is_contained || containingIp === selectedBreach.attacker_ip}
              onClick={() => onContainIp(selectedBreach.attacker_ip)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                selectedBreach.is_contained
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              }`}
            >
              <ShieldOff className="h-4 w-4" />
              {selectedBreach.is_contained ? 'IP Contained & Blocked' : 'Instantly Contain & Block IP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
