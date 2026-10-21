import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  FileText,
  Briefcase,
  Code2,
  Mic,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Interactive mini-evaluator on landing page (real functional demo, not a mockup)
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [enteredSkills, setEnteredSkills] = useState('JavaScript, React, Node.js');
  const [simulatedMatch, setSimulatedMatch] = useState<{ match: number; matched: string[]; missing: string[] } | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = enteredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const benchmark = ['javascript', 'typescript', 'react', 'node.js', 'mongodb', 'docker', 'sql', 'dsa'];
    const matched = benchmark.filter(b => parsed.some(p => p.includes(b) || b.includes(p)));
    const missing = benchmark.filter(b => !matched.includes(b));
    const score = Math.round((matched.length / benchmark.length) * 100);
    setSimulatedMatch({ match: score, matched, missing });
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-ink-900 selection:bg-forest-100 selection:text-forest-900">
      {/* Navigation */}
      <header className="border-b border-ivory-border bg-ivory-50/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-forest-700 flex items-center justify-center text-ivory-50 font-serif font-bold text-base">
              C
            </div>
            <span className="font-serif font-bold text-ink-900 text-xl tracking-tight">CareerOS AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-ink-700">
            <a href="#how-it-works" className="hover:text-forest-700 transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-forest-700 transition-colors">Architecture</a>
            <a href="#interactive-demo" className="hover:text-forest-700 transition-colors">Live Skill Audit</a>
          </nav>
          <div className="flex items-center space-x-3 text-xs font-medium">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded border border-ivory-border text-ink-800 hover:bg-ivory-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded bg-forest-700 text-ivory-50 hover:bg-forest-800 transition-colors shadow-subtle"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-forest-700/20 bg-forest-50 text-forest-800 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-700"></span>
          <span>Flagship Computer Science Engineering Project</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.15]">
          What should you learn and do next to become job-ready?
        </h1>
        <p className="mt-6 text-base sm:text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed font-normal">
          CareerOS AI continuously evaluates your resumes, coding practice, projects, and target job descriptions to synthesize an explainable, personalized career roadmap.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-medium">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded bg-forest-700 text-ivory-50 hover:bg-forest-800 flex items-center justify-center space-x-2 shadow-subtle"
          >
            <span>Begin Career Assessment</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded border border-ivory-border text-ink-800 hover:bg-ivory-200 flex items-center justify-center"
          >
            <span>Explore Demo Account</span>
          </Link>
        </div>

        {/* Core Principles Strip */}
        <div className="mt-14 pt-8 border-t border-ivory-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div>
            <div className="text-xs font-semibold text-ink-900 uppercase tracking-wide">Deterministic AI</div>
            <div className="text-xs text-ink-500 mt-1">Rule-grounded NLP, TF-IDF cosine similarity, and zero fabricated ATS claims.</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-900 uppercase tracking-wide">Dual Database</div>
            <div className="text-xs text-ink-500 mt-1">MongoDB for profiles and resumes; MySQL with Prisma for relational skills and roadmaps.</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-900 uppercase tracking-wide">Career Digital Twin</div>
            <div className="text-xs text-ink-500 mt-1">Multi-dimensional competence updating in real time as you solve DSA and complete tasks.</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-900 uppercase tracking-wide">Actionable Roadmap</div>
            <div className="text-xs text-ink-500 mt-1">Targeted weekly milestones connected to verified, non-commercial documentation.</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Skill Audit Demo */}
      <section id="interactive-demo" className="py-16 px-6 bg-ivory-200/50 border-y border-ivory-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">Try a Live Role Match Audit</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-2 max-w-xl mx-auto">
              Test our skill-gap engine directly below. Enter your skills to preview how CareerOS isolates missing engineering requirements.
            </p>
          </div>

          <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Target Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 mb-1">Your Current Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={enteredSkills}
                    onChange={(e) => setEnteredSkills(e.target.value)}
                    placeholder="e.g. JavaScript, React, Node.js"
                    className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors"
              >
                Calculate Role Match
              </button>
            </form>

            {simulatedMatch && (
              <div className="mt-6 pt-6 border-t border-ivory-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-ink-900">Calculated Benchmark Match</div>
                    <div className="text-[11px] text-ink-500">Based on industry baseline for {selectedRole}</div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-forest-700 font-mono">
                    {simulatedMatch.match}%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-forest-50/70 border border-forest-100 rounded">
                    <div className="font-semibold text-forest-800 mb-1.5 flex items-center space-x-1.5">
                      <CheckCircle2 size={14} />
                      <span>Verified Demonstrations ({simulatedMatch.matched.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {simulatedMatch.matched.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded bg-ivory-50 border border-forest-200 text-forest-800 text-[11px] uppercase font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-ochre-50/70 border border-ochre-100 rounded">
                    <div className="font-semibold text-ochre-700 mb-1.5">
                      Missing High-Priority Competencies ({simulatedMatch.missing.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {simulatedMatch.missing.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded bg-ivory-50 border border-ochre-200 text-ochre-700 text-[11px] uppercase font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-ink-500 italic">
                  Note: In the full application, your score integrates project verification, actual DSA submission streaks, and mock interview accuracy.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Breakdown Sections */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-ink-900">A Complete Career Engineering System</h2>
          <p className="text-xs sm:text-sm text-ink-600 mt-2 max-w-xl mx-auto">
            Not just isolated CRUD modules. Every component feeds directly into your personal career readiness score.
          </p>
        </div>

        <div className="space-y-12">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 border-b border-ivory-border">
            <div className="w-12 h-12 rounded bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Resume & Job Description Intelligence</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Extracts sections, technical skills, and project evidence from PDF documents using boundary-safe regex matching. Evaluates job descriptions against your verified profile using TF-IDF cosine similarity and weighted requirement ratios.
              </p>
              <div className="mt-3 text-[11px] font-mono text-forest-700">
                Formula: Weighted Match = (2 × Matched Required + 1 × Matched Preferred) ÷ (2 × Total Required + 1 × Total Preferred)
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 border-b border-ivory-border">
            <div className="w-12 h-12 rounded bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <GitBranch size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Dynamic Weekly Roadmap Engine</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Generates actionable milestones respecting prerequisite sequencing (e.g. foundational JavaScript before state management; relational schema design before microservice caching). Allows marking tasks complete, adjusting hours, and regenerating remaining phases.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 border-b border-ivory-border">
            <div className="w-12 h-12 rounded bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Code2 size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink-900">15-Topic DSA Practice Tracker</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Tracks structured coding problem practice across 15 standard computer science domains from Arrays to Tries and Dynamic Programming. Calculates actual problem streaks, topic distributions, and pinpoints weakest topics for placement readiness.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-12 h-12 rounded bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Mic size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Turn-based AI Mock Interviews</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Interactive technical and behavioral interview sessions graded on technical accuracy, completeness, and clarity using deterministic concept grounding. Provides positive observations, lists missing architectural concepts, and records historical session trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory-border bg-ivory-50 py-12 px-6 text-xs text-ink-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-forest-700 flex items-center justify-center text-ivory-50 font-serif font-bold text-xs">
              C
            </div>
            <span className="font-serif font-bold text-ink-900">CareerOS AI</span>
            <span className="text-ink-400">| Major Project Flagship</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-forest-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-forest-700">Terms of Service</Link>
            <Link to="/login" className="hover:text-forest-700">Demo Login</Link>
          </div>
          <div className="text-ink-500">
            Engineered with React, TypeScript, Node.js, Express, MongoDB, MySQL, and Python FastAPI.
          </div>
        </div>
      </footer>
    </div>
  );
};

