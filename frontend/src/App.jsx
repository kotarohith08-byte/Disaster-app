import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DisasterMap from './components/DisasterMap';
import ReportForm from './components/ReportForm';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsView from './components/AnalyticsView';
import SafetyGuide from './components/SafetyGuide';
import AuthModal from './components/AuthModal';
import IncidentDetailModal from './components/IncidentDetailModal';
import { api, getStoredUser } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    try {
      const [incidentsData, analyticsData] = await Promise.all([
        api.getIncidents(),
        api.getAnalytics()
      ]);
      setIncidents(incidentsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading DisasterAI platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    if (activeTab === 'admin') setActiveTab('home');
  };

  const handleReportSubmitted = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    loadData();
    // Switch to map to view the new incident
    setActiveTab('map');
  };

  const handleIncidentUpdated = (updated) => {
    setIncidents((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    loadData();
  };

  const handleIncidentDeleted = (deletedId) => {
    setIncidents((prev) => prev.filter((item) => item.id !== deletedId));
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            setActiveTab={setActiveTab}
            analytics={analytics}
            onOpenAuth={() => setAuthModalOpen(true)}
            user={user}
          />
        )}

        {activeTab === 'map' && (
          <DisasterMap
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
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

        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            incidents={incidents}
            onIncidentUpdated={handleIncidentUpdated}
            onIncidentDeleted={handleIncidentDeleted}
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

      {/* Detailed Incident Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
