import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Shield,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [readiness, setReadiness] = useState<any>(null);
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [dsaStats, setDsaStats] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [readinessRes, twinRes, dsaRes, interviewRes] = await Promise.all([
          api.get('/analytics/readiness'),
          api.get('/analytics/digital-twin'),
          api.get('/dsa/stats'),
          api.get('/interviews/history'),
        ]);

        if (readinessRes.data.success) setReadiness(readinessRes.data);
        if (twinRes.data.success) setDigitalTwin(twinRes.data.digitalTwin);
        if (dsaRes.data.success) setDsaStats(dsaRes.data.stats);
        if (interviewRes.data.success) setInterviews(interviewRes.data.sessions || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Format data for Recharts
  const pillarData = digitalTwin?.pillars?.map((p: any) => ({
    name: p.pillar,
    score: p.score,
  })) || [];

  const dsaPieData = dsaStats?.difficultyCount ? [
    { name: 'Easy', value: dsaStats.difficultyCount.Easy || 0, color: '#2D6A4F' },
    { name: 'Medium', value: dsaStats.difficultyCount.Medium || 0, color: '#D97706' },
    { name: 'Hard', value: dsaStats.difficultyCount.Hard || 0, color: '#B91C1C' },
  ].filter(d => d.value > 0) : [];

  const interviewTrendData = interviews.map((inv, idx) => ({
    session: `Session ${idx + 1}`,
    score: inv.overallScore,
    type: inv.interviewType,
  })).reverse();

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Career Analytics & Digital Twin
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Dynamic representation of multi-dimensional competencies synthesized from stored database records.
          </p>
        </div>
      </div>

      {/* Career Digital Twin Core Card */}
      {digitalTwin && (
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
            <div>
              <div className="text-[10px] font-semibold text-forest-700 uppercase tracking-wider">
                Continuously Updating Twin
              </div>
              <h2 className="font-serif text-xl font-bold text-ink-900 mt-0.5">
                Target Profile: {digitalTwin.targetRole}
              </h2>
              <div className="text-xs text-ink-500 mt-0.5">
                Aggregate Competence: <span className="font-semibold text-forest-700 font-mono">{digitalTwin.overallCompetencyScore}%</span> across 7 engineering pillars
              </div>
            </div>

            <div className="text-[11px] text-ink-400 font-mono">
              Last synced: {new Date(digitalTwin.lastUpdated).toLocaleDateString()}
            </div>
          </div>

          {/* 7 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {digitalTwin.pillars.map((p: any) => (
              <div key={p.pillar} className="p-3.5 bg-ivory-100/70 border border-ivory-border rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-900">{p.pillar}</span>
                  <span className="font-serif font-bold text-forest-700 font-mono">{p.score}%</span>
                </div>
                {/* Score bar */}
                <div className="w-full bg-ivory-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-forest-700 h-full rounded-full" style={{ width: `${p.score}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-ink-500">
                  <span>{p.evidence}</span>
                  <span className="font-mono text-ink-600 font-medium">{p.confidence} Conf.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Competency Pillars Bar Chart */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-4">
          <div className="pb-3 border-b border-ivory-border">
            <h2 className="font-serif text-base font-bold text-ink-900">Competency by Pillar</h2>
            <p className="text-[11px] text-ink-500">Calculated across verified projects, skills, and assessments</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFD6" vertical={false} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#555F73' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#555F73' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FBFBF9', borderColor: '#E2DFD6', fontSize: '11px' }}
                  cursor={{ fill: '#F5F4EE' }}
                />
                <Bar dataKey="score" fill="#1B4332" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: DSA Problems Solved Distribution */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-4">
          <div className="pb-3 border-b border-ivory-border">
            <h2 className="font-serif text-base font-bold text-ink-900">DSA Problem Solved Distribution</h2>
            <p className="text-[11px] text-ink-500">Distribution by difficulty level</p>
          </div>

          {dsaPieData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dsaPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dsaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FBFBF9', borderColor: '#E2DFD6', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-xs text-ink-700 ml-4 shrink-0 font-mono">
                {dsaPieData.map((d) => (
                  <div key={d.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-ink-500">
              No solved DSA problems recorded yet. Log problems in the DSA tracker to render distribution.
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Mock Interview Trends Over Time */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card space-y-4">
        <div className="pb-3 border-b border-ivory-border">
          <h2 className="font-serif text-base font-bold text-ink-900">Mock Interview Score Progression</h2>
          <p className="text-[11px] text-ink-500">Chronological score trajectory across completed sessions</p>
        </div>

        {interviewTrendData.length > 0 ? (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={interviewTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFD6" vertical={false} />
                <XAxis dataKey="session" tick={{ fontSize: 10, fill: '#555F73' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#555F73' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FBFBF9', borderColor: '#E2DFD6', fontSize: '11px' }} />
                <Line type="monotone" dataKey="score" stroke="#1B4332" strokeWidth={2} dot={{ r: 4, fill: '#1B4332' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-ink-500">
            No mock interview data recorded yet. Complete sessions to track your verbal evaluation progress.
          </div>
        )}
      </div>
    </div>
  );
};

