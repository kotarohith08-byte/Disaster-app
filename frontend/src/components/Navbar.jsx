import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  FilePlus, 
  Radio, 
  BookOpen, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  User, 
  Menu, 
  X,
  PhoneCall,
  RefreshCw,
  Compass,
  Cpu,
  Activity
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenAuth, 
  onLogout,
  liveStatus = 'online',
  lastUpdated,
  onRefreshLive,
  isRefreshing = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        const diff = Math.max(0, Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000));
        setSecondsAgo(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const navItems = [
    { id: 'monitor', label: 'Live EOC Monitor', icon: Activity, live: true },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'location', label: 'Location Watch', icon: Compass },
    { id: 'intelligence', label: 'AI Intelligence', icon: Cpu },
    { id: 'report', label: 'Report Emergency', icon: FilePlus, highlight: true },
    { id: 'safety', label: 'Safety Guidelines', icon: BookOpen },
    { id: 'admin', label: 'Admin Portal', icon: LayoutDashboard },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Emergency Distress Ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 mx-auto">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Official Emergency Helplines: <strong>112</strong> (Unified National) | <strong>1070</strong> (State Disaster Relief) | <strong>108</strong> (Ambulance)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => handleNavClick('monitor')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-amber-500 to-blue-600 p-0.5 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">Disaster<span className="text-red-500">AI</span></span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  LIVE EOC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">USGS • NASA EONET • GDACS • Open-Meteo</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.adminOnly && user?.role !== 'admin') return null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.highlight 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                      : isActive
                        ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-white' : isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live Status Indicator & Refresh */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <span className={`w-2 h-2 rounded-full ${liveStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-bold text-slate-300">
                {liveStatus === 'online' ? 'FEEDS ONLINE' : 'DEGRADED'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
              </span>
              {onRefreshLive && (
                <button
                  onClick={onRefreshLive}
                  disabled={isRefreshing}
                  title="Force refresh live feeds"
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                </button>
              )}
            </div>

            {/* User Control */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1 shadow-sm">
                <div className="text-left">
                  <div className="text-[11px] font-bold text-white leading-tight">{user.name}</div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded ${
                    user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {onRefreshLive && (
              <button
                onClick={onRefreshLive}
                disabled={isRefreshing}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f1d] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold text-left ${
                  isActive ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-300">{user.name} ({user.role})</span>
                <button onClick={onLogout} className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="w-full py-2 bg-blue-600 rounded-lg text-xs text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Demo
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
