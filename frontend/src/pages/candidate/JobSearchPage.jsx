import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Star,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

const JOB_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];
const JOB_TYPE_LABELS = {
  '': 'All Types',
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
};
const EXP_LEVELS = ['', 'ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'];
const EXP_LABELS = {
  '': 'All Levels',
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

const typeBadgeColor = {
  FULL_TIME: 'bg-blue-100 text-blue-700',
  PART_TIME: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-orange-100 text-orange-700',
  INTERNSHIP: 'bg-cyan-100 text-cyan-700',
  REMOTE: 'bg-green-100 text-green-700',
};

function JobCard({ job, onSaveToggle, isAuthenticated }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.post(`/jobs/${job.id}/save/`);
      onSaveToggle(job.id);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const salary =
    job.salary_min || job.salary_max
      ? `$${job.salary_min ? Number(job.salary_min).toLocaleString() : '?'} – $${job.salary_max ? Number(job.salary_max).toLocaleString() : '?'}`
      : null;

  const skills = (job.required_skills || job.skills || []).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
          <p className="text-sm text-slate-500 truncate">{job.company_name || job.company}</p>
        </div>
        {job.match_score != null && (
          <span className="flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
            <Star className="w-3 h-3" />
            {Math.round(job.match_score)}%
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className={`px-2 py-0.5 rounded-full font-medium ${typeBadgeColor[job.job_type] || 'bg-slate-100 text-slate-600'}`}>
            {JOB_TYPE_LABELS[job.job_type] || job.job_type}
          </span>
        )}
        {job.experience_level && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {EXP_LABELS[job.experience_level] || job.experience_level}
          </span>
        )}
        {salary && <span className="text-green-700 font-medium">{salary}</span>}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">
              {typeof s === 'string' ? s : s.skill_name || s.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          View Details
        </Link>
        {isAuthenticated && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500"
            title={job.is_saved ? 'Unsave' : 'Save'}
          >
            {job.is_saved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-700" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    experience_level: searchParams.get('experience_level') || '',
    skill: searchParams.get('skill') || '',
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextUrl, setNextUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchJobs = useCallback(async (params, replace = true) => {
    setLoading(replace);
    setError('');
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const res = await axiosClient.get('/jobs/', { params: clean });
      const data = res.data;
      const results = data.results || data;
      setJobs(replace ? results : (prev) => [...prev, ...results]);
      setNextUrl(data.next || null);
    } catch {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { ...filters };
    setSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    fetchJobs(params);
  };

  const handleFilterChange = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
  };

  const handleSaveToggle = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_saved: !j.is_saved } : j))
    );
  };

  const handleLoadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const urlObj = new URL(nextUrl);
      const params = Object.fromEntries(urlObj.searchParams.entries());
      const res = await axiosClient.get('/jobs/', { params });
      const data = res.data;
      setJobs((prev) => [...prev, ...(data.results || data)]);
      setNextUrl(data.next || null);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">Find your next opportunity</p>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search job title, keyword..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="relative">
            <select
              value={filters.job_type}
              onChange={(e) => handleFilterChange('job_type', e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.experience_level}
              onChange={(e) => handleFilterChange('experience_level', e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            >
              {EXP_LEVELS.map((l) => (
                <option key={l} value={l}>{EXP_LABELS[l]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Skill (e.g. Python)"
              value={filters.skill}
              onChange={(e) => handleFilterChange('skill', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No jobs found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSaveToggle={handleSaveToggle}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
          {nextUrl && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl text-sm font-medium transition"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
