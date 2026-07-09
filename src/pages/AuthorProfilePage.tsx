import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../lib/api-base.ts';
import { ArrowLeft, BadgeCheck, BookOpen, Building, Download, ExternalLink, FileText, Landmark, Link2, Sparkles, Users } from 'lucide-react';
import { useJournal } from '../lib/journal';

const getInitials = (name: string) =>
  (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';

const card = 'rounded-2xl border border-line/70 bg-surface-bright shadow-[0_2px_16px_rgba(15,23,42,0.05)]';

// Expertise-cloud sizing: rank terms by how often they appear across the author's papers.
const cloudSize = (rank: number, total: number) => {
  if (total <= 1) return 'text-xl';
  const t = rank / (total - 1); // 0 = most frequent
  if (t < 0.2) return 'text-2xl';
  if (t < 0.45) return 'text-xl';
  if (t < 0.7) return 'text-lg';
  return 'text-base';
};

export const AuthorProfilePage = () => {
  const { authorName } = useParams();
  const { name: journalName } = useJournal();
  const [author, setAuthor] = useState<any>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/author/${encodeURIComponent(authorName || '')}`))
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setAuthor(data.author);
        setPapers(Array.isArray(data.papers) ? data.papers : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [authorName]);

  // Expertise cloud ordered by frequency across the author's papers.
  const expertise = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of papers) {
      const t = (p.topic || '').trim();
      if (t) freq.set(t, (freq.get(t) || 0) + 1);
    }
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).map(([term]) => term);
  }, [papers]);

  if (loading) {
    return <div className="container-custom py-24 text-center font-serif italic text-xl text-muted">Loading author profile…</div>;
  }

  if (error || !author) {
    return (
      <div className="container-custom py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl text-ink">Author not found</h1>
        <Link to="/authors" className="inline-flex items-center justify-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Authors
        </Link>
      </div>
    );
  }

  const pubs = author.totalPublications ?? papers.length;
  const hasInstitution = author.institution && author.institution !== 'Unknown';
  const topArea = expertise[0];
  const coAuthors: any[] = Array.isArray(author.coAuthors) ? author.coAuthors : [];
  const visiblePapers = showAll ? papers : papers.slice(0, 4);

  // Real, honest metrics (no fabricated H-index / citations).
  const metrics = [
    { value: pubs, label: `In ${journalName?.split(' ')[0] || 'Journal'}` },
    ...(typeof author.works_count === 'number' && author.works_count > 0
      ? [{ value: author.works_count.toLocaleString(), label: 'Indexed Works' }]
      : []),
    { value: expertise.length || papers.length, label: expertise.length ? 'Research Areas' : 'Papers' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <section className="border-b border-line/60 bg-surface-bright">
        <div className="container-custom py-8 md:py-10">
          <Link to="/authors" className="mb-7 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Authors
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            {/* Identity */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="flex h-36 w-32 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark font-serif text-5xl font-bold text-white shadow-sm">
                {getInitials(author.name)}
              </span>
              <div className="min-w-0 pt-1">
                <h1 className="font-serif text-4xl md:text-[2.75rem] font-bold leading-tight text-ink">{author.name}</h1>
                {topArea && (
                  <p className="mt-1.5 font-serif text-lg italic text-primary">Published researcher in {topArea}</p>
                )}
                {hasInstitution && (
                  <p className="mt-4 flex items-center gap-2 text-muted">
                    <Landmark className="h-4 w-4 shrink-0 text-muted" /> {author.institution}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {author.orcid && (
                    <a
                      href={`https://orcid.org/${author.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <BadgeCheck className="h-4 w-4 text-secondary" /> ORCID
                    </a>
                  )}
                  {author.affiliations?.length > 0 && author.affiliations[0].ror_id && (
                    <a
                      href={author.affiliations[0].ror_id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-primary"
                    >
                      <Link2 className="h-4 w-4" /> ROR
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics card */}
            <div className={`${card} p-6`}>
              <h3 className="label-caps mb-5">Publication Metrics</h3>
              <div className="flex items-stretch justify-between divide-x divide-line/70 text-center">
                {metrics.map((m) => (
                  <div key={m.label} className="flex-1 px-2">
                    <p className="font-serif text-3xl font-bold text-ink tabular-nums leading-none">{m.value}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-muted leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
              {author.orcid ? (
                <a
                  href={`https://orcid.org/${author.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container transition-colors hover:bg-primary-container"
                >
                  <BadgeCheck className="h-4 w-4" /> View ORCID Record
                </a>
              ) : (
                <a
                  href="#publications"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-container-high"
                >
                  <BookOpen className="h-4 w-4" /> View publications
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container-custom py-10 md:py-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Main column */}
        <div className="min-w-0 space-y-12">
          {/* Research focus & biography */}
          <section>
            <h2 className="border-b border-line/60 pb-3 font-serif text-2xl font-bold text-ink">Research Focus &amp; Biography</h2>
            <p className="mt-5 leading-relaxed text-muted">
              {author.name} contributes peer-reviewed research to {journalName}
              {hasInstitution ? `, based at ${author.institution}` : ''}.
              {expertise.length > 0 && (
                <> Their published work spans {expertise.slice(0, 4).join(', ')}{expertise.length > 4 ? ' and related areas' : ''}.</>
              )}
            </p>
            {expertise.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {expertise.map((area) => (
                  <span key={area} className="rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-medium text-ink">{area}</span>
                ))}
              </div>
            )}
          </section>

          {/* Selected publications */}
          <section id="publications">
            <div className="flex items-end justify-between border-b border-line/60 pb-3">
              <h2 className="font-serif text-2xl font-bold text-ink">Selected Publications</h2>
              {papers.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-primary hover:text-primary-dark"
                >
                  {showAll ? 'Show less' : `View all (${papers.length})`}
                </button>
              )}
            </div>

            {papers.length === 0 ? (
              <div className={`${card} mt-6 py-16 text-center`}>
                <FileText className="mx-auto mb-4 h-10 w-10 text-muted/30" />
                <p className="font-serif italic text-muted">No papers currently listed for this author.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {visiblePapers.map((paper) => (
                  <article key={paper.id} className={`${card} p-6 transition-shadow hover:shadow-[0_10px_28px_rgba(15,23,42,0.09)]`}>
                    <div className="flex items-start justify-between gap-4">
                      {paper.doi ? (
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono-label text-[11px] uppercase tracking-wide text-muted hover:text-primary"
                        >
                          DOI: {paper.doi}
                        </a>
                      ) : <span />}
                      <span className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        {paper.topic || 'Peer Reviewed'}
                      </span>
                    </div>
                    <Link to={`/paper/${paper.id}`} className="mt-3 block">
                      <h3 className="text-lg font-bold leading-snug text-ink transition-colors hover:text-primary">{paper.title}</h3>
                    </Link>
                    <p className="mt-1.5 text-sm text-muted">
                      Published in {journalName}
                      {(paper.publication_year || paper.created_at) && ` · ${paper.publication_year || new Date(paper.created_at).getFullYear()}`}
                    </p>
                    <div className="mt-4 flex items-center gap-5 border-t border-line/60 pt-4 text-xs">
                      <Link to={`/paper/${paper.id}`} className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.1em] text-primary hover:text-primary-dark">
                        <BookOpen className="h-4 w-4" /> Read
                      </Link>
                      <a href={apiUrl(`/api/paper/${paper.id}/download`)} className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.1em] text-secondary hover:text-primary">
                        <Download className="h-4 w-4" /> PDF
                      </a>
                      {paper.doi && (
                        <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-muted hover:text-primary">
                          <ExternalLink className="h-3.5 w-3.5" /> DOI
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Expertise */}
          {expertise.length > 0 && (
            <div className={`${card} p-6`}>
              <h3 className="label-caps mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Expertise</h3>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 rounded-xl border border-line/60 bg-surface-container-low/60 p-5">
                {expertise.map((term, i) => (
                  <span
                    key={term}
                    className={`font-serif leading-tight ${cloudSize(i, expertise.length)} ${i === 0 ? 'font-bold text-ink' : i < 3 ? 'font-semibold text-primary-dark' : 'text-muted'}`}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Frequent collaborators (real co-authors) */}
          {coAuthors.length > 0 && (
            <div className={`${card} p-6`}>
              <h3 className="label-caps mb-4 flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Frequent Collaborators</h3>
              <div className="space-y-1">
                {coAuthors.map((c) => (
                  <Link
                    key={c.id}
                    to={`/author/${encodeURIComponent(c.name)}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-surface-container"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[11px] font-bold text-white">
                      {getInitials(c.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {c.institution && c.institution !== 'Unknown' ? c.institution : `${c.shared} joint paper${Number(c.shared) === 1 ? '' : 's'}`}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Verified identity — green accent card */}
          <div className="rounded-2xl bg-primary-dark p-6 text-neutral shadow-[0_2px_16px_rgba(15,23,42,0.08)]">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold">
              <BadgeCheck className="h-5 w-5 text-primary-fixed" /> Verified Identity
            </h3>
            {author.orcid ? (
              <a
                href={`https://orcid.org/${author.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 font-mono-label text-sm text-primary-fixed hover:underline"
              >
                {author.orcid} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-3 text-sm text-neutral/70">ORCID pending verification.</p>
            )}

            {author.affiliations?.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-neutral/15 pt-4">
                {author.affiliations.map((aff: any, i: number) => (
                  <p key={i} className="flex items-start gap-2 text-sm text-neutral/85">
                    <Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral/50" />
                    <span>{aff.organization_name}{aff.country ? ` · ${aff.country}` : ''}</span>
                  </p>
                ))}
              </div>
            )}

            <p className="mt-4 border-t border-neutral/15 pt-3 text-[11px] leading-relaxed text-neutral/45">
              Identity data sourced from OpenAlex, ORCID &amp; ROR.
              {author.enrichment_status === 'enriched' ? ' Verified.' : ' Pending enrichment.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
