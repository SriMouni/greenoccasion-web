import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api-base.ts';
import { Calendar, Download, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import { useJournal } from '../lib/journal';

type Filters = {
  keyword: string;
  author: string;
  field: string;
  topic: string;
  source: string;
  license: string;
  year: string;
  origin: string;
};

const EMPTY: Filters = { keyword: '', author: '', field: '', topic: '', source: '', license: '', year: '', origin: '' };

const uniqueSorted = (values: Array<string | number | null | undefined>) =>
  Array.from(new Set(values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '').map(String)))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const ResearchPapersPage = () => {
  const { name } = useJournal();
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
      if (filters.origin && p.origin !== filters.origin) return false;
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
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line/70 bg-surface-bright px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors"
      >
        <option value="">All</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=2400&q=80"
          alt="Wind turbines"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(150deg, rgba(4,47,46,0.85) 0%, rgba(19,78,74,0.6) 55%, rgba(4,47,46,0.88) 100%)' }} />
        <div className="relative container-custom py-16 md:py-20 text-neutral">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.24em] text-primary-fixed/90 mb-4">Open-Access Archive</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.04]">Research Papers</h1>
          <p className="mt-4 max-w-2xl text-neutral/80 leading-relaxed">
            A curated archive of peer-reviewed work published in {name} — climate change, carbon,
            pollution, waste, and the sustainable-future transition.
          </p>
        </div>
      </section>

      {/* Body: left filters + results */}
      <div className="container-custom py-10 md:py-14 grid gap-8 lg:grid-cols-[290px_1fr] items-start">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-20 space-y-4 rounded-2xl border border-line/70 bg-surface-bright p-5 shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-serif text-lg font-bold text-ink">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </span>
            {activeCount > 0 && (
              <button type="button" onClick={() => setFilters(EMPTY)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Title or keyword…"
                className="w-full rounded-lg border border-line/70 bg-surface-bright pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                value={filters.keyword}
                onChange={(e) => set('keyword', e.target.value)}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">Author</span>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Author name…"
                className="w-full rounded-lg border border-line/70 bg-surface-bright pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                value={filters.author}
                onChange={(e) => set('author', e.target.value)}
              />
            </div>
          </label>

          <Select label="Field" value={filters.field} onChange={(v) => set('field', v)} opts={options.fields} />
          <Select label="Topic" value={filters.topic} onChange={(v) => set('topic', v)} opts={options.topics} />
          <Select label="Source" value={filters.source} onChange={(v) => set('source', v)} opts={options.sources} />
          <Select label="License" value={filters.license} onChange={(v) => set('license', v)} opts={options.licenses} />
          <Select label="Year" value={filters.year} onChange={(v) => set('year', v)} opts={options.years} />

          <p className="pt-1 text-xs text-muted">
            {activeCount > 0 ? `${activeCount} filter${activeCount === 1 ? '' : 's'} active` : 'No filters applied'}
          </p>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          {/* Origin segmented toggle — separates our original journal from the aggregated index */}
          <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-line/70 bg-surface-bright p-1 text-xs font-semibold">
            {[
              { v: '', label: 'All' },
              { v: 'original', label: `Published by ${name}` },
              { v: 'aggregated', label: 'Open-Access Index' },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => set('origin', o.v)}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${filters.origin === o.v ? 'bg-primary text-neutral' : 'text-muted hover:text-primary'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="label-caps mb-5">{loading ? '—' : filtered.length} of {papers.length} Publications</p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 rounded-2xl border border-line/70 bg-surface-bright animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-line/70 bg-surface-bright py-20 px-8 text-center">
              <h3 className="font-serif text-2xl text-ink mb-2">No papers match your filters</h3>
              <p className="text-muted mb-6">Try removing a filter or broadening your search.</p>
              {activeCount > 0 && (
                <button type="button" onClick={() => setFilters(EMPTY)} className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral hover:bg-primary-dark transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map((paper) => (
                <article
                  key={paper.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface-bright shadow-[0_2px_14px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
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
                      {paper.origin === 'original' ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-neutral">Original</span>
                      ) : (
                        <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">Indexed</span>
                      )}
                      {paper.license_name && (
                        <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">{paper.license_name}</span>
                      )}
                    </div>
                    <Link to={`/paper/${paper.id}`}>
                      <h3 className="font-serif text-xl leading-snug text-ink transition-colors group-hover:text-primary line-clamp-2">{paper.title}</h3>
                    </Link>
                    <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">{paper.abstract}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted pt-1">
                      <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span className="truncate max-w-[160px]">{paper.author_names || 'Unknown'}</span></span>
                      <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{paper.publication_year || (paper.created_at ? new Date(paper.created_at).getFullYear() : 'N/A')}</span>
                    </div>
                    <div className="pt-4 mt-auto border-t border-line/60 flex items-center justify-between">
                      <Link to={`/paper/${paper.id}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary-dark">Read Paper</Link>
                      <a href={apiUrl(`/api/paper/${paper.id}/download`)} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-secondary hover:text-primary">
                        <Download className="w-4 h-4" /> PDF
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
