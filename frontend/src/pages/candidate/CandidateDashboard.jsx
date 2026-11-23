import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  ClipboardList,
  Search,
  User,
  UploadCloud,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Award,
  AlertCircle,
} from 'lucide-react';

const statusConfig = {
  APPLIED: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-600' },
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/analytics/candidate/')
      .then((r) => setStats(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const name = user?.first_name || user?.username || 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {name}! 👋</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Here's what's happening with your job search today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats?.total_applications} icon={Briefcase} color="bg-slate-100 text-slate-600" />
        <StatCard label="Applied" value={stats?.applied} icon={ClipboardList} color="bg-blue-100 text-blue-600" />
        <StatCard label="Under Review" value={stats?.under_review} icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatCard label="Shortlisted" value={stats?.shortlisted} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard label="Rejected" value={stats?.rejected} icon={XCircle} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Profile Completion</h2>
            <span className="text-sm font-bold text-blue-700">
              {stats?.profile_completion ?? 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-blue-700 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats?.profile_completion ?? 0}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">
            {stats?.profile_completion < 100
              ? 'Complete your profile to improve match scores.'
              : 'Your profile is fully complete! 🎉'}
          </p>

          {/* Skills Badge */}
          <div className="flex items-center gap-2 mt-2">
            <Award className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-slate-700">
              <strong>{stats?.total_skills ?? 0}</strong> skills listed
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/jobs"
              className="flex items-center gap-3 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition text-sm font-medium"
            >
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
            <Link
              to="/candidate/profile"
              className="flex items-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition text-sm font-medium"
            >
              <User className="w-4 h-4" /> Update Profile
            </Link>
            <Link
              to="/candidate/resume"
              className="flex items-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition text-sm font-medium"
            >
              <UploadCloud className="w-4 h-4" /> Upload Resume
            </Link>
          </div>
        </div>

        {/* Match Score Teaser */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" /> AI Matching
          </h2>
          <p className="text-sm text-slate-500">
            Our AI engine matches your skills and experience with job requirements in real time.
          </p>
          <Link
            to="/candidate/applications"
            className="mt-4 inline-flex items-center text-blue-700 hover:underline text-sm font-medium"
          >
            View all applications →
          </Link>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Applications</h2>
          <Link to="/candidate/applications" className="text-sm text-blue-700 hover:underline">
            View all
          </Link>
        </div>
        {stats?.recent_applications?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Job Title</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">Applied</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recent_applications.map((app, i) => {
                  const sc = statusConfig[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{app.job_title}</td>
                      <td className="px-6 py-4 text-slate-600">{app.company}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.match_score != null ? (
                          <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                            <Star className="w-3 h-3" />
                            {Math.round(app.match_score)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No applications yet. Start browsing jobs!</p>
            <Link to="/jobs" className="mt-3 inline-block text-blue-700 hover:underline text-sm">
              Browse Jobs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
