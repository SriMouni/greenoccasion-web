import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useJournal } from '../lib/journal';

type AuthorRow = {
  id: string;
  name: string;
  institution: string | null;
  orcid: string | null;
  works_count: number | null;
  publication_count: number | string;
};

const PAGE_SIZE = 12;
const getInitials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
const shortId = (id: string) => `CR-${(id.replace(/[^a-zA-Z0-9]/g, '').slice(-4) || '0000').toUpperCase()}`;

export const AuthorsDirectoryPage = () => {
  const { name } = useJournal();
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [query, setQuery] = useState('');
  const [inst, setInst] = useState('');
  const [sort, setSort] = useState<'pubs' | 'name'>('pubs');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/authors')
      .then((r) => r.json())
      .then((d) => setAuthors(Array.isArray(d) ? d : []))
      .catch(() => setAuthors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => setPage(1), [query, inst, sort]);

  const institutions = useMemo(
    () => [...new Set(authors.map((a) => a.institution).filter((i): i is string => !!i && i !== 'Unknown'))].sort(),
    [authors],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = authors.filter((a) => {
      const matchesQ = !q || a.name.toLowerCase().includes(q) || String(a.institution || '').toLowerCase().includes(q);
      const matchesInst = !inst || a.institution === inst;
      return matchesQ && matchesInst;
    });
    return rows.sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : (Number(b.publication_count) || 0) - (Number(a.publication_count) || 0),
    );
  }, [authors, query, inst, sort]);

  const orcidCount = authors.filter((a) => a.orcid).length;
  const featured = useMemo(() => [...authors].sort((a, b) => (Number(b.publication_count) || 0) - (Number(a.publication_count) || 0))[0], [authors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = (query || inst) ? 1 : 0;

  return (
    <div className="container-custom py-10 md:py-14 min-h-screen">
      {/* Header + featured scholar beside it */}
      <header className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-stretch mb-10">
        <div className="flex flex-col justify-center">
          <p className="label-caps mb-3">Author Intelligence</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1] text-ink">Authors</h1>
          <p className="mt-4 max-w-xl text-muted leading-relaxed">
            A network of leading contributors to {name} — advancing climate science, policy, and the
            sustainable-future transition, with verified academic identities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container">{loading ? '—' : authors.length} researchers</span>
            <span className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-muted">{loading ? '—' : institutions.length} institutions</span>
            <span className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-muted">{loading ? '—' : orcidCount} ORCID verified</span>
          </div>
        </div>

        {featured && !loading && (
          <div className="overflow-hidden rounded-2xl border border-line/70 bg-surface-bright shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4 bg-gradient-to-br from-primary to-primary-dark p-6">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-serif text-2xl font-bold text-white">{getInitials(featured.name)}</span>
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Featured Scholar</span>
                <h2 className="mt-1.5 font-serif text-2xl font-bold leading-tight text-white truncate">{featured.name}</h2>
              </div>
            </div>
            <div className="p-6">
              {featured.institution && featured.institution !== 'Unknown' && <p className="text-sm text-muted">{featured.institution}</p>}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-serif text-3xl font-bold text-ink tabular-nums">{featured.publication_count}</p>
                  <p className="font-mono-label text-[10px] uppercase tracking-widest text-muted">Publications</p>
                </div>
                <Link to={`/author/${encodeURIComponent(featured.name)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
                  View Profile <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Body: left filters + author cards */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-20 space-y-4 rounded-2xl border border-line/70 bg-surface-bright p-5 shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-serif text-lg font-bold text-ink"><SlidersHorizontal className="h-4 w-4 text-primary" /> Filters</span>
            {active > 0 && (
              <button type="button" onClick={() => { setQuery(''); setInst(''); }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"><X className="h-3.5 w-3.5" /> Clear</button>
            )}
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or institution…" className="w-full rounded-lg border border-line/70 bg-surface-bright py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">Institution</span>
            <select value={inst} onChange={(e) => setInst(e.target.value)} className="rounded-lg border border-line/70 bg-surface-bright px-3 py-2.5 text-sm text-ink outline-none focus:border-primary">
              <option value="">All institutions</option>
              {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as 'pubs' | 'name')} className="rounded-lg border border-line/70 bg-surface-bright px-3 py-2.5 text-sm text-ink outline-none focus:border-primary">
              <option value="pubs">Most published</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
          <p className="pt-1 text-xs text-muted">{loading ? '' : `${filtered.length} researchers`}</p>
        </aside>

        {/* Cards + pagination */}
        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-52 rounded-2xl border border-line/70 bg-surface-bright animate-pulse" />)}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="rounded-2xl border border-line/70 bg-surface-bright p-14 text-center italic text-muted">No researchers matched your filters.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {pageItems.map((a) => (
                  <Link
                    key={a.id}
                    to={`/author/${encodeURIComponent(a.name)}`}
                    className="group flex flex-col rounded-2xl border border-line/70 bg-surface-bright p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary font-serif text-lg font-bold text-white">{getInitials(a.name)}</span>
                      <span className="font-mono-label text-[10px] uppercase tracking-wider text-muted/70">{shortId(a.id)}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5">
                      <h3 className="font-serif text-xl font-bold leading-tight text-ink transition-colors group-hover:text-primary">{a.name}</h3>
                      {a.orcid && <BadgeCheck className="h-4 w-4 shrink-0 text-secondary" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{a.institution && a.institution !== 'Unknown' ? a.institution : 'Independent researcher'}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-4 mt-4">
                      <div className="flex gap-5">
                        <div>
                          <p className="font-serif text-lg font-bold text-ink tabular-nums">{a.publication_count}</p>
                          <p className="font-mono-label text-[9px] uppercase tracking-wider text-muted">Publications</p>
                        </div>
                        <div>
                          <p className="font-serif text-lg font-bold text-ink tabular-nums">{a.works_count ?? '—'}</p>
                          <p className="font-mono-label text-[9px] uppercase tracking-wider text-muted">Works</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6">
                  <p className="text-sm text-muted">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex h-9 w-9 items-center justify-center rounded-md border border-line/70 text-muted disabled:opacity-40 hover:border-primary hover:text-primary"><ChevronLeft className="h-4 w-4" /></button>
                    {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                      const p = i + 1;
                      return <button key={p} type="button" onClick={() => setPage(p)} className={`h-9 min-w-9 rounded-md px-3 text-sm font-semibold ${p === page ? 'bg-primary text-neutral' : 'border border-line/70 text-muted hover:border-primary hover:text-primary'}`}>{p}</button>;
                    })}
                    {totalPages > 5 && <span className="px-1 text-muted">… {totalPages}</span>}
                    <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="flex h-9 w-9 items-center justify-center rounded-md border border-line/70 text-muted disabled:opacity-40 hover:border-primary hover:text-primary"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
