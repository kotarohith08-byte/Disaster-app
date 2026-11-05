import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  CloudRain, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';

export default function LocationMonitor({ onSelectDisaster, liveEvents = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Selected location (defaults to New Delhi, India)
  const [selectedLoc, setSelectedLoc] = useState({
    name: 'New Delhi',
    label: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [radiusKm, setRadiusKm] = useState(1000);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  // Popular quick city buttons
  const quickLocations = [
    { name: 'New Delhi', label: 'New Delhi, India', latitude: 28.6139, longitude: 77.2090 },
    { name: 'Mumbai', label: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777 },
    { name: 'Kolkata', label: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639 },
    { name: 'Tokyo', label: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'San Francisco', label: 'San Francisco, USA', latitude: 37.7749, longitude: -122.4194 },
    { name: 'Jakarta', label: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 }
  ];

  // Fetch weather and nearby disasters whenever selectedLoc changes
  useEffect(() => {
    if (!selectedLoc) return;
    loadLocalData(selectedLoc.latitude, selectedLoc.longitude);
  }, [selectedLoc, radiusKm]);

  const loadLocalData = async (lat, lng) => {
    setLoadingWeather(true);
    try {
      const w = await api.getLiveWeather(lat, lng);
      setWeatherData(w);

      // Compute nearby disasters using Haversine
      const withDistance = liveEvents.map(e => {
        const d = calculateDistance(lat, lng, e.latitude, e.longitude);
        return { ...e, distance_km: Math.round(d) };
      }).filter(e => e.distance_km <= radiusKm);

      withDistance.sort((a, b) => a.distance_km - b.distance_km);
      setNearbyEvents(withDistance);
    } catch (e) {
      console.warn('Local data load error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.geocodeLocation(searchQuery);
      setSearchResults(res.results || []);
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLoc({
          name: 'Your Current GPS Location',
          label: `GPS Position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        alert('Permission denied or location unavailable: ' + err.message);
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-blue-400" />
              Regional & Location-Based Disaster Watch
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your city or GPS location to inspect live weather hazards and detect nearby active disaster events.
            </p>
          </div>

          <button
            onClick={handleUseGPS}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all self-start md:self-auto"
          >
            <MapPin className="w-4 h-4" />
            <span>Use My GPS Location</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any city or region worldwide (e.g. Tokyo, Chennai, Los Angeles)..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white transition-colors"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-2 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Select Matched Location:</span>
            {searchResults.map((loc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedLoc(loc);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-slate-700/80 rounded-xl cursor-pointer text-xs text-white flex items-center justify-between"
              >
                <span>{loc.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-400">Quick Watch:</span>
          {quickLocations.map((q) => (
            <button
              key={q.name}
              onClick={() => setSelectedLoc(q)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedLoc.name === q.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Location Overview & Weather Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weather Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Atmospheric Sensor Feed</span>
              <h3 className="text-lg font-bold text-white">{selectedLoc.name}</h3>
              <p className="text-[11px] text-slate-400">{selectedLoc.label}</p>
            </div>
            <div className="text-right font-mono text-2xl font-black text-amber-400">
              {weatherData?.temperature !== undefined ? `${weatherData.temperature}°C` : '--'}
            </div>
          </div>

          {loadingWeather ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Streaming atmospheric sensors...</span>
            </div>
          ) : weatherData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Condition</div>
                  <div className="font-bold text-white mt-0.5">{weatherData.condition}</div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Relative Humidity</div>
                  <div className="font-bold text-white mt-0.5">{weatherData.humidity}%</div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Sustained Wind</div>
                  <div className="font-bold text-white mt-0.5">{weatherData.wind_speed} km/h</div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Peak Gusts</div>
                  <div className="font-bold text-amber-300 mt-0.5">{weatherData.wind_gusts} km/h</div>
                </div>
              </div>

              {/* Weather Hazard Warnings */}
              {weatherData.hazards && weatherData.hazards.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Atmospheric Hazard Detected
                  </div>
                  {weatherData.hazards.map((h, i) => (
                    <div key={i} className="text-xs text-slate-200">
                      <strong>{h.type}:</strong> {h.msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Weather data unavailable for this coordinate.</div>
          )}
        </div>

        {/* Nearby Active Disaster Alerts within Radius */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Active Disasters Detected Near {selectedLoc.name} ({nearbyEvents.length})
              </h3>
              <p className="text-xs text-slate-400">Events within chosen radius from live USGS, NASA, and GDACS feeds</p>
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-[11px] text-slate-400">Radius:</span>
              {[500, 1000, 2500].map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    radiusKm === r ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {nearbyEvents.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span className="text-slate-300 font-semibold">No severe disasters currently reported within {radiusKm} km of {selectedLoc.name}.</span>
                <span className="text-[11px] text-slate-500">Increase search radius to inspect broader regional activity.</span>
              </div>
            ) : (
              nearbyEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => onSelectDisaster(ev)}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        ev.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        ev.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ev.severity}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{ev.category}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 rounded">
                        ~{ev.distance_km} km away
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {ev.title}
                    </h4>

                    <div className="text-[11px] text-slate-400">
                      📍 {ev.location} • Source: {ev.source}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDisaster(ev);
                    }}
                    className="self-end sm:self-center text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
