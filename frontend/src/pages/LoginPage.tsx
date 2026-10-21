import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, demoAdminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start student demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoAdminLogin();
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start admin demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-ink-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded bg-forest-700 flex items-center justify-center text-ivory-50 font-serif font-bold text-base">
            C
          </div>
          <span className="font-serif font-bold text-ink-900 text-xl tracking-tight">CareerOS AI</span>
        </Link>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-900">Sign in to your career account</h2>
        <p className="mt-1.5 text-xs text-ink-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-forest-700 hover:text-forest-800 underline">
            create a new student profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card">
          {error && (
            <div className="mb-4 p-3 rounded bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-800 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-ink-800">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-ink-500 hover:text-forest-700">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-ivory-border">
            <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2 text-center">
              Evaluation & Examiner Quick Access
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded border border-ivory-border bg-ivory-100 text-[11px] font-medium text-ink-800 hover:bg-ivory-200"
              >
                <UserCheck size={14} className="text-forest-700" />
                <span>Student Demo Account</span>
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded border border-ivory-border bg-ivory-100 text-[11px] font-medium text-ink-800 hover:bg-ivory-200"
              >
                <ShieldCheck size={14} className="text-ochre-700" />
                <span>Administrator Demo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-ink-500">
          By signing in, you agree to the{' '}
          <Link to="/terms" className="underline hover:text-ink-800">Terms of Service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-ink-800">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
};

