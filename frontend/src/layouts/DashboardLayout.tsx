import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GitBranch,
  Code2,
  Mic,
  BarChart3,
  BookOpen,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  FileSearch,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { section: 'CORE INTELLIGENCE', items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Digital Twin & Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Career Roadmap', path: '/roadmap', icon: GitBranch },
    ]},
    { section: 'ANALYSIS & MATCHING', items: [
      { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
      { name: 'Job Matcher', path: '/jobs', icon: Briefcase },
      { name: 'Job Description Analyzer', path: '/job-analyzer', icon: FileSearch },
    ]},
    { section: 'PRACTICE & READINESS', items: [
      { name: 'DSA Tracker', path: '/dsa-tracker', icon: Code2 },
      { name: 'AI Mock Interview', path: '/mock-interview', icon: Mic },
      { name: 'Learning Resources', path: '/resources', icon: BookOpen },
    ]},
    { section: 'ACCOUNT', items: [
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings },
      ...(user?.role === 'admin' ? [{ name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert }] : []),
    ]},
  ];

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-ivory-50 border-b border-ivory-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-forest-700 flex items-center justify-center text-ivory-50 font-serif font-bold text-sm">
            C
          </div>
          <span className="font-serif font-bold text-ink-900 tracking-tight text-lg">CareerOS</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded border border-ivory-border text-ink-700 hover:bg-ivory-200"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-ivory-50 border-r border-ivory-border flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center space-x-2.5 pb-5 border-b border-ivory-border">
            <div className="w-8 h-8 rounded bg-forest-700 flex items-center justify-center text-ivory-50 font-serif font-bold text-base shadow-subtle">
              C
            </div>
            <div>
              <div className="font-serif font-bold text-ink-900 tracking-tight leading-tight text-lg">CareerOS</div>
              <div className="text-[11px] text-ink-500 font-medium tracking-wide uppercase">Career Intelligence</div>
            </div>
          </div>

          {/* User Quick Info */}
          <div className="my-4 p-3 bg-ivory-200/60 rounded border border-ivory-border/80">
            <div className="text-xs font-semibold text-ink-800 truncate">{user?.name || 'Student Candidate'}</div>
            <div className="text-[11px] text-ink-500 truncate mt-0.5">{user?.targetRole || 'Full Stack Developer'}</div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-ink-600">Readiness Score</span>
              <span className="font-semibold text-forest-700 font-mono">{user?.readinessScore || 0}%</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-5 mt-2">
            {navItems.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="text-[10px] font-semibold tracking-wider text-ink-400 uppercase px-2 mb-1.5">
                  {group.section}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-forest-100/70 text-forest-800 font-semibold border-l-2 border-forest-700'
                            : 'text-ink-700 hover:text-ink-900 hover:bg-ivory-200/50'
                        }`
                      }
                    >
                      <item.icon size={15} className="shrink-0 text-ink-500" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-ivory-border bg-ivory-100/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded border border-ivory-border text-xs font-medium text-ink-700 hover:text-terracotta-700 hover:bg-terracotta-50/50 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

