import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  FileText, 
  ArrowRight, 
  Users, 
  HeartHandshake,
  Compass,
  Zap,
  BarChart2,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage({ setActiveTab, analytics, onOpenAuth, user }) {
  const summary = analytics?.summary || {
    total_incidents: 12,
    active_incidents: 5,
    critical_incidents: 3,
    resolved_incidents: 4
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span>AI for Social Good • Capstone AI/ML System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight md:leading-none">
            Intelligent Disaster Response & <br />
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-400 bg-clip-text text-transparent">
              Community Resilience System
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Empowering citizens and response agencies with AI-driven incident classification, 
            rapid severity estimation, geospatial tracking, and verified public safety guidance during emergencies.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-base shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Report an Emergency Incident</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-semibold text-base shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>Open Live Disaster Map</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safety Guidelines</span>
            </button>
          </div>

          {/* Public safety disclaimer pill */}
          <p className="mt-6 text-xs text-slate-500">
            * DisasterAI estimates are powered by NLP classification & heuristic severity metrics. Always follow verified civil defense instructions.
          </p>
        </div>
      </section>

      {/* Disaster Awareness Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Live Situational Awareness Snapshot</h2>
          <p className="text-xs sm:text-sm text-slate-400">Aggregated statistics from community reports and active response stations</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Incidents</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-3">{summary.total_incidents}</div>
            <p className="text-xs text-slate-400 mt-1">Logged across all monitored regions</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Active Incidents</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-3">{summary.active_incidents}</div>
            <p className="text-xs text-slate-400 mt-1">Under active review or field response</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Critical Alerts</span>
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-red-500 mt-3">{summary.critical_incidents}</div>
            <p className="text-xs text-slate-400 mt-1">Severe risk requiring immediate safety action</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Cases</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-3">{summary.resolved_incidents}</div>
            <p className="text-xs text-slate-400 mt-1">Containment confirmed by response teams</p>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Technological Capabilities</div>
          <h2 className="text-3xl font-extrabold text-white">Engineered for Rapid Community Safety</h2>
          <p className="text-slate-400 text-sm mt-3">
            Combining Natural Language Processing, heuristic severity estimation, and GIS mapping to accelerate disaster triage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">NLP Disaster Classification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Converts freeform citizen distress text into TF-IDF vector representations. An optimized Scikit-learn multi-class model 
              predicts disaster categories (Flood, Earthquake, Fire, Cyclone, Landslide) with calibrated confidence percentages.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Factor Severity Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Assesses disaster gravity into LOW, MEDIUM, HIGH, and CRITICAL by synthesizing casualty cues, trapped individual markers, 
              reported population at risk, and critical infrastructure damage levels.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Geospatial GIS Map</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Integrates Leaflet.js with OpenStreetMap to pinpoint verified incident coordinates. Severity color-coded markers 
              enable immediate regional awareness and spatial distribution analysis.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Actionable Safety Guidance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provides step-by-step public safety actions aligned with official disaster management protocols (NDRF/FEMA), 
              ensuring citizens receive verified life-saving instructions during high-stress crises.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Operational Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Interactive visualization dashboards track monthly trends, category frequency, and response resolution velocity. 
              Offers one-click CSV export for downstream reporting and research analysis.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Triage Portal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Secure authentication with JWT tokens enables dual-perspective usage: community citizens submit verified reports, 
              while emergency administrators review, adjust severity, and mark resolved incidents.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How DisasterAI Works</h2>
            <p className="text-slate-400 text-sm mt-2">
              From citizen distress report to actionable response in 4 systematic steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto text-lg font-bold">
                1
              </div>
              <h4 className="text-base font-semibold text-white">Report & Geotag</h4>
              <p className="text-xs text-slate-400">
                Citizen submits disaster details, location coordinates, and optional photographic proof.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-lg font-bold">
                2
              </div>
              <h4 className="text-base font-semibold text-white">AI NLP & Severity</h4>
              <p className="text-xs text-slate-400">
                Machine learning model predicts disaster category and rule engine calculates risk level.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-lg font-bold">
                3
              </div>
              <h4 className="text-base font-semibold text-white">Spatial Map Triage</h4>
              <p className="text-xs text-slate-400">
                Incident immediately renders onto live Leaflet OpenStreetMap with severity color-coding.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-lg font-bold">
                4
              </div>
              <h4 className="text-base font-semibold text-white">Public Safety Action</h4>
              <p className="text-xs text-slate-400">
                Citizens receive tailored safety checklists while administrators coordinate verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Preparedness Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Universal Emergency Preparedness</h2>
          <p className="text-sm text-slate-400">Essential precautions recommended before, during, and after disasters</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3 text-blue-400">
              🎒 Emergency Go-Bag Essentials
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>3-day supply of drinking water (3 liters/person/day)</li>
              <li>Non-perishable high-protein foods & energy bars</li>
              <li>First-aid kit with essential prescription medications</li>
              <li>LED flashlight, battery-powered radio, and power bank</li>
              <li>Photocopies of vital IDs and insurance documents</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3 text-amber-400">
              📞 Emergency Communications Plan
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Designate an out-of-town relative as unified contact</li>
              <li>Memorize national distress numbers (112 / 1070)</li>
              <li>Use SMS/text instead of voice calls during network congestion</li>
              <li>Agree upon two physical family meeting spots (home & neighborhood)</li>
              <li>Keep phone on battery-saver mode during power blackouts</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3 text-emerald-400">
              🛡️ Immediate Action Priorities
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Identify home utility shutoffs for electricity, gas, and water</li>
              <li>Never attempt to walk, swim, or drive through moving water</li>
              <li>During earthquakes: Drop, Cover, and Hold under sturdy desks</li>
              <li>Follow official civil defense evacuation instructions without delay</li>
              <li>Check in on elderly neighbors and assist persons with disabilities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer info banner */}
      <div className="max-w-5xl mx-auto px-4 text-center border-t border-slate-800 pt-8 text-xs text-slate-500">
        DisasterAI — Intelligent Disaster Response & Management System • Built with React, Flask, Scikit-Learn NLP, and OpenStreetMap.
      </div>
    </div>
  );
}
