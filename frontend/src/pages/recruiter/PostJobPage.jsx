import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase,
  Sparkles,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const PostJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If present, it's edit mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    job_type: 'FULL_TIME',
    experience_level: 'MID',
    location: 'Remote',
    min_salary: '',
    max_salary: '',
    status: 'ACTIVE',
    description: '',
  });

  const [catalogSkills, setCatalogSkills] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);

  // Selected skill builder inputs
  const [currentSkillId, setCurrentSkillId] = useState('');
  const [currentWeight, setCurrentWeight] = useState(3);
  const [currentMandatory, setCurrentMandatory] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCatalogSkills();
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchCatalogSkills = async () => {
    try {
      const res = await axiosClient.get('/candidates/skills/catalog/');
      setCatalogSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/jobs/${id}/`);
      const job = res.data;
      setFormData({
        title: job.title,
        job_type: job.job_type,
        experience_level: job.experience_level,
        location: job.location,
        min_salary: job.min_salary || '',
        max_salary: job.max_salary || '',
        status: job.status,
        description: job.description,
      });
      if (job.required_skills) {
        setRequiredSkills(
          job.required_skills.map((rs) => ({
            skill_id: rs.skill.id,
            skill_name: rs.skill.name,
            weight: rs.weight,
            is_mandatory: rs.is_mandatory,
          }))
        );
      }
    } catch (err) {
      setErrorMsg('Failed to fetch job details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!currentSkillId) return;

    const skillObj = catalogSkills.find((s) => s.id === parseInt(currentSkillId));
    if (!skillObj) return;

    // Check if already in list
    if (requiredSkills.some((s) => s.skill_id === skillObj.id)) {
      setErrorMsg('Skill is already added to requirements.');
      return;
    }

    setRequiredSkills([
      ...requiredSkills,
      {
        skill_id: skillObj.id,
        skill_name: skillObj.name,
        weight: parseInt(currentWeight),
        is_mandatory: currentMandatory,
      },
    ]);

    setCurrentSkillId('');
    setCurrentWeight(3);
    setCurrentMandatory(false);
    setErrorMsg('');
  };

  const handleRemoveSkill = (skillId) => {
    setRequiredSkills(requiredSkills.filter((s) => s.skill_id !== skillId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      setErrorMsg('Please specify at least one required technical skill.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      ...formData,
      min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
      max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null,
      required_skills: requiredSkills.map((s) => ({
        skill_id: s.skill_id,
        weight: s.weight,
        is_mandatory: s.is_mandatory,
      })),
    };

    try {
      if (isEditMode) {
        await axiosClient.put(`/jobs/${id}/`, payload);
      } else {
        await axiosClient.post('/jobs/', payload);
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to save job posting.';
      if (data && typeof data === 'object') {
        const k = Object.keys(data)[0];
        msg = `${k}: ${Array.isArray(data[k]) ? data[k][0] : data[k]}`;
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to My Postings
      </button>

      {errorMsg && (
        <div className="flex items-center bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
            {isEditMode ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Specify job specifications and skill weights for accurate AI candidate matching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Python & React Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ENTRY">Entry Level (0-2 yrs)</option>
                  <option value="MID">Mid Level (2-5 yrs)</option>
                  <option value="SENIOR">Senior Level (5+ yrs)</option>
                  <option value="LEAD">Lead / Architect</option>
                  <option value="EXECUTIVE">Director / Exec</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY / Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Annual Salary ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 90000"
                  value={formData.min_salary}
                  onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Annual Salary ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 130000"
                  value={formData.max_salary}
                  onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">Active (Accepting applications)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Description & Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="6"
                placeholder="Provide a comprehensive description of the role responsibilities, tech stack, and benefits..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* AI Skill Matching Requirements Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                Required Technical Skills & AI Weighting
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign weights (1-5) to each skill. The AI matching algorithm calculates candidate fit based on these weights.
              </p>
            </div>

            {/* Add skill box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Skill</label>
                  <select
                    value={currentSkillId}
                    onChange={(e) => setCurrentSkillId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="">-- Choose Skill --</option>
                    {catalogSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Importance Weight: <span className="font-bold text-indigo-600">{currentWeight}/5</span>
                  </label>
                  <select
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="1">1 - Nice to have</option>
                    <option value="2">2 - Helpful</option>
                    <option value="3">3 - Important</option>
                    <option value="4">4 - High Priority</option>
                    <option value="5">5 - Crucial / Core</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center pb-2">
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMandatory}
                      onChange={(e) => setCurrentMandatory(e.target.checked)}
                      className="rounded text-indigo-600 mr-2"
                    />
                    Mandatory
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!currentSkillId}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* List of added required skills */}
            {requiredSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skill requirements specified yet.</p>
            ) : (
              <div className="space-y-2">
                {requiredSkills.map((s) => (
                  <div
                    key={s.skill_id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-sm text-slate-900">{s.skill_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        Weight: {s.weight}/5
                      </span>
                      {s.is_mandatory && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.skill_id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              {submitting ? 'Saving Job...' : isEditMode ? 'Update Job Posting' : 'Publish Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
