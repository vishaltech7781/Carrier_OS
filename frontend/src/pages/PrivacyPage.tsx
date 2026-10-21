import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory-100 text-ink-900 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-ink-500 hover:text-forest-700">
          <ArrowLeft size={14} />
          <span>Return to Homepage</span>
        </Link>

        <div className="border-b border-ivory-border pb-6">
          <div className="flex items-center space-x-2 text-forest-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield size={16} />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-ink-500 mt-2">Effective Date: October 2026 • Academic Project Specification</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-ink-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">1. Data Collected</h2>
            <p>
              CareerOS AI collects information provided directly by student candidates, including names, email addresses, educational history, target job roles, technical skills, resume documents (PDF or plain text), and practice attempt records for Data Structures & Algorithms and mock interviews.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">2. Purpose of Processing</h2>
            <p>
              Uploaded resume files and pasted text are parsed strictly in memory and within local services to identify technical skills, detect projects, and calculate explainable job description match percentages. Candidate data is never sold, leased, or used for automated commercial advertising.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">3. Storage and Deletion Rights</h2>
            <p>
              In accordance with data minimization principles, candidates retain complete control over their recorded documents. Resumes, extracted analyses, and logged DSA problem records can be permanently deleted at any time through the platform interface.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">4. Contact & Compliance</h2>
            <p>
              For inquiries regarding the CareerOS platform architecture or data handling, candidates may contact the project administrator at <span className="font-mono text-ink-900">privacy@careeros.ai</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

