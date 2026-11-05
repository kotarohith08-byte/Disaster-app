import React from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  PhoneCall,
  Radio,
  Globe2
} from 'lucide-react';

export default function IncidentDetailModal({ incident, onClose }) {
  if (!incident) return null;

  const isCrit = incident.severity === 'CRITICAL';
  const isHigh = incident.severity === 'HIGH';
  const isMed = incident.severity === 'MEDIUM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {incident.category}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
              isCrit ? 'bg-red-500 text-white' :
              isHigh ? 'bg-orange-500 text-white' :
              isMed ? 'bg-amber-500 text-slate-900 font-bold' :
              'bg-blue-500 text-white'
            }`}>
              {incident.severity} SEVERITY
            </span>

            {incident.is_live && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Verified Feed
              </span>
            )}

            {incident.is_demo && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Demo Record
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white">{incident.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              {incident.location} ({incident.latitude.toFixed(4)}°, {incident.longitude.toFixed(4)}°)
            </span>
            {incident.event_time && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {new Date(incident.event_time).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Description & Technical Telemetry Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {incident.description}
          </div>

          {incident.image_path && (
            <div className="rounded-2xl overflow-hidden border border-slate-700 max-h-64">
              <img
                src={incident.image_path}
                alt="Incident Evidence"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Telemetry & Metadata Grid */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-400" />
              Sensor Attribution & Parameters
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Primary Source</span>
                <span className="font-bold text-white text-sm truncate block">{incident.source || 'DisasterAI'}</span>
              </div>

              {incident.magnitude !== undefined && incident.magnitude !== null && (
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Richter Magnitude</span>
                  <span className="font-bold text-amber-400 text-sm">M {incident.magnitude}</span>
                </div>
              )}

              {incident.depth_km !== undefined && incident.depth_km !== null && (
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Hypocenter Depth</span>
                  <span className="font-bold text-white text-sm">{incident.depth_km} km</span>
                </div>
              )}

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Verification Status</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {incident.verified_warning ? 'Official Alert' : 'Sensor Logged'}
                </span>
              </div>
            </div>

            {incident.source_url && (
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Official Bulletin Reference:</span>
                <a
                  href={incident.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1"
                >
                  <span>Open Primary Source Bulletin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Actionable Safety Guidance */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-[#0a0f1d] border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Verified Public Safety Directives
            </h4>

            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Maintain situational awareness via official meteorological and emergency civil defense broadcasts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Keep utility shutoffs (gas, electricity) identified and emergency 72-hour food/water reserves ready.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>In life-threatening situations, call national unified emergency dispatch (Dial <strong>112</strong>).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
