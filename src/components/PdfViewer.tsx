import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Loader2 } from 'lucide-react';

// Vite bundles the worker from this URL (official react-pdf recipe).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Normalize for fuzzy matching between AI highlights and the PDF text layer:
// lowercase, strip hyphens/soft-hyphens (PDF line-break hyphenation), collapse
// whitespace, drop punctuation.
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // drops punctuation + hyphens (incl. line-break hyphenation)
    .replace(/\s+/g, ' ')
    .trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const MARK = 'background:#fde047;color:inherit;border-radius:2px;';

type Props = { url: string; highlights?: string[] };

export default function PdfViewer({ url, highlights = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(760);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.min(900, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One normalized blob of all highlight sentences; a text run is highlighted when
  // it (normalized, length >= 5) appears inside it — catches the words of each
  // highlighted sentence even though the PDF splits them into many small runs.
  const blob = useMemo(() => norm(highlights.join('  ')), [highlights]);

  const textRenderer = useCallback(
    (item: { str: string }) => {
      const t = norm(item.str);
      if (t.length >= 5 && blob.includes(t)) {
        return `<mark style="${MARK}">${escapeHtml(item.str)}</mark>`;
      }
      return escapeHtml(item.str);
    },
    [blob],
  );

  const file = useMemo(() => ({ url }), [url]);

  if (error) {
    return (
      <div className="p-8 text-center text-sm text-muted">
        Couldn’t render the PDF inline.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          Open it in a new tab
        </a>
        .
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 py-4">
      <Document
        file={file}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={() => setError(true)}
        loading={
          <div className="flex items-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading PDF…
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="mb-4 shadow-sm ring-1 ring-line/60">
            <Page
              pageNumber={i + 1}
              width={width}
              customTextRenderer={textRenderer}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>
      {highlights.length > 0 && (
        <p className="text-xs text-muted">
          <span style={{ background: '#fde047', borderRadius: 2, padding: '0 4px' }}>Yellow</span> = AI-identified key
          passages.
        </p>
      )}
    </div>
  );
}
