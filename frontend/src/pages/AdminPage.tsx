import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  FileText,
  Mic,
  Database,
  Plus,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend Development');
  const [newSkillAliases, setNewSkillAliases] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, skillsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/skills'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (usersRes.data.success) setUsers(usersRes.data.users || []);
        if (skillsRes.data.success) setSkills(skillsRes.data.skills || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Access restricted. Administrator privileges required.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    } else {
      setError('Access Denied. You must be signed in as an administrator.');
      setLoading(false);
    }
  }, [user]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      const res = await api.post('/admin/skills', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        aliases: newSkillAliases.split(',').map(s => s.trim()).filter(Boolean),
      });

      if (res.data.success) {
        setSkills(prev => [...prev, res.data.skill]);
        setNewSkillName('');
        setNewSkillAliases('');
      }
    } catch (err) {
      alert('Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-ivory-50 border border-ivory-border rounded p-8 text-center max-w-md mx-auto my-12 shadow-card space-y-3">
        <Lock size={32} className="text-terracotta-700 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-ink-900">Administrator Clearance Required</h2>
        <p className="text-xs text-ink-600 leading-relaxed">
          The Admin Dashboard is protected by backend server-side authorization. Sign in using the Administrator Demo button on the login screen to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Platform Administration
            </h1>
            <span className="px-2 py-0.5 rounded bg-ochre-50 border border-ochre-100 text-[10px] font-semibold text-ochre-800 uppercase">
              Admin Mode
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Real platform activity metrics, user directory, and canonical technical skill taxonomy management.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs">
          {error}
        </div>
      )}

      {/* Aggregate Platform Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Registered Accounts</div>
            <div className="font-serif text-3xl font-bold text-forest-700 font-mono mt-1">
              {stats.totalUsers}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">
              {stats.studentUsers} student candidates
            </div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Resumes Analyzed</div>
            <div className="font-serif text-3xl font-bold text-ink-900 font-mono mt-1">
              {stats.resumesAnalyzed}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">Full pipeline extractions</div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Interviews Graded</div>
            <div className="font-serif text-3xl font-bold text-ink-900 font-mono mt-1">
              {stats.interviewsCompleted}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">AI heuristic evaluations</div>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-4 shadow-card">
            <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">DSA Problems Logged</div>
            <div className="font-serif text-3xl font-bold text-ink-900 font-mono mt-1">
              {stats.dsaProblemsLogged}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">Across 15 core topics</div>
          </div>
        </div>
      )}

      {/* Section 1: Registered Users Directory */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
        <div className="pb-3 border-b border-ivory-border">
          <h2 className="font-serif text-base font-bold text-ink-900">User Accounts Directory ({users.length})</h2>
          <p className="text-[11px] text-ink-500">Persisted in MongoDB User collection</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-200/60 border-b border-ivory-border text-ink-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Target Role</th>
                <th className="py-2.5 px-3">Readiness</th>
                <th className="py-2.5 px-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-ivory-100/50">
                  <td className="py-2.5 px-3 font-semibold text-ink-900">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-ink-600">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      u.role === 'admin' ? 'bg-ochre-50 text-ochre-800 border border-ochre-100' : 'bg-forest-50 text-forest-800 border border-forest-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink-800">{u.targetRole}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-forest-700">{u.readinessScore}%</td>
                  <td className="py-2.5 px-3 text-ink-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Manage Technical Skill Taxonomy */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
        <div className="pb-3 border-b border-ivory-border">
          <h2 className="font-serif text-base font-bold text-ink-900">Canonical Technical Skills Taxonomy ({skills.length})</h2>
          <p className="text-[11px] text-ink-500">Persisted in relational MySQL Skill table</p>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="p-4 bg-ivory-100/70 border border-ivory-border rounded grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
          <div>
            <label className="block text-[11px] font-semibold text-ink-800 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. GraphQL"
              className="w-full p-2 rounded border border-ivory-border bg-ivory-50 text-ink-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-800 mb-1">Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full p-2 rounded border border-ivory-border bg-ivory-50 text-ink-900"
            >
              <option value="Programming Languages">Programming Languages</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend Development">Backend Development</option>
              <option value="Databases">Databases</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Computer Science Fundamentals">Computer Science Fundamentals</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-800 mb-1">Aliases (comma-separated)</label>
            <input
              type="text"
              value={newSkillAliases}
              onChange={(e) => setNewSkillAliases(e.target.value)}
              placeholder="apollo, gql"
              className="w-full p-2 rounded border border-ivory-border bg-ivory-50 text-ink-900 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={addingSkill}
            className="w-full py-2 px-3 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 disabled:opacity-50"
          >
            {addingSkill ? 'Saving...' : '+ Add to Taxonomy'}
          </button>
        </form>

        {/* Existing Skills Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((s) => (
            <span
              key={s.id}
              className="px-2.5 py-1 rounded bg-ivory-100 border border-ivory-border text-xs font-mono text-ink-800 flex items-center space-x-1"
            >
              <span className="font-semibold">{s.name}</span>
              <span className="text-[10px] text-ink-500">({s.category})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

