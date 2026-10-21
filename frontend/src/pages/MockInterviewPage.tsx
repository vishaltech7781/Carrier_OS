import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Mic,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  History,
} from 'lucide-react';

export const MockInterviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'session' | 'history'>('session');
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Setup Form
  const [role, setRole] = useState('Full Stack Developer');
  const [interviewType, setInterviewType] = useState('backend');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState('3');
  const [loading, setLoading] = useState(false);

  // Active Answering State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<any>(null);
  const [completedReport, setCompletedReport] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/interviews/history');
      if (res.data.success) {
        setHistory(res.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load interview history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCompletedReport(null);
    setLatestEvaluation(null);
    try {
      const res = await api.post('/interviews/start', {
        role,
        interviewType,
        difficulty,
        questionCount: Number(questionCount),
      });

      if (res.data.success) {
        // Fetch full session details
        const sessionRes = await api.get(`/interviews/${res.data.session.id}`);
        setSession(sessionRes.data.session);
        setCurrentQuestionIndex(0);
        setStudentAnswer('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      setError('Please provide a substantive answer to evaluate.');
      return;
    }

    setEvaluating(true);
    setError('');
    try {
      const currentQ = session.questions[currentQuestionIndex];
      const res = await api.post(`/interviews/${session._id}/answer`, {
        questionNumber: currentQ.questionNumber,
        answer: studentAnswer,
      });

      if (res.data.success) {
        setLatestEvaluation(res.data.evaluation);
        // Update local question data
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQuestionIndex].score = res.data.evaluation.score;
        updatedQuestions[currentQuestionIndex].studentAnswer = studentAnswer;
        setSession({ ...session, questions: updatedQuestions });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setLatestEvaluation(null);
    setStudentAnswer('');
    if (currentQuestionIndex + 1 < session.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/interviews/${session._id}/finish`);
      if (res.data.success) {
        setCompletedReport(res.data.session);
        setSession(null);
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to finish session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Interactive AI Mock Interview
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Deterministic concept grounding evaluates accuracy, completeness, and architectural trade-offs.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 p-1 bg-ivory-200/70 border border-ivory-border rounded text-xs font-medium">
          <button
            onClick={() => setActiveTab('session')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'session' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Practice Session
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'history' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Past Sessions ({history.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs">
          {error}
        </div>
      )}

      {/* SESSION TAB */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          {/* STATE 1: SETUP FORM */}
          {!session && !completedReport && (
            <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card max-w-2xl mx-auto space-y-5">
              <div className="border-b border-ivory-border pb-4">
                <h2 className="font-serif text-lg font-bold text-ink-900">Configure Mock Interview</h2>
                <p className="text-xs text-ink-500 mt-1">
                  Select your target role and technical evaluation focus to begin a tailored turn-based session.
                </p>
              </div>

              <form onSubmit={handleStartSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Target Engineering Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Software Engineer">Software Engineer (Generalist)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-800 mb-1">Technical Domain Focus</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                    >
                      <option value="backend">Backend Architecture & APIs</option>
                      <option value="frontend">Frontend Architecture & React</option>
                      <option value="system_design">Distributed System Design</option>
                      <option value="dsa">Algorithmic & Problem Solving</option>
                      <option value="behavioral">Behavioral (STAR Method)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-800 mb-1">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                    >
                      <option value="Junior">Junior / Graduate</option>
                      <option value="Intermediate">Intermediate (1-2 yrs)</option>
                      <option value="Senior">Senior Conceptual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                  >
                    <option value="2">2 Questions (Fast Drill)</option>
                    <option value="3">3 Questions (Standard)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Mic size={14} />
                  <span>{loading ? 'Initializing Session...' : 'Start Interview Session'}</span>
                </button>
              </form>
            </div>
          )}

          {/* STATE 2: ACTIVE QUESTION RUNNER */}
          {session && (
            <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card space-y-6">
              {/* Question Progress Header */}
              <div className="flex items-center justify-between pb-4 border-b border-ivory-border text-xs">
                <div>
                  <span className="font-semibold text-forest-700 uppercase tracking-wide text-[10px]">
                    Question {currentQuestionIndex + 1} of {session.questions.length}
                  </span>
                  <div className="text-ink-500 font-mono text-[11px] mt-0.5">
                    {session.role} • {session.interviewType.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center space-x-1 font-mono text-xs text-ink-600 bg-ivory-200/60 px-2.5 py-1 rounded">
                  <Clock size={12} />
                  <span>Self-Paced Written Response</span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="p-4 bg-ivory-100/70 border border-ivory-border rounded">
                <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Prompt</div>
                <div className="font-serif text-lg font-bold text-ink-900 leading-snug">
                  {session.questions[currentQuestionIndex]?.question}
                </div>
              </div>

              {/* Answering Area or Evaluation View */}
              {!latestEvaluation ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-800 mb-1">
                      Your Technical Answer
                    </label>
                    <textarea
                      rows={7}
                      required
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Explain your approach clearly. Mention definitions, runtime mechanics, practical examples, and architectural trade-offs..."
                      className="w-full text-xs p-3 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-ink-500">
                      Evaluated on technical precision, completeness, and structured delivery.
                    </span>
                    <button
                      type="submit"
                      disabled={evaluating || !studentAnswer.trim()}
                      className="px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{evaluating ? 'Grading Concept Grounding...' : 'Submit Answer for Grading'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Instant Question Evaluation Card */
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-forest-50/70 border border-forest-100 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-forest-800 uppercase tracking-wide">
                        Response Evaluated
                      </div>
                      <div className="font-serif text-3xl font-bold text-forest-700 font-mono mt-0.5">
                        {latestEvaluation.score} / 100
                      </div>
                      <div className="text-[11px] text-ink-600 mt-1">
                        Accuracy: {latestEvaluation.technicalAccuracy}% • Completeness: {latestEvaluation.completeness}% • Clarity: {latestEvaluation.clarity}%
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-2 self-start sm:self-auto"
                    >
                      <span>
                        {currentQuestionIndex + 1 < session.questions.length ? 'Next Question' : 'Finish Session & Generate Report'}
                      </span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Observations & Missing Concepts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-ivory-100/60 border border-ivory-border rounded space-y-1.5">
                      <div className="font-semibold text-forest-800 flex items-center space-x-1">
                        <CheckCircle2 size={14} className="text-forest-700" />
                        <span>Positive Observations</span>
                      </div>
                      <ul className="space-y-1 text-ink-700 text-[11px]">
                        {latestEvaluation.positivePoints?.map((p: string, idx: number) => (
                          <li key={idx}>• {p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-ivory-100/60 border border-ivory-border rounded space-y-1.5">
                      <div className="font-semibold text-terracotta-800 flex items-center space-x-1">
                        <AlertCircle size={14} className="text-terracotta-700" />
                        <span>Missing Core Concepts</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {latestEvaluation.missingConcepts?.map((c: string) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-ivory-50 border border-terracotta-100 text-terracotta-700 text-[10px] font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Model Answer Outline */}
                  <div className="p-3.5 bg-ivory-100/60 border border-ivory-border rounded text-xs">
                    <div className="font-semibold text-ink-900 mb-1">Recommended Response Outline:</div>
                    <div className="text-[11px] text-ink-600 leading-relaxed font-mono">
                      {latestEvaluation.modelAnswerOutline}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: COMPLETED REPORT CARD */}
          {completedReport && (
            <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-forest-700 uppercase tracking-wider">
                    Interview Session Completed
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-ink-900 mt-0.5">
                    Performance Report Card
                  </h2>
                  <div className="text-xs text-ink-500 mt-1">
                    {completedReport.role} • {completedReport.interviewType.toUpperCase()} ({completedReport.difficulty})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
                    Aggregate Session Score
                  </div>
                  <div className="font-serif text-4xl font-bold text-forest-700 font-mono">
                    {completedReport.overallScore} / 100
                  </div>
                </div>
              </div>

              {/* Question By Question Summary */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-ink-800">Evaluated Questions</div>
                {completedReport.questions?.map((q: any) => (
                  <div key={q.questionNumber} className="p-3 bg-ivory-100/70 border border-ivory-border rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900">Q{q.questionNumber}: {q.question}</span>
                      <span className="font-mono text-forest-700 font-bold">{q.score}/100</span>
                    </div>
                    <p className="text-[11px] text-ink-600 italic">"{q.studentAnswer}"</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-ivory-border flex items-center justify-between">
                <button
                  onClick={() => setCompletedReport(null)}
                  className="px-4 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800"
                >
                  Start Another Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-3">
          <div className="text-xs font-semibold text-ink-800 mb-2">Recorded Interview Sessions</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h._id} className="p-3 bg-ivory-100/70 border border-ivory-border rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-ink-900 uppercase text-[11px]">
                      {h.interviewType} Interview ({h.difficulty})
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5">
                      {new Date(h.createdAt).toLocaleDateString()} • {h.questions?.length || 0} questions • Status: {h.status}
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-forest-700 font-mono">
                    {h.overallScore}/100
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-ink-500">
              No interview sessions recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

