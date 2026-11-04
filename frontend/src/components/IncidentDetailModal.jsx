import React from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  PhoneCall
} from 'lucide-react';

export default function IncidentDetailModal({ incident, onClose }) {
  if (!incident) return null;

  const isCrit = incident.severity === 'CRITICAL';
  const isHigh = incident.severity === 'HIGH';
  const isMed = incident.severity === 'MEDIUM';

  const factors = incident.severity_factors || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
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
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Status: {incident.status}
            </span>
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
              {incident.location} ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
            </span>
            {incident.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {new Date(incident.created_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Description & Image */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {incident.description}
          </div>

          {incident.image_path && (
            <div className="rounded-2xl overflow-hidden border border-slate-700 max-h-64">
              <img
                src={incident.image_path}
                alt="Incident Photo"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* AI Metrics Card */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              DisasterAI Model Intelligence
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">AI Prediction</span>
                <span className="font-bold text-white text-sm">{incident.predicted_category || incident.category}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Confidence</span>
                <span className="font-bold text-blue-400 text-sm">{incident.prediction_confidence}%</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Severity Score</span>
                <span className="font-bold text-amber-400 text-sm">{incident.severity_score}/100</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Affected People</span>
                <span className="font-bold text-white text-sm">~{incident.affected_people || 0}</span>
              </div>
            </div>
          </div>

          {/* Actionable Safety Guidance Checklist */}
          {incident.safety_guidance && (
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Recommended Public Safety Action
                </h4>
                <span className="text-[10px] text-slate-400">Verified Guidelines</span>
              </div>

              {incident.safety_guidance.general_guidance && (
                <div className="text-xs font-semibold text-white bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  {incident.safety_guidance.general_guidance}
                </div>
              )}

              {incident.safety_guidance.action_steps && (
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {incident.safety_guidance.action_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Emergency Helpline Banner */}
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-300">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
              <span>National Distress Center: <strong>Dial 112</strong></span>
            </div>
            <span className="text-[11px] text-red-400/80">Immediate Life Safety Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
