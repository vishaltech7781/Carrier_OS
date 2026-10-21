import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (skillFilter) params.skill = skillFilter;
      if (typeFilter) params.resourceType = typeFilter;
      if (search) params.search = search;

      const res = await api.get('/resources', { params });
      if (res.data.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [skillFilter, typeFilter, search]);

  const handleToggleBookmark = async (resourceId: string) => {
    try {
      // Optimistic update
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r)
      );
      await api.post('/resources/bookmark', { resourceId });
      fetchResources();
    } catch (err) {
      console.error('Failed to bookmark resource:', err);
      fetchResources();
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-border gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Curated Technical Learning Resources
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Verified, non-commercial documentation and algorithmic practice sets to resolve skill gaps.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-ivory-50 border border-ivory-border rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 text-ink-500">
            <Filter size={13} />
            <span>Filter:</span>
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-800"
          >
            <option value="">All Skills</option>
            <option value="TypeScript">TypeScript</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="DSA">DSA</option>
            <option value="Docker">Docker</option>
            <option value="SQL">SQL</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 rounded border border-ivory-border bg-ivory-100 text-xs text-ink-800"
          >
            <option value="">All Formats</option>
            <option value="Docs">Official Docs</option>
            <option value="Practice">Interactive Practice</option>
            <option value="Tutorial">Tutorial</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-2.5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-ivory-border bg-ivory-100 text-ink-900"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.length > 0 ? (
          resources.map((res) => (
            <div
              key={res.id}
              className="bg-ivory-50 border border-ivory-border rounded p-5 shadow-card hover:border-ivory-borderDark transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-forest-700 font-semibold">{res.skill}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ivory-100 border border-ivory-border text-ink-600">
                    {res.resourceType}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-ink-900 leading-snug">
                  {res.title}
                </h3>
                <div className="text-[11px] text-ink-500 mt-1">
                  Provider: {res.provider} • Duration: {res.estimatedDuration}
                </div>
              </div>

              <div className="pt-3 border-t border-ivory-border flex items-center justify-between text-xs">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-700 hover:underline inline-flex items-center space-x-1 font-medium"
                >
                  <span>Open Resource</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={() => handleToggleBookmark(res.id)}
                  className={`p-1.5 rounded border transition-colors ${
                    res.isBookmarked
                      ? 'bg-forest-100 border-forest-300 text-forest-800'
                      : 'bg-ivory-100 border-ivory-border text-ink-600 hover:bg-ivory-200'
                  }`}
                  title={res.isBookmarked ? 'Bookmarked' : 'Add bookmark'}
                >
                  {res.isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-ink-500">
            No learning resources match current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

