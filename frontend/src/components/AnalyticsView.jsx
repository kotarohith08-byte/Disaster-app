import React from 'react';
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
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { BarChart3, Download, TrendingUp, AlertTriangle, PieChart as PieIcon, Shield } from 'lucide-react';
import { api } from '../api/client';

export default function AnalyticsView({ analytics }) {
  const summary = analytics?.summary || {
    total_incidents: 12,
    active_incidents: 5,
    critical_incidents: 3,
    resolved_incidents: 4
  };

  const categoryData = analytics?.category_distribution || [
    { name: 'Flood', count: 4 },
    { name: 'Earthquake', count: 2 },
    { name: 'Fire', count: 3 },
    { name: 'Cyclone', count: 2 },
    { name: 'Landslide', count: 2 },
    { name: 'Other', count: 1 }
  ];

  const severityData = analytics?.severity_distribution || [
    { name: 'CRITICAL', count: 3, color: '#ef4444' },
    { name: 'HIGH', count: 4, color: '#f97316' },
    { name: 'MEDIUM', count: 3, color: '#eab308' },
    { name: 'LOW', count: 2, color: '#3b82f6' }
  ];

  const statusData = analytics?.status_distribution || [
    { name: 'Active', count: 5 },
    { name: 'Under Review', count: 1 },
    { name: 'Verified', count: 2 },
    { name: 'Resolved', count: 4 }
  ];

  const monthlyTrends = analytics?.monthly_trends || [
    { month: 'Jun', total: 8, active: 3, resolved: 5 },
    { month: 'Jul', total: 14, active: 6, resolved: 8 },
    { month: 'Aug', total: 19, active: 9, resolved: 10 },
    { month: 'Sep', total: 11, active: 4, resolved: 7 },
    { month: 'Oct', total: 16, active: 7, resolved: 9 },
    { month: 'Nov', total: 12, active: 5, resolved: 4 }
  ];

  const STATUS_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Disaster Intelligence & Analytics</h1>
            <p className="text-xs text-slate-400">Statistical patterns, category distributions, and response trends</p>
          </div>
        </div>

        <a
          href={api.getExportCsvUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </a>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Logged</div>
          <div className="text-3xl font-black text-white mt-2">{summary.total_incidents}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-amber-400 uppercase">Active Emergencies</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{summary.active_incidents}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-red-400 uppercase">Critical Severity</div>
          <div className="text-3xl font-black text-red-500 mt-2">{summary.critical_incidents}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-emerald-400 uppercase">Resolved Situations</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{summary.resolved_incidents}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Incidents by Disaster Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Severity Level Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            Incident Resolution Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Incident Trend Area Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Monthly Incident & Resolution Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="Total Reports" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved Cases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
