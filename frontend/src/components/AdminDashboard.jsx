import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Check, 
  X, 
  Lock, 
  FileText,
  Filter,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';

export default function AdminDashboard({ 
  incidents = [], 
  onIncidentUpdated, 
  onIncidentDeleted, 
  user, 
  onOpenAuth 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingIncident, setEditingIncident] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Access check
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Administrator Access Required</h2>
        <p className="text-sm text-slate-400">
          The operational incident triage console is reserved for verified disaster management personnel.
        </p>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300">
          You can test all administrative controls by signing in with the pre-configured administrator demo credentials.
        </div>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  // Filtered incidents
  const filtered = incidents.filter((inc) => {
    const matchSev = filterSeverity === 'All' || inc.severity === filterSeverity;
    const matchStat = filterStatus === 'All' || inc.status === filterStatus;
    const matchSearch = !searchTerm || 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSev && matchStat && matchSearch;
  });

  const total = incidents.length;
  const active = incidents.filter(i => ['Active', 'Under Review'].includes(i.status)).length;
  const critical = incidents.filter(i => i.severity === 'CRITICAL').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  const handleStartEdit = (inc) => {
    setEditingIncident(inc);
    setEditStatus(inc.status);
    setEditSeverity(inc.severity);
    setEditNotes(inc.admin_notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingIncident) return;
    setLoadingAction(true);
    setActionMessage('');
    try {
      const res = await api.updateIncident(editingIncident.id, {
        status: editStatus,
        severity: editSeverity,
        admin_notes: editNotes
      });
      onIncidentUpdated(res.incident);
      setEditingIncident(null);
      setActionMessage(`Incident #${editingIncident.id} updated successfully.`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update incident');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete incident #${id}?`)) return;
    setLoadingAction(true);
    try {
      await api.deleteIncident(id);
      onIncidentDeleted(id);
      setActionMessage(`Incident #${id} removed.`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleQuickStatus = async (inc, newStatus) => {
    try {
      const res = await api.updateIncident(inc.id, { status: newStatus });
      onIncidentUpdated(res.incident);
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Incident Response Command Center</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as {user.name} ({user.email}) • Full incident audit and verification privileges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Incident Data (CSV)</span>
          </a>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Incidents</span>
          <div className="text-3xl font-black text-white mt-2">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged across all regions</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Active / Under Review</span>
          <div className="text-3xl font-black text-amber-400 mt-2">{active}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requiring responder allocation</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Critical Priority</span>
          <div className="text-3xl font-black text-red-500 mt-2">{critical}</div>
          <div className="text-[11px] text-slate-500 mt-1">Urgent safety intervention</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{resolved}</div>
          <div className="text-[11px] text-slate-500 mt-1">Threat mitigated successfully</div>
        </div>
      </div>

      {/* Incident Management Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Incident Triage & Verification Table ({filtered.length})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search table..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title & Location</th>
                <th className="py-3 px-4">Category & AI</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No incidents found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{inc.id}
                      {inc.is_demo && (
                        <span className="block text-[9px] text-amber-500/80 uppercase">Demo</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">📍 {inc.location}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
                        {inc.category}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        AI: {inc.prediction_confidence}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Score: {inc.severity_score}/100
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      <div>👥 ~{inc.affected_people || 0} people</div>
                      <div className="text-slate-400 mt-0.5">Infra: {inc.infrastructure_damage || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        inc.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        inc.status === 'Verified' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        inc.status === 'Under Review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {inc.status !== 'Verified' && inc.status !== 'Resolved' && (
                        <button
                          onClick={() => handleQuickStatus(inc, 'Verified')}
                          title="Verify Incident"
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {inc.status !== 'Resolved' && (
                        <button
                          onClick={() => handleQuickStatus(inc, 'Resolved')}
                          title="Mark Resolved"
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEdit(inc)}
                        title="Edit Details / Status"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(inc.id)}
                        title="Delete Inappropriate"
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Incident Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Review & Triage Incident #{editingIncident.id}
              </h3>
              <button
                onClick={() => setEditingIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              <strong className="text-white">{editingIncident.title}</strong>
              <p className="mt-1">{editingIncident.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjust Operational Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjust Severity Rating
                </label>
                <select
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrative Operational Notes
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log field team dispatch, relief distribution, or notes..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30"
              >
                {loadingAction ? 'Saving...' : 'Save Incident Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
