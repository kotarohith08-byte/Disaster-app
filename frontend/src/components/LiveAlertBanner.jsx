import React, { useState } from 'react';
import { AlertTriangle, Bell, BellOff, ExternalLink, ChevronRight, X, Radio } from 'lucide-react';

export default function LiveAlertBanner({ alerts = [], onSelectAlert }) {
  const [closed, setClosed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  if (closed || !alerts || alerts.length === 0) return null;

  const topAlert = alerts[0];

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        new Notification("DisasterAI Alert Service Active", {
          body: "You will receive critical emergency disaster alerts for severe events.",
          icon: "/favicon.svg"
        });
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/40 text-white px-4 py-2 text-xs relative overflow-hidden shadow-lg shadow-red-950/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Alert Ticker */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex-shrink-0">
            <Radio className="w-3 h-3" />
            CRITICAL BROADCAST
          </span>

          <div 
            onClick={() => onSelectAlert && onSelectAlert(topAlert)}
            className="truncate cursor-pointer hover:underline text-slate-200 hover:text-white font-medium flex items-center gap-1.5"
          >
            <span>{topAlert.title}</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              ({topAlert.source} • {topAlert.location})
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-red-400 inline" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notificationsEnabled ? (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 hover:text-white transition-all text-[11px] font-semibold"
            >
              <Bell className="w-3 h-3 text-red-400" />
              <span>Enable Browser Alerts</span>
            </button>
          ) : (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Alerts Enabled
            </span>
          )}

          <button
            onClick={() => setClosed(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Dismiss top banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
