import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  Globe2, 
  Radio, 
  Layers, 
  BookOpen,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';

export default function AiIntelligenceView({ liveEvents = [] }) {
  const [region, setRegion] = useState('global');
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState(null);

  const fetchAiReport = async () => {
    setLoading(true);
    try {
      const data = await api.getAiIntelligence(region);
      setIntelligence(data);
    } catch (e) {
      console.warn('AI analysis load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReport();
  }, [region]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Machine Intelligence & Disaster Analytics Module
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            AI-Powered Disaster Intelligence & Impact Briefing
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Algorithmic synthesis of multi-sensor live streams (USGS, NASA EONET, GDACS) to identify compounding hazards, potential impact, and priority safety recommendations.
          </p>
        </div>

        {/* Region toggles & refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setRegion('global')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                region === 'global' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global Array
            </button>
            <button
              onClick={() => setRegion('india')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                region === 'india' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India Focus
            </button>
          </div>

          <button
            onClick={fetchAiReport}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Re-synthesize AI Report"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <div className="text-sm font-bold text-white">Synthesizing Real-Time Telemetry...</div>
          <div className="text-xs text-slate-500">Evaluating seismic vectors, wildfire perimeters, and atmospheric depressions</div>
        </div>
      ) : intelligence ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Executive Situational Assessment ({region.toUpperCase()})
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                {intelligence.engine_mode || 'DisasterAI Neural Engine'}
              </span>
            </div>

            <p className="text-base text-slate-200 leading-relaxed font-medium">
              {intelligence.executive_summary}
            </p>
          </div>

          {/* Impact and Patterns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Impact Assessment */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Vulnerability & Potential Impact Analysis
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {intelligence.potential_impact}
              </p>
            </div>

            {/* Pattern Analysis */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 text-blue-400">
                <TrendingUp className="w-4 h-4" />
                Cross-Event Geographic & Atmospheric Patterns
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {intelligence.pattern_analysis}
              </p>
            </div>
          </div>

          {/* Actionable Safety Protocols */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                AI-Formulated Life Safety Recommendations
              </h3>
              <span className="text-[10px] text-slate-500">Citizen & Responder Directives</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {intelligence.safety_recommendations?.map((rec, i) => (
                <div key={i} className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-200 leading-relaxed font-medium">
                    {rec}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Safety Disclaimer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-slate-400 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Strict Advisory Notice:</strong> {intelligence.disclaimer || "AI-generated analysis does not replace official emergency services."}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
