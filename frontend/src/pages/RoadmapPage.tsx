import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GitBranch,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  RefreshCw,
  Plus,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Regeneration parameters
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
  const [timelineWeeks, setTimelineWeeks] = useState('6');
  const [weeklyHours, setWeeklyHours] = useState('15');

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      // Optimistic update
      setRoadmap((prev: any) => {
        if (!prev) return prev;
        const newWeeks = prev.weeks.map((w: any) => ({
          ...w,
          tasks: w.tasks.map((t: any) => {
            if (t.id === taskId) {
              return { ...t, isCompleted: !t.isCompleted };
            }
            return t;
          }),
        }));
        return { ...prev, weeks: newWeeks };
      });

      await api.patch(`/roadmap/tasks/${taskId}/toggle`);
      fetchRoadmap();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchRoadmap();
    }
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegenerating(true);
    try {
      const res = await api.post('/roadmap/generate', {
        targetRole,
        timelineWeeks: Number(timelineWeeks),
        weeklyHours: Number(weeklyHours),
      });

      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        setShowRegenModal(false);
        fetchRoadmap();
      }
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Personalized Career Roadmap
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Dynamic prerequisite-ordered milestones calibrated to your identified technical skill gaps for{' '}
            <span className="font-semibold text-ink-800">{roadmap?.targetRole || targetRole}</span>.
          </p>
        </div>

        <button
          onClick={() => setShowRegenModal(true)}
          className="px-3.5 py-1.5 rounded border border-ivory-border bg-ivory-50 text-xs font-medium text-ink-800 hover:bg-ivory-200 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={13} className="text-forest-700" />
          <span>Regenerate Roadmap</span>
        </button>
      </div>

      {/* Progress Metric Strip */}
      {roadmap && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Overall Completion</div>
            <div className="font-serif text-3xl font-bold text-forest-700 font-mono mt-1">
              {stats?.progressPercentage || 0}%
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Tasks Solved</div>
            <div className="font-serif text-2xl font-bold text-ink-900 font-mono mt-1">
              {stats?.completedTasks || 0} / {stats?.totalTasks || 0}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Timeline Duration</div>
            <div className="font-serif text-2xl font-bold text-ink-900 font-mono mt-1">
              {roadmap.timelineWeeks} Weeks
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Total Planned Hours</div>
            <div className="font-serif text-2xl font-bold text-ink-900 font-mono mt-1">
              {roadmap.totalPlannedHours} Hours
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !roadmap && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-12 text-center shadow-card">
          <GitBranch size={36} className="text-ink-400 mx-auto mb-3" />
          <h2 className="font-serif text-lg font-bold text-ink-900">No Career Roadmap Generated</h2>
          <p className="text-xs text-ink-500 mt-1 max-w-md mx-auto">
            Generate an explainable learning roadmap synthesized from your verified skill gaps and weekly available hours.
          </p>
          <button
            onClick={() => setShowRegenModal(true)}
            className="mt-5 px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>Generate Custom Roadmap</span>
          </button>
        </div>
      )}

      {/* Weekly Weeks and Tasks List */}
      {roadmap && roadmap.weeks && (
        <div className="space-y-6">
          {roadmap.weeks.map((week: any) => {
            const completedCount = week.tasks.filter((t: any) => t.isCompleted).length;
            const weekFinished = completedCount === week.tasks.length && week.tasks.length > 0;

            return (
              <div
                key={week.id}
                className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4"
              >
                {/* Week Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ivory-border gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-base font-bold text-ink-900">
                        {week.focusTheme}
                      </span>
                      {weekFinished && (
                        <span className="px-2 py-0.5 rounded bg-forest-50 border border-forest-100 text-[10px] font-semibold text-forest-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5">
                      Target Commitment: {week.totalHours} planned hours • {completedCount}/{week.tasks.length} tasks completed
                    </div>
                  </div>
                </div>

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded border transition-all ${
                        task.isCompleted
                          ? 'bg-ivory-100/40 border-ivory-border text-ink-500'
                          : 'bg-ivory-100/80 border-ivory-border text-ink-800 hover:border-forest-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-forest-700 hover:text-forest-800 shrink-0"
                          title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 size={18} className="text-forest-700" />
                          ) : (
                            <Circle size={18} className="text-ink-400 hover:text-forest-700" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold truncate ${
                                task.isCompleted ? 'line-through text-ink-400' : 'text-ink-900'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                task.priority === 'high'
                                  ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-100'
                                  : 'bg-ivory-50 text-ink-600 border border-ivory-border'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <p className="text-[11px] text-ink-600 mt-1 leading-relaxed">
                            {task.description}
                          </p>

                          <div className="mt-3 pt-2 border-t border-ivory-border/60 flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-2 text-ink-500">
                              <span className="flex items-center space-x-1 font-mono">
                                <Clock size={12} />
                                <span>{task.estimatedHours}h</span>
                              </span>
                              <span>•</span>
                              <span className="font-mono text-ink-700">{task.relatedSkill}</span>
                            </div>

                            {task.resourceUrl && (
                              <a
                                href={task.resourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-forest-700 hover:underline inline-flex items-center space-x-1 text-[11px] font-medium"
                              >
                                <span>{task.resourceType || 'Resource'}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Regenerate Custom Roadmap */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
          <div className="bg-ivory-50 border border-ivory-border rounded-lg max-w-md w-full p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <h2 className="font-serif text-lg font-bold text-ink-900">Regenerate Roadmap</h2>
              <button
                onClick={() => setShowRegenModal(false)}
                className="text-xs text-ink-400 hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Target Engineering Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Software Engineer">Software Engineer (Generalist)</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Timeline Length</label>
                  <select
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="4">4 Weeks (Accelerated)</option>
                    <option value="6">6 Weeks (Standard)</option>
                    <option value="8">8 Weeks (Comprehensive)</option>
                    <option value="12">12 Weeks (Full Semester)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Hours per Week</label>
                  <select
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="10">10 hrs/week</option>
                    <option value="15">15 hrs/week</option>
                    <option value="20">20 hrs/week</option>
                    <option value="25">25 hrs/week</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-ink-500 italic">
                Regenerating will restructure incomplete tasks to address current gaps while preserving your historical completion events.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="px-3 py-2 rounded border border-ivory-border text-xs font-medium text-ink-700 hover:bg-ivory-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenerating}
                  className="px-4 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 disabled:opacity-50"
                >
                  {regenerating ? 'Synthesizing...' : 'Generate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

