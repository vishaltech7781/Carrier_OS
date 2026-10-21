import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory-100 text-ink-900 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-ink-500 hover:text-forest-700">
          <ArrowLeft size={14} />
          <span>Return to Homepage</span>
        </Link>

        <div className="border-b border-ivory-border pb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            Terms of Service
          </h1>
          <p className="text-xs text-ink-500 mt-2">Effective Date: October 2026 • CareerOS AI Academic Edition</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-ink-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">1. Acceptance of Terms</h2>
            <p>
              By accessing CareerOS AI, you agree to these Terms of Service. CareerOS AI is an educational career intelligence platform designed to aid students and software engineering candidates in assessing skill gaps and structuring technical preparation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">2. Disclaimers & Scoring Criteria</h2>
            <p>
              The career readiness scores, resume completeness percentages, and job match ratios presented by CareerOS AI are educational heuristics derived from deterministic formulas and concept grounding. They do not constitute a guarantee of employment, job offer, or recruitment outcome.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-ink-900">3. Permitted Use</h2>
            <p>
              Users agree to submit accurate candidate information, avoid uploading malicious binaries or documents, and respect third-party terms when exploring external learning resources and job links.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

