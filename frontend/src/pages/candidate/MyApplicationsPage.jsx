import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const STATUS_BADGES = {
  APPLIED: { label: 'Applied', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  INTERVIEW: { label: 'Interview', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  SELECTED: { label: 'Selected', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  WITHDRAWN: { label: 'Withdrawn', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = () => {
    setLoading(true);
    axiosClient
      .get('/candidates/applications/')
      .then((res) => {
        const list = res.data.results || res.data || [];
        setApplications(list);
      })
      .catch((err) => {
        setError('Failed to fetch applications.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawingId(appId);
    try {
      await axiosClient.delete(`/jobs/applications/${appId}/withdraw/`);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (selectedTab === 'ALL') return true;
    return app.status === selectedTab;
  });

  const tabs = [
    { id: 'ALL', label: 'All Applications' },
    { id: 'APPLIED', label: 'Applied' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'SHORTLISTED', label: 'Shortlisted' },
    { id: 'INTERVIEW', label: 'Interview' },
    { id: 'SELECTED', label: 'Selected' },
    { id: 'REJECTED', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your job applications, status updates, and recruiter feedback in real time.
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Briefcase className="w-4 h-4" /> Browse More Jobs
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              selectedTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Applications Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {selectedTab === 'ALL'
              ? "You haven't submitted any applications yet. Discover matching roles and apply now!"
              : `You have no applications with status "${selectedTab}".`}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline text-sm"
          >
            Explore available jobs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const badge = STATUS_BADGES[app.status] || STATUS_BADGES.APPLIED;
            const canWithdraw = app.status === 'APPLIED' || app.status === 'UNDER_REVIEW';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold border border-slate-200">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/jobs/${app.job?.id || app.job_id}`}
                        className="text-lg font-bold text-slate-900 hover:text-blue-700 transition"
                      >
                        {app.job_title || app.job?.title}
                      </Link>
                      <p className="text-sm font-medium text-slate-600">
                        {app.company_name || app.job?.company_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:self-center">
                    {/* Match Score */}
                    {app.match_score != null && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                        {Math.round(app.match_score)}% Match
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-xl border text-xs font-bold tracking-wide ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {/* View Details Link */}
                    <Link
                      to={`/jobs/${app.job?.id || app.job_id}`}
                      className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
                      title="View Job"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Withdraw Button */}
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Withdraw Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Breakdown snippet if exists */}
                {app.match_breakdown && app.match_breakdown.matched_skills && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Matched Skills:</span>
                    {app.match_breakdown.matched_skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {app.match_breakdown.missing_skills?.length > 0 && (
                      <span className="text-slate-400 text-[11px] ml-2">
                        Missing: {app.match_breakdown.missing_skills.slice(0, 3).join(', ')}
                        {app.match_breakdown.missing_skills.length > 3 ? '...' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
