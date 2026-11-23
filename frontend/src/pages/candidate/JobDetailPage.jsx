import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Send,
  ArrowLeft,
  Star,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Building,
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);
  const [appliedDetails, setAppliedDetails] = useState(null);

  const isCandidate = user?.role === 'CANDIDATE';

  const fetchJobDetails = () => {
    setLoading(true);
    axiosClient
      .get(`/jobs/${id}/detail/`)
      .then((res) => {
        setJob(res.data);
        setSaved(res.data.is_saved || false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load job details.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (isCandidate && showApplyModal) {
      axiosClient
        .get('/candidates/resumes/')
        .then((res) => {
          const list = res.data.results || res.data || [];
          setResumes(list);
          const primary = list.find((r) => r.is_primary);
          if (primary) setSelectedResumeId(primary.id);
          else if (list.length > 0) setSelectedResumeId(list[0].id);
        })
        .catch(() => {});
    }
  }, [isCandidate, showApplyModal]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosClient.post(`/jobs/${id}/save/`);
      setSaved(res.data.saved);
    } catch (err) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      const res = await axiosClient.post(`/jobs/${id}/apply/`, {
        cover_letter: coverLetter,
        resume_id: selectedResumeId || undefined,
      });
      setAppliedSuccessfully(true);
      setAppliedDetails(res.data);
      setShowApplyModal(false);
      fetchJobDetails();
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-slate-600">{error || 'This job may have expired or been removed.'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Search
        </Link>
      </div>
    );
  }

  const matchPreview = job.match_preview;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all jobs
      </Link>

      {/* Applied Success Banner */}
      {appliedSuccessfully && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Application Submitted Successfully!</h3>
            <p className="text-sm text-emerald-800">
              Your AI Match Score is{' '}
              <span className="font-bold">{appliedDetails?.match_score}%</span>. The recruiter has been
              notified and you can track this under My Applications.
            </p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {job.job_type?.replace('_', ' ')}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {job.experience_level}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-800">
              <Building className="w-4 h-4 text-slate-400" /> {job.company_name || 'Hiring Company'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> {job.location || 'Remote'}
            </span>
            {(job.min_salary || job.max_salary) && (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <DollarSign className="w-4 h-4" />
                {job.min_salary && `$${Number(job.min_salary).toLocaleString()}`}
                {job.min_salary && job.max_salary && ' – '}
                {job.max_salary && `$${Number(job.max_salary).toLocaleString()}`}
              </span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" /> Deadline: {job.deadline}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isCandidate && (
            <button
              onClick={handleToggleSave}
              disabled={saving}
              className={`p-3 rounded-xl border transition ${
                saved
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={saved ? 'Remove from saved' : 'Save job'}
            >
              {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          )}

          {isCandidate ? (
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" /> Apply for this Job
            </button>
          ) : !user ? (
            <Link
              to="/login"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 transition"
            >
              Login to Apply
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line text-sm leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Responsibilities if available */}
          {job.responsibilities && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Responsibilities</h2>
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                {job.responsibilities}
              </div>
            </div>
          )}

          {/* Requirements if available */}
          {job.requirements && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Qualifications & Requirements</h2>
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Match & Required Skills */}
        <div className="space-y-6">
          {/* AI Match Card (Candidate Only) */}
          {isCandidate && matchPreview && (
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> AI Skill Match
                </span>
                <span className="text-2xl font-black text-cyan-300">
                  {Math.round(matchPreview.match_percentage)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, matchPreview.match_percentage)}%` }}
                />
              </div>

              {/* Matched Skills */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">
                  Matching Skills ({matchPreview.matched_skills?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchPreview.matched_skills?.length > 0 ? (
                    matchPreview.matched_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills matched yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              {matchPreview.missing_skills?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">
                    Missing Skills ({matchPreview.missing_skills.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchPreview.missing_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Required Skills Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.required_skills?.map((item) => (
                <span
                  key={item.id}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    item.is_mandatory
                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {item.skill_name || item.skill?.name}
                  {item.is_mandatory && <span className="text-[10px] text-rose-600 font-bold">• Required</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Job Overview Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-sm">
            <h3 className="font-bold text-slate-900">Job Overview</h3>
            <div className="space-y-3 text-slate-600">
              <div className="flex justify-between">
                <span>Vacancies</span>
                <span className="font-semibold text-slate-900">{job.vacancies || 1} open</span>
              </div>
              <div className="flex justify-between">
                <span>Posted</span>
                <span className="font-semibold text-slate-900">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Applicants</span>
                <span className="font-semibold text-slate-900">{job.applications_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Apply to {job.title}</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {applyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              {/* Select Resume */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Choose Resume</label>
                {resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.filename} {r.is_primary ? '(Primary)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600">
                    No resumes uploaded yet.{' '}
                    <Link to="/candidate/resume" className="underline font-bold">
                      Upload one now
                    </Link>{' '}
                    for higher AI matching accuracy.
                  </p>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Cover Letter / Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
                >
                  {applying ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
