import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, BookOpen, Building, ExternalLink, FileText } from 'lucide-react';

const getInitials = (name: string) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export const AuthorProfilePage = () => {
  const { authorName } = useParams();
  const [author, setAuthor] = useState<any>(null);
  const [authorPapers, setAuthorPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/author/${encodeURIComponent(authorName || '')}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setAuthor(data.author);
        setAuthorPapers(data.papers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [authorName]);

  if (loading) {
    return (
      <div className="container-custom py-16 text-center text-on-surface-variant font-serif italic text-xl">
        Loading author profile...
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container-custom py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl text-on-surface">Author not found</h1>
        <Link to="/authors" className="text-primary hover:underline inline-flex items-center gap-2 justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to Authors
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 md:py-16">
      <Link
        to="/authors"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Authors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Author Info */}
        <aside className="space-y-6">
          <div className="glass-card p-8 text-center space-y-6">
            <div className="w-28 h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto font-serif text-3xl">
              {getInitials(author.name)}
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl md:text-3xl text-on-surface leading-tight">{author.name}</h1>
              {author.institution && (
                <p className="text-on-surface-variant text-sm flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" /> {author.institution}
                </p>
              )}
            </div>

            <div className="editorial-divider" />

            <div>
              <p className="font-serif text-2xl text-on-surface">{author.totalPublications ?? authorPapers.length}</p>
              <p className="label-caps mt-1">Publications</p>
            </div>

            {author.researchAreas?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="label-caps">Research Areas</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {author.researchAreas.map((area: string) => (
                    <span
                      key={area}
                      className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verified identity (enrichment) */}
          {(author.orcid || (author.affiliations?.length ?? 0) > 0 || author.enrichment_status) && (
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="label-caps">Verified Identity</h3>
                {author.enrichment_confidence && (
                  <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-bold text-on-secondary-container">
                    {Math.round(Number(author.enrichment_confidence) * 100)}% confidence
                  </span>
                )}
              </div>

              {author.orcid ? (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">ORCID</p>
                  <a
                    href={`https://orcid.org/${author.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-mono text-primary hover:underline"
                  >
                    <BadgeCheck className="h-4 w-4 text-secondary" /> {author.orcid}
                  </a>
                </div>
              ) : (
                <p className="text-xs italic text-on-surface-variant/70">No ORCID found yet.</p>
              )}

              {author.affiliations?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">Affiliations</p>
                  {author.affiliations.map((aff: any, i: number) => (
                    <div key={i} className="text-sm text-on-surface flex items-start gap-1.5">
                      <Building className="h-3.5 w-3.5 mt-0.5 shrink-0 text-on-surface-variant" />
                      <span>
                        {aff.organization_name}{aff.country ? ` · ${aff.country}` : ''}
                        {aff.ror_id && (
                          <a href={aff.ror_id} target="_blank" rel="noopener noreferrer" className="ml-1.5 inline-flex items-center text-xs text-primary hover:underline">
                            ROR <ExternalLink className="h-3 w-3 ml-0.5" />
                          </a>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {typeof author.works_count === 'number' && author.works_count > 0 && (
                <p className="text-xs text-on-surface-variant">{author.works_count} indexed works (OpenAlex)</p>
              )}

              <p className="text-[11px] text-on-surface-variant/60 italic pt-1 border-t border-outline-variant/40">
                Source: OpenAlex · ORCID · ROR. {author.enrichment_status === 'enriched' ? 'Verified.' : 'Pending enrichment.'}
              </p>
            </div>
          )}

          {author.bio && (
            <div className="glass-card p-8 space-y-3">
              <h3 className="label-caps">Biography</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{author.bio}</p>
            </div>
          )}
        </aside>

        {/* Published Papers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/60 pb-4">
            <h2 className="font-serif text-2xl text-on-surface flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Published Research
            </h2>
            <p className="text-sm text-on-surface-variant">
              {authorPapers.length} {authorPapers.length === 1 ? 'paper' : 'papers'}
            </p>
          </div>

          {authorPapers.length === 0 ? (
            <div className="glass-card text-center py-16">
              <FileText className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-4" />
              <p className="text-on-surface-variant italic font-serif">No papers currently listed for this author.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {authorPapers.map((paper) => (
                <Link
                  key={paper.id}
                  to={`/paper/${paper.id}`}
                  className="glass-card p-6 group block transition-all duration-300 hover:-translate-y-[2px] hover:border-primary/40 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    {paper.topic && <span className="label-caps text-primary">{paper.topic}</span>}
                    {paper.created_at && (
                      <span className="text-xs text-on-surface-variant">
                        {new Date(paper.created_at).getFullYear()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-on-surface leading-snug group-hover:text-primary transition-colors">
                    {paper.title}
                  </h3>
                  {paper.abstract && (
                    <p className="text-on-surface-variant text-sm line-clamp-3 leading-relaxed">{paper.abstract}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
