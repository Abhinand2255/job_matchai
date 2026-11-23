import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Bookmark,
  BookmarkX,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unsavingId, setUnsavingId] = useState(null);

  const fetchSavedJobs = () => {
    setLoading(true);
    axiosClient
      .get('/jobs/saved/')
      .then((res) => {
        const list = res.data.results || res.data || [];
        setSavedJobs(list);
      })
      .catch((err) => {
        setError('Failed to fetch saved jobs.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    setUnsavingId(jobId);
    try {
      await axiosClient.post(`/jobs/${jobId}/save/`);
      setSavedJobs((prev) => prev.filter((item) => (item.job?.id || item.job_id) !== jobId));
    } catch (err) {
      alert('Failed to remove job from saved list.');
    } finally {
      setUnsavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Saved Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of open positions you're interested in and apply when you're ready.
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Briefcase className="w-4 h-4" /> Find More Jobs
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Grid of Saved Jobs */}
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Saved Jobs Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Click the bookmark icon on any job card to save it here for quick access later.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline text-sm"
          >
            Browse available opportunities <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((item) => {
            const job = item.job || item;
            const salary =
              job.min_salary || job.max_salary
                ? `$${job.min_salary ? Number(job.min_salary).toLocaleString() : ''} – $${job.max_salary ? Number(job.max_salary).toLocaleString() : ''}`
                : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {job.job_type?.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1 hover:text-blue-700 transition">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">{job.company_name}</p>
                    </div>

                    <button
                      onClick={() => handleUnsave(job.id)}
                      disabled={unsavingId === job.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Remove from saved"
                    >
                      <BookmarkX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'}
                    </span>
                    {salary && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5" /> {salary}
                      </span>
                    )}
                  </div>

                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.required_skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          {s.skill_name || s.skill?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Saved on {new Date(item.saved_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    View Details & Apply <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
