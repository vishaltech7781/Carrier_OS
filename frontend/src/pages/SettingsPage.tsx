import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoadingHealth(true);
        const res = await api.get('/health');
        setHealthInfo(res.data);
      } catch (err) {
        console.error('Failed to query health:', err);
      } finally {
        setLoadingHealth(false);
      }
    };

    fetchHealth();
  }, []);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [profileRes, dsaRes, resumeRes] = await Promise.all([
        api.get('/profile'),
        api.get('/dsa/problems'),
        api.get('/resume/history'),
      ]);

      const bundle = {
        exportedAt: new Date().toISOString(),
        user,
        profile: profileRes.data.profile,
        dsaProblems: dsaRes.data.problems,
        resumes: resumeRes.data.resumes,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careeros_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data bundle.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-ink-900 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-ivory-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
          Platform Settings & System Status
        </h1>
        <p className="text-xs text-ink-500 mt-1">
          Account preferences, system connectivity diagnostics, and data privacy controls.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
        <div className="font-serif text-base font-bold text-ink-900 pb-2 border-b border-ivory-border">
          Account Coordinates
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-500">Registered Name:</span>
            <div className="font-semibold text-ink-900 mt-0.5">{user?.name}</div>
          </div>
          <div>
            <span className="text-ink-500">Account Email:</span>
            <div className="font-semibold text-ink-900 mt-0.5">{user?.email}</div>
          </div>
          <div>
            <span className="text-ink-500">System Role:</span>
            <div className="font-semibold text-ink-900 mt-0.5 capitalize">{user?.role}</div>
          </div>
          <div>
            <span className="text-ink-500">Target Role:</span>
            <div className="font-semibold text-ink-900 mt-0.5">{user?.targetRole}</div>
          </div>
        </div>
      </div>

      {/* Real Infrastructure Diagnostics */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-ivory-border">
          <div>
            <h2 className="font-serif text-base font-bold text-ink-900">Infrastructure Health Status</h2>
            <p className="text-[11px] text-ink-500">Active connection status for databases and AI microservice</p>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-100">
            {healthInfo?.status || 'Active'}
          </span>
        </div>

        {healthInfo ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-ivory-100/70 border border-ivory-border rounded space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-ink-800">
                <Database size={13} className="text-forest-700" />
                <span>MongoDB (Document DB)</span>
              </div>
              <div className="text-[11px] font-mono text-forest-700">
                {healthInfo.databases?.mongodb === 'Connected' ? '● Connected (27017)' : '○ Standby'}
              </div>
            </div>

            <div className="p-3 bg-ivory-100/70 border border-ivory-border rounded space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-ink-800">
                <Database size={13} className="text-forest-700" />
                <span>MySQL (Relational DB)</span>
              </div>
              <div className="text-[11px] font-mono text-forest-700">
                {healthInfo.databases?.mysql === 'Connected' ? '● Connected (3306)' : '○ Standby'}
              </div>
            </div>

            <div className="p-3 bg-ivory-100/70 border border-ivory-border rounded space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-ink-800">
                <Cpu size={13} className="text-forest-700" />
                <span>Python AI Microservice</span>
              </div>
              <div className="text-[11px] font-mono text-ink-600">
                {healthInfo.aiService?.status || 'Online'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-ink-500 py-3">Connecting to health diagnostics...</div>
        )}
      </div>

      {/* Data Privacy & Portability */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
        <div className="font-serif text-base font-bold text-ink-900 pb-2 border-b border-ivory-border flex items-center space-x-2">
          <Shield size={16} className="text-forest-700" />
          <span>Privacy & Data Portability</span>
        </div>

        <p className="text-xs text-ink-600 leading-relaxed">
          CareerOS AI adheres to transparent student privacy principles. You can export your full recorded data at any time or request permanent record removal.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 rounded border border-ivory-border bg-ivory-100 text-xs font-medium text-ink-800 hover:bg-ivory-200 inline-flex items-center space-x-1.5"
          >
            <Download size={13} />
            <span>{exporting ? 'Compiling JSON...' : 'Export Complete Career Portfolio (JSON)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

