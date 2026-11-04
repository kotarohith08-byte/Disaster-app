import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Info,
  Maximize2
} from 'lucide-react';

// Create custom SVG Leaflet Marker based on Severity
const createSeverityIcon = (severity, category) => {
  const colors = {
    CRITICAL: { bg: '#ef4444', border: '#7f1d1d', pulse: '#fca5a5' },
    HIGH: { bg: '#f97316', border: '#7c2d12', pulse: '#fdba74' },
    MEDIUM: { bg: '#eab308', border: '#713f12', pulse: '#fef08a' },
    LOW: { bg: '#3b82f6', border: '#1e3a8a', pulse: '#93c5fd' },
  };

  const c = colors[severity] || colors.MEDIUM;
  const isCritical = severity === 'CRITICAL';

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      ${isCritical ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${c.bg}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${c.bg}; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 10;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-disaster-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

function ChangeMapView({ coords }) {
  const map = useMap();
  if (coords) {
    map.setView(coords, map.getZoom());
  }
  return null;
}

export default function DisasterMap({ incidents = [], onSelectIncident }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCenter, setActiveCenter] = useState(null);

  const categories = ['All', 'Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Other'];
  const severities = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses = ['All', 'Active', 'Under Review', 'Verified', 'Resolved'];

  // Filtered incidents
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchCat = selectedCategory === 'All' || inc.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSev = selectedSeverity === 'All' || inc.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'All' || inc.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchSearch = !searchQuery || 
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSev && matchStatus;
    });
  }, [incidents, selectedCategory, selectedSeverity, selectedStatus, searchQuery]);

  // Default center: India/Central Asia or first incident's coords
  const mapCenter = useMemo(() => {
    if (filtered.length > 0) {
      return [filtered[0].latitude, filtered[0].longitude];
    }
    return [20.5937, 78.9629]; // Default Central coords
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-red-500" />
              Live Interactive Disaster Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Visualizing {filtered.length} of {incidents.length} reported incidents with geospatial severity indicators
            </p>
          </div>

          {/* Demonstration Notice Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Map markers include academic demonstration records to showcase spatial classification.</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {severities.map((s) => (
                <option key={s} value={s}>Severity: {s}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>Status: {st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Severity Indicators:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500/50" />
            <span className="text-red-400 font-semibold">CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            <span className="text-orange-400 font-semibold">HIGH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-400 font-semibold">MEDIUM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="text-blue-400 font-semibold">LOW</span>
          </div>
        </div>
      </div>

      {/* Map Canvas and Side list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 h-[560px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <MapContainer
            center={mapCenter}
            zoom={5}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            {activeCenter && <ChangeMapView coords={activeCenter} />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filtered.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={createSeverityIcon(inc.severity, inc.category)}
              >
                <Popup className="disaster-custom-popup">
                  <div className="p-1 space-y-2 max-w-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {inc.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                        inc.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                        inc.severity === 'MEDIUM' ? 'bg-amber-500 text-slate-900 font-bold' :
                        'bg-blue-500 text-white'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white leading-snug">{inc.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{inc.description}</p>

                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-700/60">
                      <div>📍 {inc.location}</div>
                      <div>👥 People Affected: ~{inc.affected_people || 0}</div>
                      <div>🤖 AI Confidence: {inc.prediction_confidence}%</div>
                    </div>

                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      View Safety Guidance & Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Incident List */}
        <div className="h-[560px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Incidents In View ({filtered.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click to focus map</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No incidents match the active search and filter criteria.
              </div>
            ) : (
              filtered.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    setActiveCenter([inc.latitude, inc.longitude]);
                  }}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {inc.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {inc.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="truncate max-w-[140px]">📍 {inc.location}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Details & Recs →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
