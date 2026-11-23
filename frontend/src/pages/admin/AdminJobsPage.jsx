import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Power,
  ChevronLeft,
  ExternalLink,
  Building,
  Users,
  AlertCircle,
} from 'lucide-react';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchJobs = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    axiosClient
      .get('/admin/jobs/', { params })
      .then((res) => {
        setJobs(res.data.results || res.data || []);
      })
      .catch(() => setError('Failed to load platform jobs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleStatus = async (jobId) => {
    setActionId(jobId);
    try {
      const res = await axiosClient.patch(`/admin/jobs/${jobId}/toggle-status/`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: res.data.status } : j))
      );
    } catch {
      alert('Failed to update job status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job posting?')) return;
    setActionId(jobId);
    try {
      await axiosClient.delete(`/admin/jobs/${jobId}/`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      alert('Failed to delete job.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Job Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, activate, close, or remove job listings across the platform.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 w-full md:w-auto">
          {[
            { id: '', label: 'All Jobs' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'CLOSED', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-slate-500 text-sm">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No jobs found</p>
            <p className="text-xs">Try different filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Job Title & Company</th>
                  <th className="py-3 px-6">Recruiter</th>
                  <th className="py-3 px-6">Type & Location</th>
                  <th className="py-3 px-6">Applicants</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${j.id}`}
                        className="font-bold text-slate-900 hover:text-blue-700 transition"
                      >
                        {j.title}
                      </Link>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" /> {j.company_name}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {j.recruiter_email || '—'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {j.job_type?.replace('_', ' ')}
                      </span>
                      <p className="text-slate-400">{j.location}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3 text-slate-500" /> {j.applicant_count}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          j.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(j.id)}
                        disabled={actionId === j.id}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title={j.status === 'ACTIVE' ? 'Close job' : 'Activate job'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        disabled={actionId === j.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
