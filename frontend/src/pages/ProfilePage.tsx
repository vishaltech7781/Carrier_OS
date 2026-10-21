import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming Languages');

  // New Project Form
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/profile', profile);
      if (res.data.success) {
        setProfile(res.data.profile);
        setMessage({ type: 'success', text: 'Student profile updated successfully.' });
        refreshUser();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = profile.skills.some((s: any) => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;

    setProfile({
      ...profile,
      skills: [
        ...profile.skills,
        {
          name: newSkillName.trim(),
          category: newSkillCategory,
          proficiencyLevel: 'Intermediate',
          isVerified: false,
          evidenceSource: 'Profile',
        },
      ],
    });
    setNewSkillName('');
  };

  const handleRemoveSkill = (name: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s: any) => s.name !== name),
    });
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim() || !newProjectDesc.trim()) return;
    setProfile({
      ...profile,
      projects: [
        ...profile.projects,
        {
          title: newProjectTitle.trim(),
          description: newProjectDesc.trim(),
          technologies: newProjectTech.split(',').map(s => s.trim()).filter(Boolean),
        },
      ],
    });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectTech('');
  };

  const handleRemoveProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_: any, i: number) => i !== index),
    });
  };

  if (loading || !profile) {
    return <div className="text-xs text-ink-500 py-12 text-center">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Student Engineering Profile
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Maintain your verified skills taxonomy, project portfolio, and placement preferences.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-4 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50 shadow-subtle"
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
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

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Personal */}
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
          <div className="font-serif text-base font-bold text-ink-900 pb-2 border-b border-ivory-border flex items-center space-x-2">
            <User size={16} className="text-forest-700" />
            <span>Personal & Academic Details</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">Target Engineering Role</label>
              <select
                value={profile.targetRole || 'Full Stack Developer'}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Software Engineer">Software Engineer (Generalist)</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">College / University</label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Degree</label>
                <input
                  type="text"
                  value={profile.degree || ''}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={profile.graduationYear || 2026}
                  onChange={(e) => setProfile({ ...profile, graduationYear: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Work Mode</label>
                <select
                  value={profile.preferredWorkMode || 'Remote'}
                  onChange={(e) => setProfile({ ...profile, preferredWorkMode: e.target.value })}
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Weekly Learning Hours</label>
                <input
                  type="number"
                  value={profile.weeklyLearningHours || 15}
                  onChange={(e) => setProfile({ ...profile, weeklyLearningHours: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full text-xs p-2 rounded border border-ivory-border bg-ivory-100 text-ink-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Skills & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Section */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-border">
              <div>
                <h2 className="font-serif text-base font-bold text-ink-900">Technical Skills ({profile.skills?.length || 0})</h2>
                <p className="text-[11px] text-ink-500">Distinguishes verified resume/project skills from claimed skills</p>
              </div>
            </div>

            {/* Current Skills Badges */}
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((sk: any) => (
                <span
                  key={sk.name}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono border ${
                    sk.isVerified
                      ? 'bg-forest-50 border-forest-200 text-forest-800 font-semibold'
                      : 'bg-ivory-100 border-ivory-border text-ink-700'
                  }`}
                >
                  <span>{sk.name}</span>
                  {sk.isVerified && <span title="Verified Evidence"><CheckCircle2 size={11} className="text-forest-700" /></span>}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk.name)}
                    className="text-ink-400 hover:text-terracotta-700 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Row */}
            <div className="pt-3 border-t border-ivory-border/70 flex flex-wrap gap-2 items-center text-xs">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add skill (e.g. Docker, Redis)"
                className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-xs w-48 text-ink-900"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-800"
              >
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Databases">Databases</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Computer Science Fundamentals">Computer Science Fundamentals</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Projects Portfolio */}
          <div className="bg-ivory-50 border border-ivory-border rounded p-6 shadow-card space-y-4">
            <div className="pb-2 border-b border-ivory-border">
              <h2 className="font-serif text-base font-bold text-ink-900">Engineering Projects ({profile.projects?.length || 0})</h2>
              <p className="text-[11px] text-ink-500">Provides tangible evidence for your Career Digital Twin</p>
            </div>

            <div className="space-y-3">
              {profile.projects?.map((proj: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-ivory-100/70 border border-ivory-border rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-900 text-sm">{proj.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-ink-400 hover:text-terracotta-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-ink-600 leading-relaxed text-[11px]">{proj.description}</p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-forest-50 border border-forest-100 text-[10px] font-mono text-forest-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Project Form */}
            <div className="pt-3 border-t border-ivory-border/70 space-y-2">
              <div className="text-xs font-semibold text-ink-800">Add New Project</div>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Project title (e.g. Distributed Task Queue)"
                className="w-full p-2 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-900"
              />
              <textarea
                rows={2}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Architecture description and engineering challenges solved..."
                className="w-full p-2 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-900"
              />
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={newProjectTech}
                  onChange={(e) => setNewProjectTech(e.target.value)}
                  placeholder="Tech stack comma-separated (e.g. Node.js, Redis, Docker)"
                  className="w-full p-2 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-900 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 shrink-0"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
