import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
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
        <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-900">Reset your password</h2>
        <p className="mt-1.5 text-xs text-ink-600">Enter your email address to receive recovery instructions.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-ivory-50 border border-ivory-border rounded p-6 sm:p-8 shadow-card">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 size={36} className="text-forest-700 mx-auto mb-3" />
              <h3 className="font-serif text-base font-bold text-ink-900">Recovery Dispatched</h3>
              <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                If an account exists for <span className="font-semibold text-ink-800">{email}</span>, password reset instructions have been logged to the system.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center space-x-1 text-xs text-ink-500 hover:text-ink-800">
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

