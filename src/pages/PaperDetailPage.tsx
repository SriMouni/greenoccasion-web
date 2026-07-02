import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { describeLicense } from '../licenses/license-display.ts';
import { apiUrl } from '../lib/api-base.ts';
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

// Heavy PDF.js viewer — lazy-loaded so pdfjs only ships when a PDF is actually opened.
const PdfViewer = lazy(() => import('../components/PdfViewer.tsx'));

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

export const PaperDetailPage = () => {
  const { id } = useParams();
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
  const authorList = (paper.author_names || 'Unknown Author').split(',').map((n: string) => n.trim()).filter(Boolean);
  const keywords: string[] = String(paper.topic || '').split(/[,/&]| and /i).map((k) => k.trim()).filter(Boolean);
  const aiTags: string[] = Array.isArray(paper.ai_tags) ? paper.ai_tags : [];

  return (
    <main className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="mb-10">
        <Link to="/papers" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors group">
          <ArrowLeft className="h-[18px] w-[18px]" />
          <span className="text-xs font-semibold uppercase tracking-[0.05em]">Back to Research</span>
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">{paper.title}</h1>
          <p className="font-serif text-lg text-on-surface-variant italic">
            By {authorList.map((name: string, i: number) => (
              <React.Fragment key={`${name}-${i}`}>
                <Link to={`/author/${encodeURIComponent(name)}`} className="text-on-surface font-semibold not-italic hover:text-primary">{name}</Link>
                {i < authorList.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </p>

          {/* Action bar */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {pdfStored ? (
              <a
                href={apiUrl(`/api/paper/${paper.id}/download`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPaper({ ...paper, downloads: paper.downloads + 1 })}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold shadow-md hover:bg-primary-dark transition-colors"
              >
                <Download className="h-5 w-5" /> Download PDF
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant">
                <Info className="h-4 w-4" /> Metadata only — no PDF stored
              </span>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-bold hover:bg-surface-container-low transition-colors"
              >
                <ExternalLink className="h-5 w-5" /> View at Source
              </a>
            )}
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors p-2"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button type="button" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors p-2" aria-label="Bookmark">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        <div className="lg:col-span-8 flex flex-col gap-12">
          {/* Why it matters (AI, DB-served) */}
          {paper.ai_significance && (
            <div className="rounded-xl border border-primary/20 bg-secondary-container/40 p-5 flex gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-on-secondary-container mb-1">Why it matters</p>
                <p className="text-sm leading-relaxed text-on-surface">{paper.ai_significance}</p>
              </div>
            </div>
          )}

          {/* Abstract */}
          <section>
            <h2 className="text-lg font-semibold text-primary border-b border-outline-variant pb-2 mb-6">Abstract</h2>
            <p className="text-base leading-relaxed text-on-surface-variant whitespace-pre-line">{paper.abstract}</p>
          </section>

          {/* Keywords / AI tags */}
          {(aiTags.length > 0 || keywords.length > 0) && (
            <section>
              <h2 className="text-lg font-semibold text-primary border-b border-outline-variant pb-2 mb-4">
                {aiTags.length > 0 ? 'Topics & Tags' : 'Keywords'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(aiTags.length > 0 ? aiTags : keywords).map((kw: string) => (
                  <span key={kw} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">{kw}</span>
                ))}
              </div>
            </section>
          )}

          {/* AI analysis — pulled to the top for visibility */}
          <section className="order-first">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">AI Analysis</h2>
            </div>

            {!paper.ai_processed_at ? (
              <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                AI analysis isn’t available for this paper yet.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 mb-5">
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
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${active ? 'bg-primary text-on-primary' : 'border border-primary/40 text-primary hover:bg-surface-container-low'}`}
                      >
                        <Icon className="h-4 w-4" /> {b.label}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 min-h-[150px]">
                  {!aiTab ? (
                    <p className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Pick an option above to view the AI-generated analysis for this paper.
                    </p>
                  ) : aiProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-on-surface-variant">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-sm font-medium">AI processing…</p>
                    </div>
                  ) : aiTab === 'summary' ? (
                    <p className="text-base leading-relaxed text-on-surface-variant whitespace-pre-line">
                      {paper.ai_summary || 'No summary available.'}
                    </p>
                  ) : aiTab === 'short' ? (
                    <p className="text-base leading-relaxed text-on-surface font-medium">
                      {paper.ai_short_summary || 'No short summary available.'}
                    </p>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-base leading-relaxed text-on-surface-variant">
                        {renderWithHighlights(paper.abstract || '', Array.isArray(paper.ai_highlights) ? paper.ai_highlights : [])}
                      </p>
                      {Array.isArray(paper.ai_highlights) && paper.ai_highlights.length > 0 && (
                        <div className="space-y-2">
                          <p className="label-caps">Key passages</p>
                          <ul className="space-y-2">
                            {paper.ai_highlights.map((h: string, i: number) => (
                              <li key={i} className="text-sm leading-relaxed">
                                <mark className="bg-yellow-200 text-on-surface rounded px-1 py-0.5">{h}</mark>
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

          {/* Full text */}
          <section>
            <h2 className="text-lg font-semibold text-primary border-b border-outline-variant pb-2 mb-6">Full Text</h2>
            <div className="h-[800px] w-full bg-surface-container-lowest rounded-xl overflow-auto border border-outline-variant">
              {pdfStored && pdfUrl ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center text-sm text-muted">Loading viewer…</div>
                  }
                >
                  <PdfViewer
                    url={pdfUrl}
                    highlights={Array.isArray(paper.ai_highlights) ? paper.ai_highlights : []}
                  />
                </Suspense>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant space-y-4 px-6 text-center">
                  <FileText className="h-10 w-10 opacity-40" />
                  <p className="font-semibold text-primary">Full text hosted at the source</p>
                  <p className="text-sm max-w-md">
                    This record holds verified metadata. The publisher hosts the full PDF externally —
                    {sourceUrl ? ' open it at the source.' : ' no open-access link is available.'}
                  </p>
                  {sourceUrl && (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors">
                      <ExternalLink className="h-4 w-4" /> View at Source
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Discussion */}
          <section className="space-y-8">
            <h2 className="text-lg font-semibold text-primary border-b border-outline-variant pb-2">Discussion</h2>

            <form onSubmit={handleCommentSubmit} className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Add a Comment</h4>
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-3 outline-none focus:border-primary"
                required
              />
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write your comment…"
                className="w-full min-h-28 border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-3 outline-none focus:border-primary"
                required
              />
              <button type="submit" className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] hover:bg-primary-dark transition-colors">Submit</button>
              {commentStatus && <p className="text-sm text-on-surface-variant">{commentStatus}</p>}
            </form>

            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No approved comments yet.</p>
              ) : comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{comment.commenter_name}</h4>
                    <span className="text-[11px] text-on-surface-variant">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant whitespace-pre-wrap">{comment.body}</p>
                  <div className="h-px w-12 bg-outline-variant" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Page {commentsMeta.page} of {commentsMeta.totalPages} • {commentsMeta.total} comments
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={!commentsMeta.hasPrev} onClick={() => setCommentsPage((p) => Math.max(1, p - 1))} className="border border-outline-variant px-3 py-2 rounded text-[11px] uppercase tracking-[0.1em] disabled:opacity-50 hover:bg-surface-container">Previous</button>
                <button type="button" disabled={!commentsMeta.hasNext} onClick={() => setCommentsPage((p) => p + 1)} className="border border-outline-variant px-3 py-2 rounded text-[11px] uppercase tracking-[0.1em] disabled:opacity-50 hover:bg-surface-container">Next</button>
              </div>
            </div>
          </section>
        </div>

        {/* Right rail */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-[0px_4px_20px_rgba(45,45,45,0.05)]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-4 flex items-center gap-2">
              <Info className="h-[18px] w-[18px]" /> Scientific Metadata
            </h3>
            <dl className="space-y-4">
              {paper.doi && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-on-surface-variant">DOI</dt>
                  <dd>
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline break-all">{paper.doi}</a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-on-surface-variant">Publication Date</dt>
                <dd className="text-sm">{pubDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-on-surface-variant">Source / Journal</dt>
                <dd className="text-sm">{sourceName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-on-surface-variant">License</dt>
                <dd className="text-sm">
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
                <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-on-surface-variant">Indexed Via</dt>
                <dd className="text-sm flex items-center gap-1">OpenAlex / Semantic Scholar <BadgeCheck className="h-3.5 w-3.5 text-secondary" /></dd>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
                  <span className="w-2 h-2 bg-secondary rounded-full" />
                  {license ? 'Open Access' : 'Status: ' + (paper.status || 'approved')}
                </div>
              </div>
            </dl>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-4">How to Cite</h3>
            <div className="flex gap-2 mb-3">
              {(['apa', 'mla', 'bibtex'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setCitationStyle(style)}
                  className={`text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 rounded transition-colors ${citationStyle === style ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-outline-variant'}`}
                >
                  {style}
                </button>
              ))}
            </div>
            <p className="text-sm text-on-surface mb-4 whitespace-pre-wrap leading-relaxed">{citationText || 'Citation unavailable.'}</p>
            <button onClick={handleCopyCitation} className="w-full bg-surface-container-high hover:bg-outline-variant text-on-surface py-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
              {copied ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />} {copied ? 'Copied!' : 'Copy Citation'}
            </button>
          </div>

          <h3 className="text-lg font-semibold text-primary mb-2">Related Research</h3>
          {related.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No related papers yet.</p>
          ) : related.map((rel) => (
            <Link key={rel.id} to={`/paper/${rel.id}`} className="block bg-surface-container-lowest border border-outline-variant p-4 rounded-lg group hover:border-secondary transition-all">
              <img src={`https://picsum.photos/seed/${rel.id}/400/200`} alt="" className="w-full h-32 object-cover rounded mb-4" referrerPolicy="no-referrer" />
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-secondary">{rel.topic}</span>
              <h4 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors line-clamp-2">{rel.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{rel.author_names || 'Unknown author'}</p>
            </Link>
          ))}

          <div className="bg-primary-container text-on-primary-container p-6 rounded-xl flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 shrink-0" />
            <div>
              <h4 className="font-bold mb-1">License &amp; Attribution</h4>
              <p className="text-sm opacity-90">
                {license
                  ? `Published by ${sourceName} under the ${license.name} license${license.requiresAttribution ? ', which permits sharing and adaptation with attribution to the original authors and source.' : ' (public domain).'}`
                  : 'License is recorded per the ingestion policy. See the source for full terms.'}
              </p>
              {license?.url && (
                <a href={license.url} target="_blank" rel="noopener noreferrer license" className="inline-block mt-3 text-xs font-bold underline">Read {license.name} Terms</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
