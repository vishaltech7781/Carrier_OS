import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center items-center px-6 text-center text-ink-900">
      <div className="bg-ivory-50 border border-ivory-border rounded-lg p-10 max-w-md w-full shadow-card space-y-4">
        <Compass size={40} className="text-forest-700 mx-auto" />
        <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">404 — Page Not Found</h1>
        <p className="text-xs text-ink-600 leading-relaxed">
          The requested page or view could not be located in the CareerOS navigation taxonomy.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-forest-700 text-ivory-50 text-xs font-medium hover:bg-forest-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Career Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

