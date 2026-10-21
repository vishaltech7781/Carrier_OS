import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, UserCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, 'student');
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student account.');
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
      setError(err.response?.data?.message || 'Failed to start demo.');
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
        <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-900">Create your student career profile</h2>
        <p className="mt-1.5 text-xs text-ink-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-forest-700 hover:text-forest-800 underline">
            Sign in here
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
              <label className="block text-xs font-semibold text-ink-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vishal Biradar"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>

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
              <label className="block text-xs font-semibold text-ink-800 mb-1">Password (min. 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 rounded border border-ivory-border bg-ivory-100 text-ink-900 focus:border-forest-700"
              />
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-ivory-border text-forest-700 focus:ring-forest-700"
              />
              <label htmlFor="terms" className="text-xs text-ink-600 leading-tight">
                I agree to the{' '}
                <Link to="/terms" className="underline hover:text-ink-900">Terms of Service</Link>{' '}
                and understand that my resume data will be analyzed for skill-matching.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Continue to Onboarding'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-6 pt-6 border-t border-ivory-border">
            <button
              type="button"
              onClick={handleDemoStudent}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded border border-ivory-border bg-ivory-100 text-xs font-medium text-ink-800 hover:bg-ivory-200"
            >
              <UserCheck size={14} className="text-forest-700" />
              <span>Skip Registration & Try Demo Student Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

