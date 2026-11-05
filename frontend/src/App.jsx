import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LiveAlertBanner from './components/LiveAlertBanner';
import LiveMonitoringDashboard from './components/LiveMonitoringDashboard';
import DisasterMap from './components/DisasterMap';
import LocationMonitor from './components/LocationMonitor';
import AiIntelligenceView from './components/AiIntelligenceView';
import ReportForm from './components/ReportForm';
import AdminDashboard from './components/AdminDashboard';
import SafetyGuide from './components/SafetyGuide';
import AuthModal from './components/AuthModal';
import IncidentDetailModal from './components/IncidentDetailModal';
import { api, getStoredUser } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [user, setUser] = useState(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Real-time live data state
  const [liveData, setLiveData] = useState({ events: [], last_updated: null, status: 'connecting', sources_status: {} });
  const [sourcesHealth, setSourcesHealth] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [communityIncidents, setCommunityIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Real-Time Live Disasters
  const fetchLiveFeeds = useCallback(async (forceRefresh = false) => {
    setIsRefreshing(true);
    try {
      const [disastersRes, alertsRes, communityRes, healthRes] = await Promise.all([
        api.getLiveDisasters({ refresh: forceRefresh }).catch(e => {
          console.error('getLiveDisasters error:', e);
          return { events: [], status: 'degraded' };
        }),
        api.getLiveAlerts().catch(e => {
          console.error('getLiveAlerts error:', e);
          return { alerts: [] };
        }),
        api.getIncidents().catch(e => {
          console.error('getIncidents error:', e);
          return [];
        }),
        api.getSourcesHealth().catch(() => null)
      ]);

      setLiveData({
        events: disastersRes.events || [],
        last_updated: disastersRes.last_updated || new Date().toISOString(),
        status: disastersRes.status || 'online',
        sources_status: disastersRes.sources_status || (healthRes?.sources || {})
      });

      if (healthRes) {
        setSourcesHealth(healthRes);
      }

      setLiveAlerts(alertsRes.alerts || []);
      setCommunityIncidents(communityRes || []);

      // Browser Notification for new Critical Alert if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const crit = (alertsRes.alerts || []).find(a => a.severity === 'CRITICAL');
        if (crit && !sessionStorage.getItem(`notif_${crit.id}`)) {
          sessionStorage.setItem(`notif_${crit.id}`, 'true');
          new Notification(`CRITICAL DISASTER ALERT: ${crit.title}`, {
            body: `${crit.location} (${crit.source})`,
            icon: '/favicon.svg'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching real-time disaster telemetry:', err);
      setLiveData(prev => ({ ...prev, status: 'degraded' }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + Automatic 60-second polling interval
  useEffect(() => {
    fetchLiveFeeds();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchLiveFeeds(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchLiveFeeds]);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    if (activeTab === 'admin') setActiveTab('monitor');
  };

  const handleReportSubmitted = (newIncident) => {
    setCommunityIncidents(prev => [newIncident, ...prev]);
    setActiveTab('map');
  };

  const handleIncidentUpdated = (updated) => {
    setCommunityIncidents(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  const handleIncidentDeleted = (deletedId) => {
    setCommunityIncidents(prev => prev.filter(item => item.id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Critical Alert Ticker */}
      <LiveAlertBanner
        alerts={liveAlerts}
        onSelectAlert={setSelectedIncident}
      />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        liveStatus={liveData.status}
        lastUpdated={liveData.last_updated}
        onRefreshLive={() => fetchLiveFeeds(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {activeTab === 'monitor' && (
          <LiveMonitoringDashboard
            liveData={liveData}
            sourcesHealth={sourcesHealth}
            onSelectEvent={setSelectedIncident}
            onOpenMap={() => setActiveTab('map')}
            onRefresh={() => fetchLiveFeeds(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'map' && (
          <DisasterMap
            liveEvents={liveData.events}
            communityIncidents={communityIncidents}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'location' && (
          <LocationMonitor
            onSelectDisaster={setSelectedIncident}
            liveEvents={liveData.events}
          />
        )}

        {activeTab === 'intelligence' && (
          <AiIntelligenceView
            liveEvents={liveData.events}
          />
        )}

        {activeTab === 'report' && (
          <ReportForm
            onReportSubmitted={handleReportSubmitted}
            user={user}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyGuide />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            incidents={communityIncidents}
            sourcesHealth={sourcesHealth}
            liveData={liveData}
            onIncidentUpdated={handleIncidentUpdated}
            onIncidentDeleted={handleIncidentDeleted}
            onRefreshFeeds={() => fetchLiveFeeds(true)}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Detailed Modal for clicked live/community incident */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* EOC Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b14] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            DisasterAI Real-Time Emergency Operations Platform • Data: USGS Seismology • NASA EONET • GDACS • Open-Meteo
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Continuous Polling Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
