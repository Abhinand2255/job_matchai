import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase, Users, CheckCircle, XCircle, PlusCircle,
  List, TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#1d4ed8', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  </div>
);

const getScoreColor = (score) => {
  if (score >= 75) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

const getStatusColor = (status) => {
  const map = {
    PENDING: 'bg-slate-100 text-slate-600',
    SHORTLISTED: 'bg-cyan-100 text-cyan-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    HIRED: 'bg-emerald-100 text-emerald-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/analytics/recruiter/')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center space-x-3 text-rose-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  );

  const statusPieData = [
    { name: 'Pending', value: data?.pending_applicants ?? 0 },
    { name: 'Shortlisted', value: data?.shortlisted ?? 0 },
    { name: 'Rejected', value: data?.rejected ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your hiring overview at a glance</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Post New Job
          </Link>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <List className="w-4 h-4" /> Manage Jobs
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Jobs" value={data?.total_jobs} color="bg-blue-700" icon={Briefcase} />
        <StatCard label="Active Jobs" value={data?.active_jobs} color="bg-cyan-500" icon={TrendingUp} />
        <StatCard label="Total Applicants" value={data?.total_applicants} color="bg-indigo-500" icon={Users} />
        <StatCard label="Shortlisted" value={data?.shortlisted} color="bg-emerald-500" icon={CheckCircle} />
        <StatCard label="Rejected" value={data?.rejected} color="bg-rose-500" icon={XCircle} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Top Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Jobs by Applicants</h2>
          {data?.top_jobs?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.top_jobs} margin={{ top: 4, right: 8, left: -16, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="applicant_count" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Application Status</h2>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No application data</div>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Applications</h2>
        {data?.recent_applications?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-slate-500 font-medium">Candidate</th>
                  <th className="text-left pb-3 text-slate-500 font-medium">Job</th>
                  <th className="text-left pb-3 text-slate-500 font-medium">Match Score</th>
                  <th className="text-left pb-3 text-slate-500 font-medium">Status</th>
                  <th className="text-left pb-3 text-slate-500 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recent_applications.map((app, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-medium text-slate-800">{app.candidate_name}</td>
                    <td className="py-3 text-slate-600">{app.job_title}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getScoreColor(app.match_score)}`}>
                        {app.match_score != null ? `${Math.round(app.match_score)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(app.applied_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No applications yet. Post a job to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
