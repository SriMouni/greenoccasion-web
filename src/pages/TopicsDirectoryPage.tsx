import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BookOpen } from 'lucide-react';
import { useJournal } from '../lib/journal';

export const TopicsDirectoryPage = () => {
  const { name } = useJournal();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => {
        setTopics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 md:py-16 container-custom min-h-screen">
      {/* Editorial header */}
      <header className="space-y-4 mb-8">
        <h1 className="font-serif font-bold text-4xl md:text-5xl text-primary leading-tight">Research Topics</h1>
        <p className="max-w-2xl text-muted text-base leading-relaxed">
          Browse peer-reviewed research organized by field — from carbon emissions and climate
          policy to pollution, waste, and the sustainable-future transition.
        </p>
      </header>

      <div className="editorial-divider" />

      {/* Field grid */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-h-[260px] rounded-2xl border border-line/60 bg-surface-bright animate-pulse" />
          ))}
        </section>
      ) : topics.length === 0 ? (
        <div className="rounded-2xl border border-line/70 bg-surface-bright py-20 px-8 text-center">
          <h3 className="font-serif text-2xl text-ink mb-2">No fields yet</h3>
          <p className="text-muted">Research fields will appear here as papers are published.</p>
        </div>
      ) : (
        <section className="sm:columns-2 lg:columns-3 [column-gap:1.5rem]">
          {topics.map((t) => {
            // Masonry: card height scales with the field's paper count (bigger field = taller card).
            const count = Number(t.paper_count) || 0;
            const height = Math.min(420, Math.max(230, 224 + count * 18));
            return (
              <Link
                key={t.field}
                to={`/topics/${encodeURIComponent(t.field)}`}
                style={{ height }}
                className="group relative mb-6 flex break-inside-avoid flex-col justify-end overflow-hidden rounded-2xl border border-line/60 shadow-[0_2px_14px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
              >
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(t.field)}/800/900`}
                  alt={t.field}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/50 to-transparent" />
                <div className="relative p-6 text-neutral space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral/80">
                    <FileText className="w-3.5 h-3.5" />
                    {t.paper_count} {Number(t.paper_count) === 1 ? 'paper' : 'papers'}
                    {t.topic_count ? ` · ${t.topic_count} topics` : ''}
                  </span>
                  <h3 className="font-serif text-2xl leading-snug">{t.field}</h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral/90 transition-transform group-hover:translate-x-1">
                    View papers
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {/* CTA band */}
      <section className="mt-16 rounded-2xl border border-primary-dark/20 bg-primary-dark px-8 py-12 text-center shadow-[0_10px_30px_rgba(4,47,46,0.15)]">
        <BookOpen className="mx-auto mb-4 h-8 w-8 text-primary-fixed" />
        <h2 className="font-serif text-3xl text-neutral mb-3">Publish your climate research</h2>
        <p className="mx-auto max-w-2xl text-neutral/70 leading-relaxed mb-8">
          Share your findings with {name} — an open-access, peer-reviewed journal advancing the
          science of climate change and a sustainable future.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-md bg-neutral px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark transition-colors hover:bg-primary-fixed"
          >
            Submit Research
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-md border border-neutral/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral transition-colors hover:bg-neutral hover:text-primary-dark"
          >
            Author Guidelines
          </Link>
        </div>
      </section>
    </div>
  );
};
