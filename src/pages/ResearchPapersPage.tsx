import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api-base.ts';
import { Calendar, Download, Search, SlidersHorizontal, Users, X } from 'lucide-react';

type Filters = {
  keyword: string;
  author: string;
  field: string;
  topic: string;
  source: string;
  license: string;
  year: string;
};

const EMPTY: Filters = { keyword: '', author: '', field: '', topic: '', source: '', license: '', year: '' };

const uniqueSorted = (values: Array<string | number | null | undefined>) =>
  Array.from(new Set(values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '').map(String)))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const ResearchPapersPage = () => {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY);

  useEffect(() => {
    setLoading(true);
    fetch('/api/papers')
      .then((res) => res.json())
      .then((data) => setPapers(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Papers fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => ({
    fields: uniqueSorted(papers.map((p) => p.field_label)),
    topics: uniqueSorted(papers.map((p) => p.topic)),
    sources: uniqueSorted(papers.map((p) => p.source_name)),
    licenses: uniqueSorted(papers.map((p) => p.license_name)),
    years: uniqueSorted(papers.map((p) => p.publication_year)).reverse(),
  }), [papers]);

  const filtered = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    const au = filters.author.trim().toLowerCase();
    return papers.filter((p) => {
      if (kw && !`${p.title} ${p.abstract}`.toLowerCase().includes(kw)) return false;
      if (au && !String(p.author_names || '').toLowerCase().includes(au)) return false;
      if (filters.field && p.field_label !== filters.field) return false;
      if (filters.topic && p.topic !== filters.topic) return false;
      if (filters.source && p.source_name !== filters.source) return false;
      if (filters.license && p.license_name !== filters.license) return false;
      if (filters.year && String(p.publication_year) !== filters.year) return false;
      return true;
    });
  }, [papers, filters]);

  const activeCount = (Object.values(filters) as string[]).filter((v) => v.trim() !== '').length;
  const set = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));

  const Select = ({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: string[] }) => (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
      >
        <option value="">All</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div className="py-12 md:py-16 container-custom min-h-screen">
      <header className="space-y-4 mb-8">
        <p className="label-caps">The Archive</p>
        <h1 className="font-serif font-bold text-4xl md:text-5xl text-primary leading-tight">Research Papers</h1>
        <p className="max-w-2xl text-on-surface-variant text-base leading-relaxed">
          A curated archive of peer-reviewed work across our thematic domains in environmental science and ecology.
        </p>
      </header>

      {/* Filter bar */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(45,45,45,0.05)] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by title or keyword…"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright pl-11 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
              value={filters.keyword}
              onChange={(e) => set('keyword', e.target.value)}
            />
          </div>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Filter by author name…"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright pl-11 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
              value={filters.author}
              onChange={(e) => set('author', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Select label="Field" value={filters.field} onChange={(v) => set('field', v)} opts={options.fields} />
          <Select label="Subtopic" value={filters.topic} onChange={(v) => set('topic', v)} opts={options.topics} />
          <Select label="Source" value={filters.source} onChange={(v) => set('source', v)} opts={options.sources} />
          <Select label="License" value={filters.license} onChange={(v) => set('license', v)} opts={options.licenses} />
          <Select label="Year" value={filters.year} onChange={(v) => set('year', v)} opts={options.years} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeCount > 0 ? `${activeCount} filter${activeCount === 1 ? '' : 's'} active` : 'No filters applied'}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant font-serif italic text-lg">Loading papers…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-20 px-8 text-center">
          <h3 className="font-serif text-2xl text-primary mb-2">No papers match your filters</h3>
          <p className="text-on-surface-variant mb-6">Try removing a filter or broadening your search.</p>
          {activeCount > 0 && (
            <button type="button" onClick={() => setFilters(EMPTY)} className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-on-primary hover:bg-primary-dark transition-colors">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="label-caps mb-6">{filtered.length} of {papers.length} Publications</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((paper) => (
              <article
                key={paper.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_4px_20px_rgba(45,45,45,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_12px_30px_rgba(45,45,45,0.12)]"
              >
                <div className="aspect-[3/2] overflow-hidden bg-surface-container">
                  <img
                    src={`https://picsum.photos/seed/${paper.id}/600/400`}
                    alt={paper.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="label-caps">{paper.field_label || paper.topic || 'General'}</span>
                    {paper.license_name && (
                      <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">{paper.license_name}</span>
                    )}
                  </div>
                  <Link to={`/paper/${paper.id}`}>
                    <h3 className="font-serif text-xl leading-snug text-on-surface transition-colors group-hover:text-primary line-clamp-2">
                      {paper.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1">{paper.abstract}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[160px]">{paper.author_names || 'Unknown'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {paper.publication_year || (paper.created_at ? new Date(paper.created_at).getFullYear() : 'N/A')}
                    </span>
                  </div>
                  {paper.source_name && (
                    <p className="text-xs text-on-surface-variant italic truncate">{paper.source_name}</p>
                  )}
                  <div className="pt-4 mt-auto border-t border-outline-variant/60 flex items-center justify-between">
                    <Link to={`/paper/${paper.id}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary-dark">
                      Read Paper
                    </Link>
                    <a href={apiUrl(`/api/paper/${paper.id}/download`)} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-secondary hover:text-primary">
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
