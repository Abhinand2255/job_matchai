import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  ClipboardList,
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
  Legend,
} from 'recharts';

const StatCard = ({ label, value, color, icon: Icon, sublabel }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0 text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/analytics/admin/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load administrator metrics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      </div>
    );
  }

  const pieData = (data?.application_status_breakdown || []).filter((d) => d.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-700" /> Platform Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform overview, user growth, recruitment funnels, and moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-slate-500" /> Manage Users
          </Link>
          <Link
            to="/admin/jobs"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Briefcase className="w-4 h-4" /> Moderate Jobs
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Users"
          value={data?.total_users}
          icon={Users}
          color="bg-slate-900"
          sublabel={`+${data?.registrations_last_30_days || 0} last 30d`}
        />
        <StatCard
          label="Candidates"
          value={data?.total_candidates}
          icon={UserCheck}
          color="bg-blue-600"
        />
        <StatCard
          label="Recruiters"
          value={data?.total_recruiters}
          icon={Building}
          color="bg-indigo-600"
        />
        <StatCard
          label="Total Jobs"
          value={data?.total_jobs}
          icon={FileText}
          color="bg-purple-600"
          sublabel={`+${data?.jobs_last_30_days || 0} last 30d`}
        />
        <StatCard
          label="Active Jobs"
          value={data?.active_jobs}
          icon={CheckCircle}
          color="bg-emerald-600"
        />
        <StatCard
          label="Applications"
          value={data?.total_applications}
          icon={ClipboardList}
          color="bg-cyan-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top In-Demand Skills BarChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Most In-Demand Skills</h2>
            <span className="text-xs text-slate-400">By Job Postings</span>
          </div>

          <div className="h-64">
            {data?.top_skills && data.top_skills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_skills} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="count" name="Jobs Requiring Skill" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No skill requirements recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Application Status Breakdown PieChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Application Funnel Distribution</h2>
            <span className="text-xs text-slate-400">All Time</span>
          </div>

          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No applications submitted yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent User Registrations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Platform Registrations</h2>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            View all users <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recent_users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{u.name || u.username}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.role === 'RECRUITER'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        u.is_active ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
