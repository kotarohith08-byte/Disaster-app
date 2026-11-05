import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Radio, 
  Flame, 
  Waves, 
  Wind, 
  Mountain, 
  ExternalLink, 
  Clock, 
  Globe2, 
  ShieldAlert, 
  TrendingUp, 
  Compass, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function LiveMonitoringDashboard({ 
  liveData, 
  onSelectEvent, 
  onOpenMap, 
  onRefresh, 
  isRefreshing 
}) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('all'); // 'all' or 'india'
  const [searchTerm, setSearchTerm] = useState('');

  const events = liveData?.events || [];
  const sourcesStatus = liveData?.sources_status || {};

  // Filtered live events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchRegion = regionFilter === 'all' || (regionFilter === 'india' && e.is_in_india);
      const matchCat = selectedFilter === 'All' || e.category.toLowerCase() === selectedFilter.toLowerCase();
      const matchSearch = !searchTerm || 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRegion && matchCat && matchSearch;
    });
  }, [events, selectedFilter, regionFilter, searchTerm]);

  // Derived real stats from actual data
  const totalMonitored = events.length;
  const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
  const highCount = events.filter(e => e.severity === 'HIGH').length;
  const quakesCount = events.filter(e => e.category === 'Earthquake').length;
  const firesCount = events.filter(e => e.category === 'Fire').length;
  const stormsCount = events.filter(e => e.category === 'Cyclone').length;
  const floodsCount = events.filter(e => e.category === 'Flood').length;
  const indiaCount = events.filter(e => e.is_in_india).length;

  // Chart 1: Magnitude distribution of live earthquakes
  const magBrackets = [
    { name: 'M 2.5–3.9', count: 0, fill: '#38bdf8' },
    { name: 'M 4.0–4.9', count: 0, fill: '#eab308' },
    { name: 'M 5.0–5.9', count: 0, fill: '#f97316' },
    { name: 'M 6.0–6.9', count: 0, fill: '#ef4444' },
    { name: 'M 7.0+', count: 0, fill: '#dc2626' }
  ];
  events.filter(e => e.category === 'Earthquake' && e.magnitude).forEach(q => {
    const m = q.magnitude;
    if (m >= 7.0) magBrackets[4].count++;
    else if (m >= 6.0) magBrackets[3].count++;
    else if (m >= 5.0) magBrackets[2].count++;
    else if (m >= 4.0) magBrackets[1].count++;
    else magBrackets[0].count++;
  });

  // Chart 2: Category breakdown from actual live data
  const categoryData = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const c = e.category || 'Other';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [events]);

  const CATEGORY_COLORS = ['#38bdf8', '#f97316', '#ef4444', '#10b981', '#a855f7', '#eab308'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Real-Time EOC Ops Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1627] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Live Sensor Telemetry Array • Continuous Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Real-Time Global Disaster Operations Center
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Continuous live event streaming from USGS Seismology, NASA EONET Satellites, GDACS Global Alerts, and Open-Meteo Atmospheric Sensors.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setRegionFilter(regionFilter === 'all' ? 'india' : 'all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                regionFilter === 'india' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>{regionFilter === 'india' ? '🇮🇳 India Focus Active' : 'Show India Region Only'}</span>
            </button>

            <button
              onClick={onOpenMap}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>View On Live Map</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Refresh Feeds Now"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Source Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Monitored Feeds:</span>
          {Object.entries(sourcesStatus).map(([src, stat]) => (
            <div key={src} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">{src}:</span>
              <span className="text-slate-400">{stat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Row (ACTUAL LIVE COUNTS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monitored</div>
          <div className="text-2xl font-black text-white mt-1">{totalMonitored}</div>
          <div className="text-[10px] text-slate-500">Live events</div>
        </div>

        <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Critical Priority</div>
          <div className="text-2xl font-black text-red-500 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-red-400/80">Immediate threat</div>
        </div>

        <div className="bg-slate-900/80 border border-orange-500/30 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">High Risk Alerts</div>
          <div className="text-2xl font-black text-orange-400 mt-1">{highCount}</div>
          <div className="text-[10px] text-slate-500">Significant danger</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Live Earthquakes</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{quakesCount}</div>
          <div className="text-[10px] text-slate-500">USGS 24h feed</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Active Wildfires</div>
          <div className="text-2xl font-black text-red-400 mt-1">{firesCount}</div>
          <div className="text-[10px] text-slate-500">NASA Satellite</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Cyclones / Storms</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{stormsCount}</div>
          <div className="text-[10px] text-slate-500">Tropical basins</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">India Events</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{indiaCount}</div>
          <div className="text-[10px] text-slate-500">In Indian bounds</div>
        </div>
      </div>

      {/* Real-time Charts based on Actual Retrieved Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Earthquake Magnitude Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Live Earthquakes by Magnitude Range (USGS Live Data)
            </h3>
            <span className="text-[10px] text-slate-400">{quakesCount} earthquakes</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={magBrackets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {magBrackets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Disasters by Category */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Active Natural Events Breakdown (NASA + GDACS + USGS)
            </h3>
            <span className="text-[10px] text-slate-400">{events.length} total events</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Disasters Feed Table & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              Live Events Stream ({filteredEvents.length} events)
            </h3>
            <p className="text-xs text-slate-400">Click any row to view complete details, coordinates, and official advisory links</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search location, source..."
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Earthquake">Earthquakes</option>
              <option value="Fire">Wildfires</option>
              <option value="Cyclone">Cyclones & Storms</option>
              <option value="Flood">Floods</option>
              <option value="Other">Other Hazards</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/90 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Event & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity & Intensity</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4 text-right">Official Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No active events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 50).map((ev) => (
                  <tr 
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate flex items-center gap-1.5">
                        {ev.verified_warning && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                        )}
                        <span>{ev.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">📍 {ev.location}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {ev.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        ev.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                        ev.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                        ev.severity === 'MEDIUM' ? 'bg-amber-500 text-slate-900' :
                        'bg-blue-500 text-white'
                      }`}>
                        {ev.severity}
                      </span>
                      {ev.magnitude && (
                        <span className="ml-1.5 font-mono text-amber-300 font-bold">
                          M {ev.magnitude}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {ev.latitude.toFixed(2)}°, {ev.longitude.toFixed(2)}°
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {ev.event_time ? new Date(ev.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {ev.source.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {ev.source_url && (
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
