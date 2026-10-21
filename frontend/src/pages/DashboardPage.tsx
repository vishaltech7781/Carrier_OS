import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  Code2,
  Mic,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Aggregated data from database
  const [readinessData, setReadinessData] = useState<any>(null);
  const [dsaStats, setDsaStats] = useState<any>(null);
  const [latestResume, setLatestResume] = useState<any>(null);
  const [bestJob, setBestJob] = useState<any>(null);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [roadmapSummary, setRoadmapSummary] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Execute parallel requests
        const [readinessRes, dsaRes, resumeRes, jobsRes, interviewRes, actRes, roadmapRes] = await Promise.allSettled([
          api.get('/analytics/readiness'),
          api.get('/dsa/stats'),
          api.get('/resume/history'),
          api.get('/jobs'),
          api.get('/interviews/history'),
          api.get('/analytics/activity'),
          api.get('/roadmap'),
        ]);

        if (readinessRes.status === 'fulfilled' && readinessRes.value.data.success) {
          setReadinessData(readinessRes.value.data);
        }
        if (dsaRes.status === 'fulfilled' && dsaRes.value.data.success) {
          setDsaStats(dsaRes.value.data.stats);
        }
        if (resumeRes.status === 'fulfilled' && resumeRes.value.data.success) {
          const resumes = resumeRes.value.data.resumes;
          if (resumes.length > 0) setLatestResume(resumes[0]);
        }
        if (jobsRes.status === 'fulfilled' && jobsRes.value.data.success) {
          const jobs = jobsRes.value.data.jobs;
          if (jobs.length > 0) setBestJob(jobs[0]);
        }
        if (interviewRes.status === 'fulfilled' && interviewRes.value.data.success) {
          setRecentInterviews(interviewRes.value.data.sessions || []);
        }
        if (actRes.status === 'fulfilled' && actRes.value.data.success) {
          setActivities(actRes.value.data.activities || []);
        }
        if (roadmapRes.status === 'fulfilled' && roadmapRes.value.data.success) {
          setRoadmapSummary(roadmapRes.value.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const readinessScore = readinessData?.readinessScore || user?.readinessScore || 45;

  return (
    <div className="space-y-6 text-ink-900">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Career Intelligence Overview
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Tracking verified competencies, roadmap milestones, and placement benchmark for{' '}
            <span className="font-semibold text-ink-800">{user?.targetRole || 'Full Stack Developer'}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/mock-interview"
            className="px-3.5 py-1.5 rounded border border-ivory-border bg-ivory-50 text-xs font-medium text-ink-800 hover:bg-ivory-200 transition-colors flex items-center space-x-1.5"
          >
            <Mic size={14} className="text-forest-700" />
            <span>Mock Interview</span>
          </Link>
          <Link
            to="/roadmap"
            className="px-3.5 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-1.5 shadow-subtle"
          >
            <span>Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card md:col-span-1">
          <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
            Career Readiness Score
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-serif text-4xl font-bold text-forest-700 font-mono">
              {readinessScore}%
            </span>
            <span className="text-xs font-medium text-ink-500">
              {readinessScore >= 75 ? 'Job-Ready' : readinessScore >= 50 ? 'Moderate Gaps' : 'Foundation Phase'}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-ivory-border text-[11px] text-ink-600">
            {readinessData?.isProvisional && (
              <span className="inline-flex items-center space-x-1 text-ochre-700 font-medium">
                <AlertCircle size={12} />
                <span>Provisional: Complete a mock interview and upload resume to calibrate.</span>
              </span>
            )}
            {!readinessData?.isProvisional && (
              <span className="text-ink-500">
                Calculated from verified skills, DSA history, project evidence, and mock interview performance.
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: DSA Practice Progress */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
            <span>DSA Progress</span>
            <Code2 size={15} className="text-ink-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-ink-900 font-mono">
              {dsaStats?.totalSolved || 0}
            </span>
            <span className="text-xs text-ink-500 font-mono">
              / {dsaStats?.totalAttempted || 0} attempted
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px]">
            <span className="inline-flex items-center space-x-1 text-forest-700 font-medium bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
              <Flame size={12} />
              <span>{dsaStats?.currentStreak || 0}-day streak</span>
            </span>
            <span className="text-ink-500">
              Success: {dsaStats?.successRate || 0}%
            </span>
          </div>
        </div>

        {/* Metric 3: Best Job Match */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
            <span>Top Market Match</span>
            <Briefcase size={15} className="text-ink-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-forest-700 font-mono">
              {bestJob?.calculatedMatchScore || 82}%
            </span>
            <span className="text-xs text-ink-500 truncate max-w-[140px]">
              {bestJob?.company || 'Technology Co.'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-ink-600 truncate">
            Role: <span className="font-medium text-ink-900">{bestJob?.title || 'Full Stack Engineer'}</span>
          </div>
        </div>

        {/* Metric 4: Roadmap Progress */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
            <span>Curriculum Progress</span>
            <TrendingUp size={15} className="text-ink-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-ink-900 font-mono">
              {roadmapSummary?.progressPercentage || 0}%
            </span>
            <span className="text-xs text-ink-500">
              ({roadmapSummary?.completedTasks || 0}/{roadmapSummary?.totalTasks || 0} tasks)
            </span>
          </div>
          <div className="mt-3 text-[11px]">
            <Link to="/roadmap" className="text-forest-700 font-medium hover:underline inline-flex items-center space-x-1">
              <span>View weekly plan</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Section: Readiness Breakdown & Recommended Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weighted Readiness Calculation Model */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
            <div>
              <h2 className="font-serif text-base font-bold text-ink-900">Explainable Readiness Model</h2>
              <p className="text-[11px] text-ink-500">Deterministic multi-factor calculation breakdown</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-forest-700 hover:text-forest-800">
              Full Analytics →
            </Link>
          </div>

          <div className="space-y-3">
            {readinessData?.breakdown ? (
              readinessData.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-ivory-100/70 border border-ivory-border/70 rounded">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-ink-800">{item.component} ({item.weightPct}% weight)</span>
                    <span className="font-mono text-ink-900 font-semibold">{item.score}% score</span>
                  </div>
                  {/* Visual Progress bar */}
                  <div className="w-full bg-ivory-border h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-forest-700 h-full rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <span>{item.detail}</span>
                    <span className="font-mono">+{item.contribution} pts</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-ink-500 py-4 text-center">Loading readiness parameters...</div>
            )}
          </div>
        </div>

        {/* Right Column: Next Priority Actions */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-4">
          <div className="pb-3 border-b border-ivory-border">
            <h2 className="font-serif text-base font-bold text-ink-900">Recommended Next Actions</h2>
            <p className="text-[11px] text-ink-500">Highest-impact steps to boost placement match</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-forest-50/60 border border-forest-100 rounded">
              <div className="text-xs font-semibold text-forest-900 flex items-center space-x-1.5">
                <CheckCircle2 size={13} className="text-forest-700" />
                <span>Primary Recommendation</span>
              </div>
              <p className="text-xs text-forest-800 mt-1 leading-relaxed">
                {readinessData?.nextRecommendedAction || 'Upload your latest resume to establish verified extraction baselines.'}
              </p>
            </div>

            <div className="p-3 bg-ivory-100/70 border border-ivory-border rounded text-xs space-y-2">
              <div className="font-semibold text-ink-800">Priority Missing Competencies</div>
              <div className="flex flex-wrap gap-1.5">
                {['TypeScript', 'Docker', 'Redis', 'SQL', 'System Design'].map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-ivory-50 border border-ivory-border text-ink-700 text-[11px] font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dsa-tracker"
                className="w-full py-2 px-3 rounded border border-ivory-border bg-ivory-100 hover:bg-ivory-200 text-xs font-medium text-ink-800 flex items-center justify-between transition-colors"
              >
                <span>Practice Recommended Topic: {dsaStats?.recommendedNextTopic || 'Dynamic Programming'}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Mock Interviews & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interviews Card */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
            <div>
              <h2 className="font-serif text-base font-bold text-ink-900">Recent Mock Interviews</h2>
              <p className="text-[11px] text-ink-500">Evaluated on technical accuracy & concept grounding</p>
            </div>
            <Link to="/mock-interview" className="text-xs font-semibold text-forest-700 hover:text-forest-800">
              Start Session →
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="space-y-2.5">
              {recentInterviews.slice(0, 3).map((inv: any) => (
                <div key={inv._id} className="p-3 bg-ivory-100/60 border border-ivory-border/70 rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-ink-900 uppercase tracking-wide text-[11px]">
                      {inv.interviewType} Interview ({inv.difficulty})
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5">
                      {new Date(inv.createdAt).toLocaleDateString()} • {inv.questions.length} questions
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-base text-forest-700 font-mono">
                      {inv.overallScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-ink-500">
              No interview sessions recorded yet. Complete an interactive technical Q&A session to calibrate your verbal reasoning readiness.
            </div>
          )}
        </div>

        {/* Real Activity Timeline */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
            <div>
              <h2 className="font-serif text-base font-bold text-ink-900">Activity Timeline</h2>
              <p className="text-[11px] text-ink-500">Persistent log of student milestones and evaluations</p>
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-2.5">
              {activities.slice(0, 4).map((act: any) => (
                <div key={act._id} className="p-3 bg-ivory-100/60 border border-ivory-border/70 rounded text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-ink-900">{act.title}</span>
                    <span className="text-[10px] text-ink-400 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-ink-500">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

