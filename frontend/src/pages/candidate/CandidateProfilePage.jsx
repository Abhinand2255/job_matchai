import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../../components/SkillBadge';
import {
  User,
  UploadCloud,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const CandidateProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Skills
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [yearsExp, setYearsExp] = useState(1);

  // Education Form
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_year: 2020,
    end_year: 2024,
    grade: '',
  });

  // Experience Form
  const [showExpModal, setShowExpModal] = useState(false);
  const [expForm, setExpForm] = useState({
    company_name: '',
    job_title: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchSkillCatalog();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/candidates/profile/me/');
      setProfile(res.data);
    } catch (err) {
      setErrorMsg('Failed to load candidate profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillCatalog = async () => {
    try {
      const res = await axiosClient.get('/candidates/skills/catalog/');
      setCatalogSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfileDetails = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.patch('/candidates/profile/me/', {
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        github_url: profile.github_url || null,
        linkedin_url: profile.linkedin_url || null,
        portfolio_url: profile.portfolio_url || null,
        experience_years: profile.experience_years,
      });
      setProfile(res.data);
      setUploadSuccessMsg('Profile updated successfully!');
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_add_skills', 'true');

    setUploadingResume(true);
    setErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const res = await axiosClient.post('/candidates/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccessMsg(
        `AI Parser analyzed your resume! Found ${res.data.extracted_skills_count} skills (${res.data.auto_added_to_profile} newly added to your profile).`
      );
      // Refresh profile to reflect newly added skills and resume
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      await axiosClient.post('/candidates/skills/', {
        skill_id: selectedSkillId,
        proficiency,
        years_of_experience: yearsExp,
      });
      setSelectedSkillId('');
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Skill already added or invalid.');
    }
  };

  const handleRemoveSkill = async (candidateSkillId) => {
    try {
      await axiosClient.delete(`/candidates/skills/${candidateSkillId}/`);
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to remove skill.');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/candidates/education/', eduForm);
      setShowEduModal(false);
      setEduForm({
        institution: '',
        degree: '',
        field_of_study: '',
        start_year: 2020,
        end_year: 2024,
        grade: '',
      });
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to save education entry.');
    }
  };

  const handleRemoveEducation = async (id) => {
    try {
      await axiosClient.delete(`/candidates/education/${id}/`);
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to delete education entry.');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/candidates/experience/', expForm);
      setShowExpModal(false);
      setExpForm({
        company_name: '',
        job_title: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
      });
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to save experience entry.');
    }
  };

  const handleRemoveExperience = async (id) => {
    try {
      await axiosClient.delete(`/candidates/experience/${id}/`);
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to delete experience entry.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const primaryResume = profile?.resumes?.find((r) => r.is_primary) || profile?.resumes?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Notifications */}
      {uploadSuccessMsg && (
        <div className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="text-sm font-medium">{uploadSuccessMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.user?.first_name ? `${profile.user.first_name} ${profile.user.last_name}` : profile?.user?.username}
          </h1>
          <p className="text-indigo-600 font-medium text-sm mt-0.5">
            {profile?.headline || 'No headline set yet (e.g. Full-Stack Developer)'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {profile?.location || 'Location not specified'} • {profile?.experience_years || 0} years experience
          </p>
        </div>

        {/* AI Resume Upload Button Card */}
        <div className="relative">
          <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
            <Sparkles className="w-4 h-4 mr-2" />
            {uploadingResume ? 'AI Extracting Skills...' : 'Upload PDF Resume (AI Parse)'}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              disabled={uploadingResume}
              onChange={handleResumeUpload}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Profile Details, Education, Experience */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Profile Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              General Profile Information
            </h2>
            <form onSubmit={saveProfileDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={profile?.headline || ''}
                  onChange={handleProfileChange}
                  placeholder="e.g. Full Stack Python & React Developer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profile?.location || ''}
                    onChange={handleProfileChange}
                    placeholder="e.g. San Francisco, CA / Remote"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Years of Experience
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="experience_years"
                    value={profile?.experience_years || 0}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  About / Professional Bio
                </label>
                <textarea
                  rows="3"
                  name="bio"
                  value={profile?.bio || ''}
                  onChange={handleProfileChange}
                  placeholder="Briefly describe your career background and what roles you are seeking..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    name="github_url"
                    value={profile?.github_url || ''}
                    onChange={handleProfileChange}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={profile?.linkedin_url || ''}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={profile?.portfolio_url || ''}
                    onChange={handleProfileChange}
                    placeholder="https://myportfolio.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {savingProfile ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Work Experience Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Work Experience
              </h2>
              <button
                type="button"
                onClick={() => setShowExpModal(!showExpModal)}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Experience
              </button>
            </div>

            {showExpModal && (
              <form onSubmit={handleAddExperience} className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Job Title (e.g. Software Engineer)"
                    value={expForm.job_title}
                    onChange={(e) => setExpForm({ ...expForm, job_title: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={expForm.company_name}
                    onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Location"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                  <div>
                    <label className="text-[10px] text-slate-500 block">Start Date</label>
                    <input
                      type="date"
                      required
                      value={expForm.start_date}
                      onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">End Date</label>
                    <input
                      type="date"
                      disabled={expForm.is_current}
                      value={expForm.end_date}
                      onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={expForm.is_current}
                    onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="is_current" className="text-xs text-slate-700">
                    I currently work here
                  </label>
                </div>
                <textarea
                  placeholder="Responsibilities & achievements..."
                  rows="2"
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowExpModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-semibold"
                  >
                    Save Experience
                  </button>
                </div>
              </form>
            )}

            {profile?.experience?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No work experience listed yet.</p>
            ) : (
              <div className="space-y-4">
                {profile?.experience?.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-indigo-500 pl-4 py-1 relative group">
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute right-0 top-0 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-slate-900 text-sm">{exp.job_title}</h3>
                    <p className="text-slate-600 text-xs font-medium">
                      {exp.company_name} {exp.location && `• ${exp.location}`}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </p>
                    {exp.description && (
                      <p className="text-slate-600 text-xs mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                Education Details
              </h2>
              <button
                type="button"
                onClick={() => setShowEduModal(!showEduModal)}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Education
              </button>
            </div>

            {showEduModal && (
              <form onSubmit={handleAddEducation} className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Degree (e.g. Bachelor of Science)"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Field of Study (e.g. Computer Science)"
                    value={eduForm.field_of_study}
                    onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Institution / University"
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={eduForm.start_year}
                    onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Graduation Year"
                    value={eduForm.end_year}
                    onChange={(e) => setEduForm({ ...eduForm, end_year: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEduModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-semibold"
                  >
                    Save Education
                  </button>
                </div>
              </form>
            )}

            {profile?.education?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No education details added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile?.education?.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-slate-900 text-sm">{edu.degree}</h3>
                    <p className="text-indigo-600 text-xs font-medium">{edu.field_of_study}</p>
                    <p className="text-slate-600 text-xs mt-1">{edu.institution}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {edu.start_year} — {edu.end_year || 'Ongoing'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Skills & Resume Card */}
        <div className="space-y-8">
          {/* Active Resume Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Uploaded Resume
            </h2>

            {primaryResume ? (
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 truncate" title={primaryResume.filename}>
                      {primaryResume.filename}
                    </span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                    Primary
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Size: {(primaryResume.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(primaryResume.uploaded_at).toLocaleDateString()}
                </p>
                {primaryResume.file && (
                  <a
                    href={primaryResume.file}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1"
                  >
                    View / Download PDF <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No resume uploaded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF to parse your skills automatically</p>
              </div>
            )}
          </div>

          {/* Technical Skills Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              Technical Skills ({profile?.skills?.length || 0})
            </h2>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="space-y-3 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose from Catalog --</option>
                  {catalogSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Proficiency</label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Years</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSkillId}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
              >
                Add Technical Skill
              </button>
            </form>

            {/* List of skills as badges */}
            {profile?.skills?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No skills added yet. Use the selector above or upload your resume to extract them automatically!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((cs) => (
                  <SkillBadge
                    key={cs.id}
                    name={cs.skill?.name}
                    category={cs.skill?.category}
                    proficiency={cs.proficiency}
                    onRemove={() => handleRemoveSkill(cs.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
