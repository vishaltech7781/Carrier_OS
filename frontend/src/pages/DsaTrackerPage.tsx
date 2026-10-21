import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Code2,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Filter,
  BarChart2,
  Star,
} from 'lucide-react';

export const DsaTrackerPage: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('C++');
  const [status, setStatus] = useState('Solved');
  const [timeSpent, setTimeSpent] = useState('30');
  const [confidence, setConfidence] = useState('4');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedTopic) params.topic = selectedTopic;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedStatus) params.status = selectedStatus;

      const [probRes, statsRes] = await Promise.all([
        api.get('/dsa/problems', { params }),
        api.get('/dsa/stats'),
      ]);

      if (probRes.data.success) {
        setProblems(probRes.data.problems || []);
        if (probRes.data.topicsList) setTopicsList(probRes.data.topicsList);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to load DSA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [selectedTopic, selectedDifficulty, selectedStatus]);

  const handleLogProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/dsa/log', {
        title,
        topic,
        difficulty,
        programmingLanguage: language,
        status,
        timeSpentMinutes: Number(timeSpent),
        confidenceRating: Number(confidence),
        sourceUrl,
        notes,
      });

      setShowLogModal(false);
      setTitle('');
      setNotes('');
      setSourceUrl('');
      fetchProblems();
    } catch (err) {
      console.error('Failed to log problem:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this problem entry?')) return;
    try {
      await api.delete(`/dsa/problems/${id}`);
      fetchProblems();
    } catch (err) {
      console.error('Failed to delete problem:', err);
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            DSA Practice & Algorithmic Tracker
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Structured tracking across 15 core computer science topic domains. Persistent in relational MySQL storage.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-3.5 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-subtle"
        >
          <Plus size={14} />
          <span>Log Problem Attempt</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Total Solved</div>
            <div className="font-serif text-3xl font-bold text-forest-700 font-mono mt-1">
              {stats.totalSolved}
            </div>
            <div className="text-[11px] text-ink-500 mt-1 font-mono">
              / {stats.totalAttempted} attempted ({stats.successRate}% rate)
            </div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Current Streak</div>
            <div className="font-serif text-3xl font-bold text-ink-900 font-mono mt-1 flex items-center space-x-1">
              <span>{stats.currentStreak}</span>
              <span className="text-sm font-sans font-normal text-ink-500">days</span>
            </div>
            <div className="text-[11px] text-forest-700 mt-1 flex items-center space-x-1 font-medium">
              <Flame size={12} />
              <span>Consecutive practice</span>
            </div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Difficulty Split</div>
            <div className="mt-2 flex items-center space-x-3 text-xs font-mono">
              <span className="text-forest-700 font-semibold">{stats.difficultyCount?.Easy || 0}E</span>
              <span className="text-ochre-700 font-semibold">{stats.difficultyCount?.Medium || 0}M</span>
              <span className="text-terracotta-700 font-semibold">{stats.difficultyCount?.Hard || 0}H</span>
            </div>
            <div className="text-[11px] text-ink-500 mt-1">Solved distribution</div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Recommended Next</div>
            <div className="font-semibold text-xs text-ink-900 mt-2 truncate">
              {stats.recommendedNextTopic}
            </div>
            <div className="text-[11px] text-ink-500 mt-0.5">Focus on weak area</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1 text-ink-500 font-medium">
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-ink-800 text-xs"
        >
          <option value="">All 15 Topics</option>
          {topicsList.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-ink-800 text-xs"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-ink-800 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="Solved">Solved</option>
          <option value="Attempted">Attempted</option>
          <option value="Revisiting">Revisiting</option>
        </select>

        {(selectedTopic || selectedDifficulty || selectedStatus) && (
          <button
            onClick={() => { setSelectedTopic(''); setSelectedDifficulty(''); setSelectedStatus(''); }}
            className="text-[11px] text-ink-500 hover:text-ink-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Problems Table */}
      <div className="bg-ivory-50 border border-ivory-border rounded shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-200/60 border-b border-ivory-border text-ink-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Time Spent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-border">
              {problems.length > 0 ? (
                problems.map((p) => (
                  <tr key={p.id} className="hover:bg-ivory-100/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-ink-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{p.title}</span>
                        {p.sourceUrl && (
                          <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-forest-700">
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      {p.notes && <div className="text-[11px] text-ink-500 italic mt-0.5">{p.notes}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-700">{p.topic}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        p.difficulty === 'Easy' ? 'bg-forest-50 text-forest-800 border border-forest-100'
                        : p.difficulty === 'Medium' ? 'bg-ochre-50 text-ochre-800 border border-ochre-100'
                        : 'bg-terracotta-50 text-terracotta-800 border border-terracotta-100'
                      }`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-600">{p.programmingLanguage}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 font-medium ${
                        p.status === 'Solved' ? 'text-forest-700' : 'text-ochre-700'
                      }`}>
                        {p.status === 'Solved' && <CheckCircle2 size={13} />}
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-700">
                      {'★'.repeat(p.confidenceRating)}{'☆'.repeat(5 - p.confidenceRating)}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-600">{p.timeSpentMinutes}m</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-ink-400 hover:text-terracotta-700 p-1 rounded"
                        title="Delete problem"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-ink-500">
                    No DSA problems logged under current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Problem */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
          <div className="bg-ivory-50 border border-ivory-border rounded-lg max-w-md w-full p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <h2 className="font-serif text-lg font-bold text-ink-900">Log DSA Problem Solution</h2>
              <button onClick={() => setShowLogModal(false)} className="text-xs text-ink-400 hover:text-ink-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleLogProblem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3Sum / Two Pointer Pattern"
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    {topicsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Programming Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="Solved">Solved</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Revisiting">Revisiting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Time Spent (mins)</label>
                  <input
                    type="number"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Confidence (1 to 5)</label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="5">5 - Mastered</option>
                    <option value="4">4 - High Confidence</option>
                    <option value="3">3 - Moderate</option>
                    <option value="2">2 - Needed Hints</option>
                    <option value="1">1 - Struggled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Problem URL (Optional)</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Notes & Edge Cases (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key observations (e.g. handle duplicate elements by skipping identical pointers)..."
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded border border-ivory-border text-xs text-ink-700 hover:bg-ivory-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Log Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

