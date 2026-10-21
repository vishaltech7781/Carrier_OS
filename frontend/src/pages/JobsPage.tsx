import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Briefcase,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  BookmarkCheck,
  Send,
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'applications'>('market');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // Filter
  const [workModeFilter, setWorkModeFilter] = useState('');

  // Add Job Form
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState('Fresher / 0-2 yrs');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js');
  const [preferredSkills, setPreferredSkills] = useState('Docker, SQL');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/applications'),
      ]);

      if (jobsRes.data.success) setJobs(jobsRes.data.jobs || []);
      if (appsRes.data.success) setApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await api.put(`/jobs/applications/${appId}`, { status });
      fetchJobs();
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const handleTrackJob = async (jobId: string, score: number, status = 'Interested') => {
    try {
      await api.post('/jobs/applications', {
        jobId,
        matchScore: score,
        status,
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to track job:', err);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/jobs', {
        title,
        company,
        location,
        workMode,
        experienceLevel,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        sourceUrl,
      });

      setShowAddJobModal(false);
      setTitle('');
      setDescription('');
      fetchJobs();
    } catch (err) {
      console.error('Failed to add job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(j => !workModeFilter || j.workMode === workModeFilter);

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Job Matcher & Application Pipeline
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Real-time weighted skill matching ranked against your verified student competencies.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 p-1 bg-ivory-200/70 border border-ivory-border rounded text-xs font-medium">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'market' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Recommended Roles ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'applications' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Pipeline Tracker ({applications.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="px-3.5 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-1.5 shadow-subtle"
          >
            <Plus size={14} />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* MARKET TAB */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          {/* Work mode filter */}
          <div className="flex items-center space-x-2 text-xs">
            <Filter size={13} className="text-ink-500" />
            <span className="text-ink-500">Work Mode:</span>
            {['', 'Remote', 'Hybrid', 'On-site'].map((m) => (
              <button
                key={m}
                onClick={() => setWorkModeFilter(m)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                  workModeFilter === m
                    ? 'bg-forest-100 border-forest-400 text-forest-800 font-semibold'
                    : 'bg-ivory-50 border-ivory-border text-ink-700 hover:bg-ivory-200'
                }`}
              >
                {m || 'All Modes'}
              </button>
            ))}
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isTracked = applications.some(a => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card hover:border-ivory-borderDark transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="font-serif text-lg font-bold text-ink-900">{job.title}</h2>
                          {job.isDemoData && (
                            <span className="px-1.5 py-0.2 rounded bg-ivory-200 text-ink-500 text-[10px] font-mono uppercase">
                              Demo Listing
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-600 mt-0.5">
                          <span className="font-semibold text-ink-800">{job.company}</span> • {job.location} ({job.workMode}) • {job.experienceLevel}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-semibold text-ink-400">Match</div>
                          <div className="font-serif text-2xl font-bold text-forest-700 font-mono">
                            {job.calculatedMatchScore}%
                          </div>
                        </div>

                        {!isTracked ? (
                          <button
                            onClick={() => handleTrackJob(job.id, job.calculatedMatchScore, 'Interested')}
                            className="px-3 py-1.5 rounded border border-ivory-border bg-ivory-100 text-xs font-medium text-ink-800 hover:bg-ivory-200"
                          >
                            + Add to Pipeline
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-forest-50 border border-forest-100 text-forest-800 text-xs font-medium flex items-center space-x-1">
                            <BookmarkCheck size={13} />
                            <span>In Pipeline</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-ink-600 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skill Breakdown Badges */}
                    <div className="pt-2 border-t border-ivory-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-ink-400">Matched:</span>
                        {job.matchedSkills && job.matchedSkills.length > 0 ? (
                          job.matchedSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-forest-50 border border-forest-100 text-forest-800 text-[11px] font-mono">
                              {s} ✓
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-ink-400 italic">None yet</span>
                        )}

                        <span className="text-[11px] text-ink-400 ml-2">Missing:</span>
                        {job.missingSkills && job.missingSkills.length > 0 ? (
                          job.missingSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-ochre-50 border border-ochre-100 text-ochre-800 text-[11px] font-mono">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-forest-700 font-medium">Zero gaps!</span>
                        )}
                      </div>

                      {job.sourceUrl && (
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-forest-700 hover:underline inline-flex items-center space-x-1 text-xs font-medium"
                        >
                          <span>Application Link</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-ivory-50 border border-ivory-border rounded p-8 text-center text-xs text-ink-500">
                No jobs matching current filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIPELINE TAB */}
      {activeTab === 'applications' && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
          <div className="border-b border-ivory-border pb-3">
            <h2 className="font-serif text-base font-bold text-ink-900">Application Pipeline Kanban Statuses</h2>
            <p className="text-[11px] text-ink-500">Track and advance your job applications from Interested to Offer</p>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 bg-ivory-100/70 border border-ivory-border rounded text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-serif text-sm font-bold text-ink-900">{app.job?.title}</div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {app.job?.company} • Match: <span className="font-mono font-semibold text-forest-700">{app.matchScore}%</span>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-ink-500">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className="text-xs p-1.5 rounded border border-ivory-border bg-ivory-50 text-ink-900 font-semibold"
                      >
                        <option value="Interested">Interested</option>
                        <option value="Planned">Planned</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer Received</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </div>
                  </div>

                  {app.appliedDate && (
                    <div className="text-[11px] text-ink-500">
                      Applied Date: {new Date(app.appliedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-ink-500">
              No applications tracked yet. Click "+ Add to Pipeline" on any recommended role to begin tracking.
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Job */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
          <div className="bg-ivory-50 border border-ivory-border rounded-lg max-w-md w-full p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <h2 className="font-serif text-lg font-bold text-ink-900">Add Job Opportunity</h2>
              <button onClick={() => setShowAddJobModal(false)} className="text-xs text-ink-400 hover:text-ink-700">✕</button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend React Developer"
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Veloce Systems"
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js"
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Preferred Skills (comma-separated)</label>
                <input
                  type="text"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  placeholder="e.g. Docker, SQL"
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities and engineering requirements..."
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-3 py-1.5 rounded border border-ivory-border text-xs text-ink-700 hover:bg-ivory-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Job Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

