import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, Briefcase, Code, BarChart2 } from 'lucide-react';

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
  'MongoDB', 'SQL', 'MySQL', 'Python', 'Docker', 'Git',
  'Tailwind CSS', 'Redis', 'DSA', 'System Design', 'C++', 'Java'
];

export const OnboardingWizardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Academics
  const [fullName, setFullName] = useState(user?.name || '');
  const [college, setCollege] = useState('College of Engineering');
  const [degree, setDegree] = useState('B.Tech / B.E. Computer Science');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Step 2: Role & Preferences
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
  const [preferredWorkMode, setPreferredWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site' | 'Flexible'>('Remote');
  const [weeklyHours, setWeeklyHours] = useState('15');

  // Step 3: Technical Skills & Projects
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript', 'React', 'Git']);
  const [projectTitle, setProjectTitle] = useState('Ling Yatra Platform');
  const [projectDesc, setProjectDesc] = useState('Full stack web application engineered with React, TypeScript, Node.js, and MongoDB.');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const skillsFormatted = selectedSkills.map(s => ({
        name: s,
        category: s === 'JavaScript' || s === 'TypeScript' || s === 'Python' || s === 'C++' ? 'Programming Languages'
          : s === 'React' || s === 'Tailwind CSS' ? 'Frontend Development'
          : s === 'Node.js' || s === 'Express' ? 'Backend Development'
          : s === 'MongoDB' || s === 'SQL' || s === 'MySQL' || s === 'Redis' ? 'Databases'
          : s === 'Docker' || s === 'Git' ? 'Cloud & DevOps'
          : 'Computer Science Fundamentals',
        proficiencyLevel: 'Intermediate',
        isVerified: false,
        evidenceSource: 'Profile',
      }));

      const projectsFormatted = projectTitle ? [
        {
          title: projectTitle,
          description: projectDesc,
          technologies: selectedSkills.slice(0, 4),
        }
      ] : [];

      await api.post('/profile/onboarding', {
        fullName,
        college,
        degree,
        graduationYear: Number(graduationYear),
        targetRole,
        preferredWorkMode,
        weeklyLearningHours: Number(weeklyHours),
        skills: skillsFormatted,
        projects: projectsFormatted,
      });

      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 py-12 px-4 sm:px-6 lg:px-8 text-ink-900">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            <span>Career Setup Wizard — Step {step} of 4</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            {step === 1 && 'Academic & Educational Background'}
            {step === 2 && 'Target Role & Time Commitment'}
            {step === 3 && 'Verified Skills & Technical Projects'}
            {step === 4 && 'Initial Readiness Assessment Review'}
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            CareerOS uses this data to calibrate your personalized curriculum and benchmark match.
          </p>

          {/* Stepper bar */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-10 bg-forest-700' : i < step ? 'w-6 bg-forest-400' : 'w-6 bg-ivory-border'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs">
            {error}
          </div>
        )}

        <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026 (Final Year)</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">College or University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">Target Software Engineering Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Software Engineer">Software Engineer (Generalist)</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Preferred Work Mode</label>
                  <select
                    value={preferredWorkMode}
                    onChange={(e) => setPreferredWorkMode(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Weekly Learning Hours Commitment</label>
                  <select
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  >
                    <option value="10">10 hours / week (~1.5 hrs/day)</option>
                    <option value="15">15 hours / week (~2 hrs/day)</option>
                    <option value="20">20 hours / week (~3 hrs/day)</option>
                    <option value="25">25+ hours / week (Intensive)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-2">
                  Select technologies you have built with or practiced:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((sk) => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-forest-100 border-forest-400 text-forest-800'
                            : 'bg-ivory-100 border-ivory-border text-ink-700 hover:bg-ivory-200'
                        }`}
                      >
                        {sk} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-border">
                <div className="text-xs font-semibold text-ink-800 mb-2">Featured Engineering Project</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Ling Yatra Travel Platform"
                      className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1">Architecture Summary</label>
                    <textarea
                      rows={2}
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="Describe the technical challenges, architecture, and libraries used."
                      className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-forest-50/70 border border-forest-100 rounded text-center">
                <div className="text-xs font-semibold text-forest-800 uppercase tracking-wide">
                  Calculated Initial Career Readiness
                </div>
                <div className="font-serif text-4xl font-bold text-forest-700 my-2 font-mono">
                  {Math.min(85, Math.max(30, selectedSkills.length * 6 + (projectTitle ? 20 : 0) + 15))}%
                </div>
                <div className="text-[11px] text-forest-800 max-w-md mx-auto">
                  Provisional calibration based on {selectedSkills.length} selected skills, {weeklyHours} weekly hours commitment, and 1 documented engineering project.
                </div>
              </div>

              <div className="text-xs text-ink-700 space-y-1.5 pt-2">
                <div className="flex justify-between py-1 border-b border-ivory-border">
                  <span className="text-ink-500">Candidate:</span>
                  <span className="font-medium text-ink-900">{fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ivory-border">
                  <span className="text-ink-500">Target Role:</span>
                  <span className="font-medium text-ink-900">{targetRole}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ivory-border">
                  <span className="text-ink-500">Education:</span>
                  <span className="font-medium text-ink-900">{degree} ({graduationYear})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ivory-border">
                  <span className="text-ink-500">Skills Tracked:</span>
                  <span className="font-medium text-ink-900">{selectedSkills.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-5 border-t border-ivory-border flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded border border-ivory-border text-xs font-medium text-ink-700 hover:bg-ivory-200 flex items-center space-x-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>{loading ? 'Initializing CareerOS...' : 'Launch Dashboard'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

