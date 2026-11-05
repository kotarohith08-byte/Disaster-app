import React, { useState, useMemo, useEffect } from 'react';
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
  Globe2,
  ExternalLink,
  Flame,
  Radio,
  Activity,
  Waves,
  Wind
} from 'lucide-react';

// Custom Leaflet DivIcon for Live Events based on Category & Severity
const createCustomDisasterIcon = (category, severity, isLive = true) => {
  const colors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#38bdf8'
  };
  const color = colors[severity] || colors.MEDIUM;
  const isCritical = severity === 'CRITICAL';

  let symbol = '⚠️';
  if (category === 'Earthquake') symbol = '⚡';
  else if (category === 'Fire') symbol = '🔥';
  else if (category === 'Cyclone') symbol = '🌀';
  else if (category === 'Flood') symbol = '🌊';
  else if (category === 'Landslide') symbol = '⛰️';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${isCritical ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; font-size: 13px; z-index: 10;">
        ${symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-disaster-leaflet-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 5);
    }
  }, [center, zoom, map]);
  return null;
}

export default function DisasterMap({ 
  liveEvents = [], 
  communityIncidents = [], 
  onSelectIncident,
  initialRegion = 'global'
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'live', 'community'
  const [regionMode, setRegionMode] = useState(initialRegion); // 'global' or 'india'
  const [searchQuery, setSearchQuery] = useState('');
  const [targetView, setTargetView] = useState({ center: [20.0, 10.0], zoom: 2 });

  const categories = ['All', 'Earthquake', 'Fire', 'Cyclone', 'Flood', 'Landslide', 'Other'];
  const severities = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  // Switch between Global and India view
  const handleToggleRegion = (mode) => {
    setRegionMode(mode);
    if (mode === 'india') {
      setTargetView({ center: [22.0, 79.0], zoom: 5 });
    } else {
      setTargetView({ center: [20.0, 10.0], zoom: 2 });
    }
  };

  // Combine live telemetry events + community incidents
  const allEvents = useMemo(() => {
    const liveItems = liveEvents.map(e => ({ ...e, event_type: 'live' }));
    const communityItems = communityIncidents.map(e => ({ 
      ...e, 
      event_type: 'community',
      source: e.is_demo ? 'Community Report (Demo)' : 'Verified Citizen Report'
    }));
    return [...liveItems, ...communityItems];
  }, [liveEvents, communityIncidents]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return allEvents.filter(ev => {
      // Region filter
      if (regionMode === 'india' && !ev.is_in_india) return false;

      // Source filter
      if (sourceFilter === 'live' && ev.event_type !== 'live') return false;
      if (sourceFilter === 'community' && ev.event_type !== 'community') return false;

      // Category filter
      if (selectedCategory !== 'All' && ev.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

      // Severity filter
      if (selectedSeverity !== 'All' && ev.severity !== selectedSeverity) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (ev.title || '').toLowerCase().includes(q);
        const matchLoc = (ev.location || '').toLowerCase().includes(q);
        const matchSrc = (ev.source || '').toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchSrc) return false;
      }

      return true;
    });
  }, [allEvents, regionMode, sourceFilter, selectedCategory, selectedSeverity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Control Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-500" />
                Interactive Live Disaster GIS Map
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Plotting {filtered.length} active global & regional incidents from USGS, NASA EONET, GDACS, and Community Feeds.
            </p>
          </div>

          {/* Region Switcher: Global vs India */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                onClick={() => handleToggleRegion('global')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  regionMode === 'global' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌍 Global View
              </button>
              <button
                onClick={() => handleToggleRegion('india')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  regionMode === 'india' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇮🇳 India View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, source, title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>Severity: {s}</option>
            ))}
          </select>

          {/* Source Layer Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Sources: All Layers</option>
            <option value="live">Sources: Live Sensors (USGS/NASA/GDACS)</option>
            <option value="community">Sources: Community Reports</option>
          </select>
        </div>

        {/* Severity Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Severity Codes:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="text-red-400 font-bold">CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span className="text-orange-400 font-bold">HIGH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-400 font-bold">MEDIUM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            <span className="text-blue-400 font-bold">LOW</span>
          </div>
        </div>
      </div>

      {/* Map Canvas and Side list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 h-[600px] rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <MapContainer
            center={targetView.center}
            zoom={targetView.zoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeMapView center={targetView.center} zoom={targetView.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filtered.map((ev) => (
              <Marker
                key={ev.id}
                position={[ev.latitude, ev.longitude]}
                icon={createCustomDisasterIcon(ev.category, ev.severity, ev.is_live)}
              >
                <Popup className="disaster-custom-popup">
                  <div className="p-1 space-y-2 max-w-xs text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {ev.category}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        ev.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                        ev.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                        ev.severity === 'MEDIUM' ? 'bg-amber-500 text-slate-900' :
                        'bg-blue-500 text-white'
                      }`}>
                        {ev.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white leading-snug">{ev.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-3">{ev.description}</p>

                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-700/60">
                      <div>📍 {ev.location}</div>
                      <div>📡 Source: <strong className="text-slate-300">{ev.source}</strong></div>
                      {ev.magnitude && <div>⚡ Magnitude: <strong className="text-amber-400">M {ev.magnitude}</strong> (Depth: {ev.depth_km} km)</div>}
                      {ev.event_time && <div>🕒 Time: {new Date(ev.event_time).toLocaleString()}</div>}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onSelectIncident(ev)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Inspect Details
                      </button>

                      {ev.source_url && (
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                          title="Open official bulletin"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar List */}
        <div className="h-[600px] bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Active Incidents In View ({filtered.length})
            </h3>
            <span className="text-[10px] text-slate-500">Click to focus</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                No active disaster incidents match the search criteria.
              </div>
            ) : (
              filtered.slice(0, 80).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setTargetView({ center: [ev.latitude, ev.longitude], zoom: 7 });
                  }}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-2xl cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-blue-400">
                      {ev.category}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      ev.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      ev.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      ev.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {ev.severity}
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {ev.title}
                  </h5>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="truncate max-w-[150px]">📍 {ev.location}</span>
                    <span className="text-slate-500">{ev.source.split(' ')[0]}</span>
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
