import React, { useState } from 'react';
import { api } from '../services/api';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

export const JobAnalyzerPage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [company, setCompany] = useState('Stripe');
  const [jobDescription, setJobDescription] = useState(
`We are seeking a Full Stack Software Engineer to build resilient payment interfaces and scalable backend infrastructure.
Requirements:
- Strong proficiency in JavaScript, TypeScript, and React.
- Hands-on experience developing RESTful APIs with Node.js and Express.
- Solid understanding of relational databases (SQL / PostgreSQL) and caching layers (Redis).
- Familiarity with Docker containerization and version control with Git.
Preferred:
- Experience with AWS or Google Cloud Platform.
- Familiarity with Kubernetes and microservice architecture.
- Understanding of distributed system design and idempotency patterns.`
  );

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [savedJob, setSavedJob] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Please paste a job description to evaluate.');
      return;
    }

    setLoading(true);
    setError('');
    setSavedJob(false);
    try {
      const res = await api.post('/jobs/analyze', {
        jobTitle,
        company,
        jobDescription,
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMarket = async () => {
    if (!analysis) return;
    try {
      await api.post('/jobs', {
        title: jobTitle,
        company,
        location: 'Remote',
        workMode: 'Remote',
        description: jobDescription,
        requiredSkills: analysis.extracted_required_skills || [],
        preferredSkills: analysis.extracted_preferred_skills || [],
      });
      setSavedJob(true);
    } catch (err) {
      setError('Failed to save job to market tracker.');
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Job Description Skill-Match Engine
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Compare target job requirements directly against your verified student profile with explainable weighted scoring.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Junior Backend Engineer"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">Company / Organization (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Razorpay, Atlassian"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-800 mb-1">
              Job Description (Paste full text or requirement list)
            </label>
            <textarea
              rows={8}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full text-xs p-3 rounded border border-ivory-border bg-ivory-100 font-mono text-ink-900 focus:border-forest-700 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-ink-500">
              Matches against your active skills, projects, and recorded mock interview assessments.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FileSearch size={14} />
              <span>{loading ? 'Evaluating Requirements...' : 'Analyze Match'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {analysis && (
        <div className="space-y-6 pt-2">
          {/* Top Score Summary Banner */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-4">
              <div>
                <span className="text-[10px] font-semibold text-forest-700 uppercase tracking-wider">
                  Requirement Audit Result
                </span>
                <h2 className="font-serif text-2xl font-bold text-ink-900 mt-0.5">
                  {analysis.job_title} {analysis.company ? `at ${analysis.company}` : ''}
                </h2>
                <div className="mt-1 flex items-center space-x-2 text-xs">
                  <span className="text-ink-500">Readiness Status:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    analysis.readiness_level === 'Ready to Apply'
                      ? 'bg-forest-50 text-forest-800 border border-forest-100'
                      : 'bg-ochre-50 text-ochre-800 border border-ochre-100'
                  }`}>
                    {analysis.readiness_level}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
                    Calculated Job Match
                  </div>
                  <div className="font-serif text-4xl font-bold text-forest-700 font-mono">
                    {analysis.match_percentage}%
                  </div>
                </div>

                {!savedJob ? (
                  <button
                    onClick={handleSaveToMarket}
                    className="p-2.5 rounded border border-ivory-border bg-ivory-100 hover:bg-ivory-200 text-ink-700 transition-colors"
                    title="Save to Market Tracker"
                  >
                    <BookmarkPlus size={18} />
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded bg-forest-50 border border-forest-100 text-forest-800 text-xs font-medium">
                    Saved to Tracker
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-ink-600 bg-ivory-100/70 p-3 rounded border border-ivory-border/70 flex items-start space-x-2">
              <HelpCircle size={15} className="text-ink-400 shrink-0 mt-0.5" />
              <span>{analysis.scoring_rationale}</span>
            </div>
          </div>

          {/* Matched vs Missing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
              <div className="font-serif text-sm font-bold text-forest-800 flex items-center justify-between pb-2 border-b border-ivory-border">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-forest-700" />
                  <span>Verified Matches ({analysis.required_matches?.filter((m: any) => m.status === 'matched').length || 0})</span>
                </span>
                <span className="text-[11px] font-mono text-ink-500">Weight 2.0x</span>
              </div>

              <div className="space-y-2">
                {analysis.required_matches?.filter((m: any) => m.status === 'matched').map((item: any) => (
                  <div key={item.skill} className="p-2.5 bg-forest-50/50 border border-forest-100 rounded flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-forest-900 font-mono">{item.skill}</span>
                      <span className="text-[11px] text-ink-500 ml-2">({item.category})</span>
                    </div>
                    <span className="text-[11px] text-forest-700 font-medium">Verified in Profile</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
              <div className="font-serif text-sm font-bold text-terracotta-700 flex items-center justify-between pb-2 border-b border-ivory-border">
                <span className="flex items-center space-x-1.5">
                  <AlertCircle size={16} className="text-terracotta-600" />
                  <span>Missing High-Priority Requirements ({analysis.missing_required_skills?.length || 0})</span>
                </span>
                <span className="text-[11px] font-mono text-ink-500">High Impact</span>
              </div>

              <div className="space-y-2">
                {analysis.missing_required_skills && analysis.missing_required_skills.length > 0 ? (
                  analysis.missing_required_skills.map((skill: string) => (
                    <div key={skill} className="p-2.5 bg-terracotta-50/50 border border-terracotta-100 rounded flex items-center justify-between text-xs">
                      <span className="font-semibold text-terracotta-800 font-mono">{skill}</span>
                      <span className="text-[11px] text-terracotta-700">Not verified in profile</span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-forest-700 font-medium">
                    All core required competencies are verified in your profile!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Preparation Steps */}
          {analysis.actionable_prep_steps && analysis.actionable_prep_steps.length > 0 && (
            <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
              <div className="font-serif text-sm font-bold text-ink-900 pb-2 border-b border-ivory-border">
                Recommended Actionable Preparation Steps
              </div>
              <div className="space-y-2 text-xs text-ink-700">
                {analysis.actionable_prep_steps.map((step: string, idx: number) => (
                  <div key={idx} className="p-3 bg-ivory-100/60 border border-ivory-border rounded flex items-start space-x-2">
                    <span className="font-mono text-forest-700 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

