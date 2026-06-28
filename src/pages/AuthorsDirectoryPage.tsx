import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, FileText, Search, Users } from 'lucide-react';

type AuthorRow = {
  id: string;
  name: string;
  institution: string | null;
  orcid: string | null;
  enrichment_status: string | null;
  enrichment_confidence: number | string | null;
  works_count: number | null;
  publication_count: number | string;
};

const getInitials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';

export const AuthorsDirectoryPage = () => {
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/authors')
      .then((res) => res.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : []))
      .catch(() => setAuthors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return authors;
    const q = query.toLowerCase();
    return authors.filter((a) => a.name.toLowerCase().includes(q) || String(a.institution || '').toLowerCase().includes(q));
  }, [authors, query]);

  const enrichedCount = authors.filter((a) => a.enrichment_status === 'enriched').length;

  return (
    <div className="container-custom py-12 md:py-16 min-h-screen">
      <header className="max-w-3xl mb-10">
        <p className="label-caps mb-3">Author Intelligence</p>
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface leading-tight">Authors</h1>
        <p className="mt-4 text-on-surface-variant text-base md:text-lg leading-relaxed">
          Contributors across our research domains — with verified ORCID identities and ROR-normalized
          affiliations where available.
        </p>
        {!loading && (
          <p className="mt-3 text-sm text-on-surface-variant">
            {authors.length} authors · {enrichedCount} enriched with verified identity data.
          </p>
        )}
      </header>

      <div className="mb-10 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search by author or institution…"
            className="w-full bg-surface-container-lowest border border-outline-variant/70 rounded-md py-3 pl-10 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-14 text-center text-on-surface-variant italic">Loading authors…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-4" />
          <p className="text-on-surface-variant italic">No authors matched your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((author) => (
            <Link
              key={author.id}
              to={`/author/${encodeURIComponent(author.name)}`}
              className="glass-card p-6 group block transition-all duration-300 hover:-translate-y-[2px] hover:border-primary/40"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-lg">
                  {getInitials(author.name)}
                </div>
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl text-on-surface leading-snug group-hover:text-primary transition-colors truncate">
                      {author.name}
                    </h3>
                    {author.orcid && <BadgeCheck className="w-4 h-4 shrink-0 text-secondary" />}
                  </div>
                  {author.institution && author.institution !== 'Unknown' ? (
                    <p className="flex items-center gap-1.5 text-sm text-on-surface-variant truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" /> {author.institution}
                    </p>
                  ) : (
                    <p className="text-xs italic text-on-surface-variant/70">Affiliation not yet enriched</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                      <FileText className="w-3.5 h-3.5" />
                      {author.publication_count} {Number(author.publication_count) === 1 ? 'publication' : 'publications'}
                    </span>
                    {author.orcid && (
                      <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">ORCID</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
