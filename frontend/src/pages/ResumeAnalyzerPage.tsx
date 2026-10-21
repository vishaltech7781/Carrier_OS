import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Plus,
  ExternalLink,
  Shield,
} from 'lucide-react';

export const ResumeAnalyzerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [syncToProfile, setSyncToProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sourceInfo, setSourceInfo] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/resume/history');
      if (res.data.success) {
        setHistory(res.data.resumes || []);
        if (res.data.resumes.length > 0 && !analysisResult) {
          setAnalysisResult(res.data.resumes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load resume history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a PDF or TXT resume document.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAnalysisResult(res.data.resume);
        setSourceInfo(res.data.source);
        setMessage({ type: 'success', text: 'Resume document analyzed and indexed successfully.' });
        fetchHistory();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to process resume.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTextParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setMessage({ type: 'error', text: 'Please enter or paste your resume content.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/resume/parse-text', {
        rawText,
        syncToProfile,
      });

      if (res.data.success) {
        setAnalysisResult(res.data.resume);
        setSourceInfo(res.data.source);
        setMessage({ type: 'success', text: 'Resume text extracted and analyzed successfully.' });
        fetchHistory();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to analyze text.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume analysis?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setMessage({ type: 'success', text: 'Resume record and extracted skills deleted permanently.' });
      if (analysisResult?._id === id) {
        setAnalysisResult(null);
      }
      fetchHistory();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete resume record.' });
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Resume Extraction & Analysis Pipeline
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Deterministic technical skills normalization, project architecture detection, and completeness scoring.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 p-1 bg-ivory-200/70 border border-ivory-border rounded text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'upload' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'text' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'history' ? 'bg-ivory-50 text-ink-900 shadow-subtle' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs border ${
            message.type === 'success'
              ? 'bg-forest-50 border-forest-100 text-forest-800'
              : 'bg-terracotta-50 border-terracotta-100 text-terracotta-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Input Section */}
      {activeTab === 'upload' && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card">
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-ivory-border hover:border-forest-400 rounded-lg p-8 text-center bg-ivory-100/50 transition-colors">
              <Upload size={32} className="text-ink-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-ink-800">
                {selectedFile ? selectedFile.name : 'Select or drop your PDF resume document'}
              </div>
              <div className="text-[11px] text-ink-500 mt-1">Supports standard PDF up to 10MB</div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="mt-4 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-ivory-border file:text-xs file:font-medium file:bg-ivory-50 file:text-ink-800 hover:file:bg-ivory-200"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-ink-600">
                <Shield size={14} className="text-forest-700" />
                <span>Privacy guaranteed: documents are parsed in memory with full deletion control.</span>
              </div>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing Document...' : 'Run Extraction Engine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card">
          <form onSubmit={handleTextParse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">
                Paste Plain Text Resume
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the plain-text content of your resume here, including education, technical skills, projects, and experience..."
                className="w-full text-xs p-3 rounded border border-ivory-border bg-ivory-100 font-mono text-ink-900 focus:border-forest-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToProfile}
                  onChange={(e) => setSyncToProfile(e.target.checked)}
                  className="rounded border-ivory-border text-forest-700 focus:ring-forest-700"
                />
                <span>Automatically sync verified technical skills to my Career Profile</span>
              </label>

              <button
                type="submit"
                disabled={loading || !rawText.trim()}
                className="px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Parsing Content...' : 'Parse & Categorize'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-3">
          <div className="text-xs font-semibold text-ink-800 mb-2">Previous Resume Extractions</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-ivory-100/70 border border-ivory-border rounded flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <FileText size={18} className="text-forest-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-ink-900">{item.filename}</div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()} • {item.skills?.length || 0} skills detected • Completeness: {item.completenessScore}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setAnalysisResult(item);
                        setActiveTab('upload');
                      }}
                      className="px-2.5 py-1 rounded border border-ivory-border bg-ivory-50 text-ink-700 hover:bg-ivory-200 text-[11px]"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 rounded text-ink-400 hover:text-terracotta-700 hover:bg-terracotta-50 transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-ink-500">
              No previous analyses recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 pt-2">
          {/* Top Summary Card */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-4">
              <div>
                <span className="text-[10px] font-semibold text-forest-700 uppercase tracking-wider">
                  Verified Analysis Record
                </span>
                <h2 className="font-serif text-2xl font-bold text-ink-900 mt-0.5">
                  {analysisResult.candidateName || 'Candidate Profile'}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 mt-1">
                  {analysisResult.email && <span>Email: {analysisResult.email}</span>}
                  {analysisResult.phone && <span>Phone: {analysisResult.phone}</span>}
                  {analysisResult.githubUrl && (
                    <a href={analysisResult.githubUrl} target="_blank" rel="noreferrer" className="text-forest-700 hover:underline inline-flex items-center space-x-1">
                      <span>GitHub</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {/* Completeness Badge */}
              <div className="sm:text-right">
                <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
                  Completeness Indicator
                </div>
                <div className="font-serif text-3xl font-bold text-forest-700 font-mono">
                  {analysisResult.completenessScore}%
                </div>
                <div className="text-[11px] text-ink-500">Not a black-box ATS score</div>
              </div>
            </div>

            {sourceInfo && (
              <div className="mt-3 text-[11px] text-ink-500 italic">
                Extraction Pipeline Source: {sourceInfo}
              </div>
            )}
          </div>

          {/* Categorized Skills Breakdown */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <div>
                <h3 className="font-serif text-base font-bold text-ink-900">
                  Extracted Technical Taxonomy ({analysisResult.skills?.length || 0} recognized)
                </h3>
                <p className="text-[11px] text-ink-500">
                  Normalized against industry synonyms (e.g., JS → JavaScript, K8s → Kubernetes)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.skillsByCategory && Object.keys(analysisResult.skillsByCategory).length > 0 ? (
                Object.entries(analysisResult.skillsByCategory).map(([category, skills]: [string, any]) => (
                  <div key={category} className="p-3.5 bg-ivory-100/60 border border-ivory-border rounded">
                    <div className="text-xs font-semibold text-ink-800 mb-2">{category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-ivory-50 border border-ivory-border text-xs font-mono text-ink-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-ink-500 py-3">No skills could be categorized into standard taxonomy.</div>
              )}
            </div>
          </div>

          {/* Projects and Technical Evidence */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-ivory-border">
              <h3 className="font-serif text-base font-bold text-ink-900">
                Documented Engineering Projects ({analysisResult.projects?.length || 0})
              </h3>
              <p className="text-[11px] text-ink-500">
                Identified project sections and tech stack mentions
              </p>
            </div>

            {analysisResult.projects && analysisResult.projects.length > 0 ? (
              <div className="space-y-3">
                {analysisResult.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 bg-ivory-100/60 border border-ivory-border rounded text-xs space-y-1.5">
                    <div className="font-semibold text-ink-900 text-sm">{proj.title}</div>
                    <p className="text-ink-600 leading-relaxed">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[11px] text-ink-500">Tech Stack:</span>
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t: string) => (
                            <span key={t} className="px-1.5 py-0.2 rounded bg-forest-50 border border-forest-100 text-[10px] font-mono text-forest-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink-500 py-4">No project blocks detected in conventional format.</div>
            )}
          </div>

          {/* Actionable Feedback: Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
              <div className="font-serif text-sm font-bold text-forest-800 flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-forest-700" />
                <span>Verified Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-ink-700">
                {analysisResult.strengths?.map((str: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-forest-700 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Recommendations */}
            <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-3">
              <div className="font-serif text-sm font-bold text-ochre-700 flex items-center space-x-2">
                <AlertCircle size={16} className="text-ochre-600" />
                <span>Actionable Recommendations</span>
              </div>
              <ul className="space-y-2 text-xs text-ink-700">
                {analysisResult.improvementRecommendations?.map((imp: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-ochre-600 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

