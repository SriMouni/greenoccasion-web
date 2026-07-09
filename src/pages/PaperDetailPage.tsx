import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { describeLicense } from '../licenses/license-display.ts';
import { apiUrl } from '../lib/api-base.ts';
import { useJournal } from '../lib/journal';
import {
  AlignLeft,
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Copy,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Highlighter,
  Info,
  Loader2,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wrap any AI-identified key sentences found in the text with a yellow highlight.
const renderWithHighlights = (text: string, highlights: string[]) => {
  const valid = (highlights || []).map((h) => h.trim()).filter((h) => h.length > 8);
  if (!text || valid.length === 0) return text;

  const lowerSet = new Set(valid.map((v) => v.toLowerCase()));
  const pattern = valid.sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');

  let regex: RegExp;
  try {
    regex = new RegExp(`(${pattern})`, 'gi');
  } catch {
    return text;
  }

  return text.split(regex).map((part, i) =>
    lowerSet.has(part.toLowerCase())
      ? <mark key={i} className="bg-yellow-200 text-on-surface rounded px-0.5">{part}</mark>
      : <span key={i}>{part}</span>
  );
};

// Get-or-create a <meta name="robots"> tag so we can flip indexability per paper.
const setRobotsMeta = (content: string) => {
  let tag = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'robots');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const PaperDetailPage = () => {
  const { id } = useParams();
  const { name: journalName } = useJournal();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [related, setRelated] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentStatus, setCommentStatus] = useState('');
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsMeta, setCommentsMeta] = useState({ page: 1, totalPages: 1, total: 0, hasPrev: false, hasNext: false });
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [citationText, setCitationText] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiTab, setAiTab] = useState<'highlights' | 'summary' | 'short' | null>('summary');
  const [aiProcessing, setAiProcessing] = useState(false);

  // Show a brief "AI processing" animation, then reveal the pre-computed result.
  const openAiTab = (tab: 'highlights' | 'summary' | 'short') => {
    setAiTab(tab);
    setAiProcessing(true);
    window.setTimeout(() => setAiProcessing(false), 900);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/paper/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setPaper(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  // SEO: aggregated (open-access, republished) papers are duplicate content — keep them
  // out of Google's index so they can't dilute or downrank our original journal. Original
  // papers stay indexable. Restore the default on unmount.
  useEffect(() => {
    if (!paper) return;
    const isOriginal = paper.origin === 'original';
    setRobotsMeta(isOriginal ? 'index,follow' : 'noindex,follow');
    return () => setRobotsMeta('index,follow');
  }, [paper]);

  useEffect(() => {
    if (!id) return;
    // Related-by-tags (DB only). Fall back to the latest papers if there are no matches.
    fetch(`/api/paper/${id}/related`)
      .then(res => res.json())
      .then(async (data) => {
        let list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          const latest = await fetch('/api/papers').then(r => r.json()).catch(() => []);
          if (Array.isArray(latest)) list = latest.filter((p: any) => p.id !== id).slice(0, 2);
        }
        setRelated(list);
      })
      .catch(() => setRelated([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/paper/${id}/comments?page=${commentsPage}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
          setCommentsMeta({ page: 1, totalPages: 1, total: data.length, hasPrev: false, hasNext: false });
          return;
        }
        setComments(Array.isArray(data?.items) ? data.items : []);
        setCommentsMeta({
          page: data?.pagination?.page || 1,
          totalPages: data?.pagination?.totalPages || 1,
          total: data?.pagination?.total || 0,
          hasPrev: Boolean(data?.pagination?.hasPrev),
          hasNext: Boolean(data?.pagination?.hasNext),
        });
      })
      .catch(() => {
        setComments([]);
        setCommentsMeta({ page: 1, totalPages: 1, total: 0, hasPrev: false, hasNext: false });
      });
  }, [id, commentsPage]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/paper/${id}/citation?style=${citationStyle}`)
      .then((res) => res.json())
      .then((data) => setCitationText(data?.text || ''))
      .catch(() => setCitationText(''));
  }, [id, citationStyle]);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCommentStatus('');
    const response = await fetch(`/api/paper/${paper.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commenterName: commentName, body: commentBody }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setCommentStatus(payload?.error || 'Unable to submit comment right now.');
      return;
    }
    setCommentName('');
    setCommentBody('');
    setCommentsPage(1);
    setCommentStatus(payload?.message || 'Comment submitted for moderation.');
  };

  const handleCopyCitation = async () => {
    if (!citationText) return;
    await navigator.clipboard.writeText(citationText);
    fetch(`/api/paper/${paper.id}/cite`, { method: 'POST' });
    setPaper({ ...paper, citations: paper.citations + 1 });
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (loading) {
    return <div className="container-custom py-32 text-center text-on-surface-variant font-serif italic text-xl">Loading paper details…</div>;
  }

  if (error || !paper) {
    return (
      <div className="container-custom py-32 text-center">
        <h1 className="font-serif text-3xl font-bold text-primary">Paper not found</h1>
        <Link to="/papers" className="text-on-surface-variant hover:text-primary mt-4 inline-block underline">Back to Research Papers</Link>
      </div>
    );
  }

  const pdfUrl = paper.pdf_url ? apiUrl(paper.pdf_url) : null;   // inline-viewable only when stored on-site
  const pdfStored = Boolean(paper.pdf_stored);   // a real PDF saved in our storage
  const sourceUrl = paper.source_url || (paper.doi ? `https://doi.org/${paper.doi}` : null);
  // Resolve a displayable license (name + official deed link) for attribution.
  const license = describeLicense({ licenseName: paper.license_name, licenseCode: paper.license_url });
  // Original publisher/journal this paper came from (falls back to the data aggregators).
  const sourceName = paper.source_name || 'OpenAlex / Semantic Scholar';
  const pubDate = paper.created_at ? new Date(paper.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const pubYear = paper.publication_year || (paper.created_at ? new Date(paper.created_at).getFullYear() : null);
  const authorList = (paper.author_names || 'Unknown Author').split(',').map((n: string) => n.trim()).filter(Boolean);
  const keywords: string[] = String(paper.topic || '').split(/[,/&]| and /i).map((k) => k.trim()).filter(Boolean);
  const aiTags: string[] = Array.isArray(paper.ai_tags) ? paper.ai_tags : [];

  const card = 'rounded-2xl border border-line/70 bg-surface-bright shadow-[0_2px_16px_rgba(15,23,42,0.05)]';
  const sectionHeading = 'font-serif text-2xl font-bold text-ink border-b border-line/60 pb-3 mb-6';

  return (
    <div className="min-h-screen">
      {/* ── Header band ── */}
      <section className="border-b border-line/60 bg-surface-bright">
        <div className="container-custom py-8 md:py-10">
          <Link to="/papers" className="mb-7 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold uppercase tracking-[0.05em] text-xs">Back to Research</span>
          </Link>

          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              {paper.topic && <span className="label-caps text-primary">{paper.topic}</span>}
              {paper.origin === 'original' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-neutral">
                  <BadgeCheck className="h-3 w-3" /> Published by {journalName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  Indexed · Open-Access from {sourceName}
                </span>
              )}
              {license && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-on-secondary-container">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Open Access
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-ink">{paper.title}</h1>

            <p className="mt-5 font-serif text-lg italic text-muted">
              By {authorList.map((name: string, i: number) => (
                <React.Fragment key={`${name}-${i}`}>
                  <Link to={`/author/${encodeURIComponent(name)}`} className="font-semibold not-italic text-ink hover:text-primary">{name}</Link>
                  {i < authorList.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </p>

            {/* Meta row — real values */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {pubYear && <span className="inline-flex items-center gap-1.5"><Info className="h-4 w-4" /> {pubDate}</span>}
              <span className="hidden sm:inline text-line">·</span>
              <span>{sourceName}</span>
              {typeof paper.downloads === 'number' && paper.downloads > 0 && (
                <><span className="hidden sm:inline text-line">·</span><span className="inline-flex items-center gap-1.5"><Download className="h-4 w-4" /> {paper.downloads.toLocaleString()} downloads</span></>
              )}
              {typeof paper.citations === 'number' && paper.citations > 0 && (
                <><span className="hidden sm:inline text-line">·</span><span>{paper.citations.toLocaleString()} citations</span></>
              )}
            </div>

            {/* Action bar */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {pdfStored ? (
                <a
                  href={apiUrl(`/api/paper/${paper.id}/download`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPaper({ ...paper, downloads: (paper.downloads || 0) + 1 })}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-neutral shadow-sm transition-colors hover:bg-primary-dark"
                >
                  <Download className="h-5 w-5" /> Download PDF
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg bg-surface-container px-4 py-3 text-sm font-semibold text-muted">
                  <Info className="h-4 w-4" /> Metadata only — no PDF stored
                </span>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-line/80 bg-surface-bright px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <ExternalLink className="h-5 w-5" /> View at Source
                </a>
              )}
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                className="rounded-lg p-3 text-muted transition-colors hover:bg-surface-container hover:text-primary"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-lg p-3 text-muted transition-colors hover:bg-surface-container hover:text-primary" aria-label="Bookmark">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container-custom py-10 md:py-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="min-w-0 flex flex-col gap-12">
          {/* Why it matters (AI, DB-served) */}
          {paper.ai_significance && (
            <div className="flex gap-3 rounded-2xl border border-primary/20 bg-secondary-container/40 p-5">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-on-secondary-container">Why it matters</p>
                <p className="text-sm leading-relaxed text-ink">{paper.ai_significance}</p>
              </div>
            </div>
          )}

          {/* AI analysis */}
          <section>
            <h2 className={`${sectionHeading} flex items-center gap-2`}>
              <Sparkles className="h-5 w-5 text-primary" /> AI Analysis
            </h2>

            {!paper.ai_processed_at ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface-container-low p-6 text-sm text-muted">
                AI analysis isn’t available for this paper yet.
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap gap-3">
                  {([
                    { key: 'highlights', label: 'Highlights', icon: Highlighter },
                    { key: 'summary', label: 'Generate Summary', icon: FileText },
                    { key: 'short', label: 'Short Summary', icon: AlignLeft },
                  ] as const).map((b) => {
                    const Icon = b.icon;
                    const active = aiTab === b.key;
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => openAiTab(b.key)}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${active ? 'bg-primary text-neutral' : 'border border-line/80 text-primary hover:bg-surface-container-low'}`}
                      >
                        <Icon className="h-4 w-4" /> {b.label}
                      </button>
                    );
                  })}
                </div>

                <div className={`${card} p-6 min-h-[150px]`}>
                  {!aiTab ? (
                    <p className="flex items-center gap-2 text-sm text-muted">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Pick an option above to view the AI-generated analysis for this paper.
                    </p>
                  ) : aiProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-sm font-medium">AI processing…</p>
                    </div>
                  ) : aiTab === 'summary' ? (
                    <p className="text-base leading-relaxed text-muted whitespace-pre-line">
                      {paper.ai_summary || 'No summary available.'}
                    </p>
                  ) : aiTab === 'short' ? (
                    <p className="text-base font-medium leading-relaxed text-ink">
                      {paper.ai_short_summary || 'No short summary available.'}
                    </p>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-base leading-relaxed text-muted">
                        {renderWithHighlights(paper.abstract || '', Array.isArray(paper.ai_highlights) ? paper.ai_highlights : [])}
                      </p>
                      {Array.isArray(paper.ai_highlights) && paper.ai_highlights.length > 0 && (
                        <div className="space-y-2">
                          <p className="label-caps">Key passages</p>
                          <ul className="space-y-2">
                            {paper.ai_highlights.map((h: string, i: number) => (
                              <li key={i} className="text-sm leading-relaxed">
                                <mark className="rounded bg-yellow-200 px-1 py-0.5 text-on-surface">{h}</mark>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Abstract */}
          <section>
            <h2 className={sectionHeading}>Abstract</h2>
            <p className="text-base leading-relaxed text-muted whitespace-pre-line">{paper.abstract}</p>
          </section>

          {/* Keywords / AI tags */}
          {(aiTags.length > 0 || keywords.length > 0) && (
            <section>
              <h2 className={sectionHeading}>{aiTags.length > 0 ? 'Topics & Tags' : 'Keywords'}</h2>
              <div className="flex flex-wrap gap-2">
                {(aiTags.length > 0 ? aiTags : keywords).map((kw: string) => (
                  <span key={kw} className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">{kw}</span>
                ))}
              </div>
            </section>
          )}

          {/* Full text */}
          <section>
            <h2 className={sectionHeading}>Full Text</h2>
            <div className="h-[800px] w-full overflow-hidden rounded-2xl border border-line/70 bg-surface-container-lowest">
              {pdfStored && pdfUrl ? (
                <iframe src={`${pdfUrl}#toolbar=0&navpanes=0`} className="h-full w-full border-none" title="PDF Viewer" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-4 px-6 text-center text-muted">
                  <FileText className="h-10 w-10 opacity-40" />
                  <p className="font-serif text-lg font-semibold text-ink">Full text hosted at the source</p>
                  <p className="max-w-md text-sm">
                    This record holds verified metadata. The publisher hosts the full PDF externally —
                    {sourceUrl ? ' open it at the source.' : ' no open-access link is available.'}
                  </p>
                  {sourceUrl && (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-neutral transition-colors hover:bg-primary-dark">
                      <ExternalLink className="h-4 w-4" /> View at Source
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Discussion */}
          <section className="space-y-8">
            <h2 className="font-serif text-2xl font-bold text-ink border-b border-line/60 pb-3">Discussion</h2>

            <form onSubmit={handleCommentSubmit} className={`${card} space-y-4 p-6`}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Add a Comment</h4>
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-line/70 bg-surface-bright px-3 py-3 outline-none focus:border-primary"
                required
              />
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write your comment…"
                className="min-h-28 w-full rounded-lg border border-line/70 bg-surface-bright px-3 py-3 outline-none focus:border-primary"
                required
              />
              <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral transition-colors hover:bg-primary-dark">Submit</button>
              {commentStatus && <p className="text-sm text-muted">{commentStatus}</p>}
            </form>

            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-sm italic text-muted">No approved comments yet.</p>
              ) : comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{comment.commenter_name}</h4>
                    <span className="text-[11px] text-muted">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">{comment.body}</p>
                  <div className="h-px w-12 bg-line" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
                Page {commentsMeta.page} of {commentsMeta.totalPages} • {commentsMeta.total} comments
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={!commentsMeta.hasPrev} onClick={() => setCommentsPage((p) => Math.max(1, p - 1))} className="rounded border border-line/80 px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors hover:bg-surface-container disabled:opacity-50">Previous</button>
                <button type="button" disabled={!commentsMeta.hasNext} onClick={() => setCommentsPage((p) => p + 1)} className="rounded border border-line/80 px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors hover:bg-surface-container disabled:opacity-50">Next</button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right rail ── */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <div className={`${card} p-6`}>
            <h3 className="label-caps mb-4 flex items-center gap-2"><Info className="h-4 w-4" /> Scientific Metadata</h3>
            <dl className="space-y-4">
              {paper.doi && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">DOI</dt>
                  <dd>
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="font-mono-label text-xs text-primary hover:underline break-all">{paper.doi}</a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Publication Date</dt>
                <dd className="text-sm text-ink">{pubDate}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Source / Journal</dt>
                <dd className="text-sm text-ink">{sourceName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">License</dt>
                <dd className="text-sm text-ink">
                  {license ? (
                    license.url ? (
                      <a href={license.url} target="_blank" rel="noopener noreferrer license" className="text-primary hover:underline">{license.name}</a>
                    ) : (
                      license.name
                    )
                  ) : (
                    'See source for terms'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Indexed Via</dt>
                <dd className="flex items-center gap-1 text-sm text-ink">OpenAlex / Semantic Scholar <BadgeCheck className="h-3.5 w-3.5 text-secondary" /></dd>
              </div>
              <div className="border-t border-line/60 pt-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  {license ? 'Open Access' : 'Status: ' + (paper.status || 'approved')}
                </div>
              </div>
            </dl>
          </div>

          <div className={`${card} p-6`}>
            <h3 className="label-caps mb-4">How to Cite</h3>
            <div className="mb-3 flex gap-2">
              {(['apa', 'mla', 'bibtex'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setCitationStyle(style)}
                  className={`rounded px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] transition-colors ${citationStyle === style ? 'bg-primary text-neutral' : 'bg-surface-container text-ink hover:bg-surface-container-high'}`}
                >
                  {style}
                </button>
              ))}
            </div>
            <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{citationText || 'Citation unavailable.'}</p>
            <button onClick={handleCopyCitation} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-container-high">
              {copied ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />} {copied ? 'Copied!' : 'Copy Citation'}
            </button>
          </div>

          <div>
            <h3 className="label-caps mb-3">Related Research</h3>
            <div className="space-y-4">
              {related.length === 0 ? (
                <p className="text-sm text-muted">No related papers yet.</p>
              ) : related.map((rel) => (
                <Link key={rel.id} to={`/paper/${rel.id}`} className={`${card} group block overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40`}>
                  <img src={`https://picsum.photos/seed/${rel.id}/400/200`} alt="" className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                  <div className="p-4">
                    <span className="label-caps">{rel.topic}</span>
                    <h4 className="mt-2 font-serif text-base font-bold leading-snug text-ink transition-colors group-hover:text-primary line-clamp-2">{rel.title}</h4>
                    <p className="mt-1 text-xs text-muted">{rel.author_names || 'Unknown author'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-primary-dark p-6 text-neutral">
            <ShieldCheck className="h-8 w-8 shrink-0 text-primary-fixed" />
            <div>
              <h4 className="font-serif text-lg font-bold">License &amp; Attribution</h4>
              <p className="mt-1 text-sm text-neutral/80">
                {license
                  ? `Published by ${sourceName} under the ${license.name} license${license.requiresAttribution ? ', which permits sharing and adaptation with attribution to the original authors and source.' : ' (public domain).'}`
                  : 'License is recorded per the ingestion policy. See the source for full terms.'}
              </p>
              {license?.url && (
                <a href={license.url} target="_blank" rel="noopener noreferrer license" className="mt-3 inline-block text-xs font-bold text-primary-fixed underline">Read {license.name} Terms</a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
