import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BookOpen } from 'lucide-react';

export const TopicsDirectoryPage = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => {
        setTopics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-12 md:py-16 container-custom min-h-screen">
      {/* Editorial header */}
      <header className="space-y-4 mb-10">
        <p className="label-caps">Scientific Taxonomy</p>
        <h1 className="font-serif font-bold text-4xl md:text-5xl text-primary leading-tight">
          Thematic Domains
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-base leading-relaxed">
          Browse our research collections organized by domain &mdash; from
          microplastics and pollution to biodiversity, climate, and beyond.
        </p>
      </header>

      <div className="editorial-divider" />

      {/* Topic grid */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant font-serif italic text-lg">
          Loading domains&hellip;
        </div>
      ) : topics.length === 0 ? (
        <div className="glass-card py-20 px-8 text-center">
          <h3 className="font-serif text-2xl text-primary mb-2">No domains yet</h3>
          <p className="text-on-surface-variant">
            Research domains will appear here as papers are published.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <Link
              key={t.field}
              to={`/topics/${encodeURIComponent(t.field)}`}
              className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-xl border border-outline-variant shadow-[0px_4px_20px_rgba(45,45,45,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_12px_30px_rgba(45,45,45,0.18)]"
            >
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(t.field)}/800/600`}
                alt={t.field}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/55 to-transparent" />
              <div className="relative p-6 text-neutral space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral/80">
                  <FileText className="w-3.5 h-3.5" />
                  {t.paper_count} Publications · {t.topic_count} topics
                </span>
                <h3 className="font-serif text-2xl leading-snug">{t.field}</h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral/90 transition-transform group-hover:translate-x-1">
                  Explore Domain
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* CTA band */}
      <section className="mt-16 rounded-xl border border-outline-variant bg-primary px-8 py-12 text-center shadow-[0px_4px_20px_rgba(45,45,45,0.08)]">
        <BookOpen className="mx-auto mb-4 h-8 w-8 text-on-primary-container" />
        <h2 className="font-serif text-3xl text-on-primary mb-3">
          Contributing to Global Research
        </h2>
        <p className="mx-auto max-w-2xl text-on-primary-container leading-relaxed mb-8">
          Share your findings with a community committed to ecological insight and
          environmental stewardship. We welcome submissions across every domain.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-md bg-neutral px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface-container-low"
          >
            Submit Research
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-md border border-neutral/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral transition-colors hover:bg-neutral hover:text-primary"
          >
            Author Guidelines
          </Link>
        </div>
      </section>
    </div>
  );
};
