import { type FC, type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api-base.ts';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Download,
  Globe,
  Highlighter,
  Layers,
  LayoutGrid,
  Quote,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TOPICS } from '../data/mockData';
import { useJournal } from '../lib/journal';

const ETHOS = [
  { icon: BookOpen, title: 'Climate Research', text: 'A unified, searchable repository of peer-reviewed climate change and sustainability research.' },
  { icon: Layers, title: 'Sustainable Futures', text: 'Advancing the science of decarbonization, resilience, and the transition to a low-carbon world.' },
  { icon: ShieldCheck, title: 'Rigorous Review', text: 'Double-blind peer review ensuring the highest standards of scientific integrity.' },
  { icon: Globe, title: 'Open Access', text: 'Democratizing climate intelligence for a sustainable and resilient future for all.' },
];

const FEATURES = [
  { icon: Highlighter, title: 'AI Highlights', text: 'Every paper’s key passages are automatically highlighted in yellow by AI — skim the essentials in seconds.', accent: true },
  { icon: Sparkles, title: 'AI Summaries', text: 'Instant long and short summaries, generated once and served to everyone — no waiting, no per-read cost.', accent: true },
  { icon: Search, title: 'Multi-Source Discovery', text: 'Surface research across OpenAlex and Semantic Scholar, automatically de-duplicated.' },
  { icon: Download, title: 'Open-Access PDFs', text: 'Full-text PDFs resolved via Unpaywall, arXiv and PMC — then self-hosted for reliable access.' },
  { icon: LayoutGrid, title: 'Smart Classification', text: 'Papers are organised into broad research domains by AI — browse by field, not noise.' },
  { icon: Quote, title: 'One-Click Citations', text: 'Copy APA, MLA or BibTeX instantly, with usage tracked per article.' },
];

const Reveal: FC<{ children: ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 26 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const initials = (name?: string) =>
  (name || 'Author')
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

type TopicRow = { field: string; paper_count: number | string; topic_count?: number };

export const HomePage = () => {
  const { name } = useJournal();
  const [papers, setPapers] = useState<any[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/papers')
      .then(res => res.json())
      .then(data => {
        setPapers(Array.isArray(data) ? data.slice(0, 24) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Home page fetch error:', err);
        setLoading(false);
      });

    fetch('/api/topics')
      .then(res => res.json())
      .then(data => setTopics(Array.isArray(data) ? data : []))
      .catch(() => setTopics([]));
  }, []);

  // Broad research fields from ingested papers; fall back to the static set if none yet.
  const featuredTopics = (topics.length > 0
    ? topics.slice(0, 5).map(t => ({ id: t.field, name: t.field, description: `${t.paper_count} publications across ${t.topic_count ?? ''} topics.` }))
    : TOPICS.slice(0, 5)
  );
  const spotlights = papers.slice(0, 2);
  const originals = papers.filter((p: any) => p.origin === 'original').slice(0, 3);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-primary-dark text-neutral">
        <img
          src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2400&q=85"
          alt="Forest canopy"
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Lighter tonal overlay so the photo stays clear while text remains legible. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(160deg, rgba(4,47,46,0.66) 0%, rgba(13,148,136,0.30) 45%, rgba(4,47,46,0.78) 100%)',
          }}
        />
        <div className="relative container-custom pt-36 pb-24 md:pt-44 md:pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <div className="flex items-center justify-center gap-3">
              <Link to="/papers" className="rounded-full bg-neutral px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark hover:bg-neutral/90 transition-colors">
                Explore Library
              </Link>
              <Link to="/topics" className="rounded-full border border-neutral/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral hover:bg-neutral/10 transition-colors">
                Browse Topics
              </Link>
            </div>

            <h1 className="mx-auto max-w-4xl font-serif text-5xl md:text-7xl font-bold leading-[0.98] tracking-tight">
              {name}
            </h1>

            <p className="mx-auto max-w-2xl text-base md:text-lg text-neutral/75 leading-relaxed">
              A peer-reviewed, open-access journal advancing the science of climate change,
              decarbonization, and resilient pathways to a sustainable future.
            </p>

            <div className="pt-6 flex justify-center">
              <ChevronDown className="h-6 w-6 text-neutral/60 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Our Ethos ── */}
      <section className="container-custom py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-flex rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary">
            Our Ethos
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-snug">
            Advancing climate science for a sustainable and resilient future.
          </h2>
          <p className="text-muted leading-relaxed">
            {name} is a critical bridge between rigorous climate research and real-world
            action — publishing peer-reviewed work on mitigation, adaptation, and the transition
            to a low-carbon world, and making it openly accessible to researchers everywhere.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ETHOS.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={i * 0.08}
              className="space-y-3 rounded-2xl border border-line/70 bg-surface-bright p-7 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:border-primary/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-xl font-semibold text-ink">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className="relative overflow-hidden bg-primary-dark text-neutral py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(94,234,212,0.18), transparent 45%), radial-gradient(circle at 85% 80%, rgba(79,70,229,0.18), transparent 45%)',
          }}
        />
        <div className="relative container-custom">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral/25 px-3 py-1 text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral/80">
              <Sparkles className="h-3.5 w-3.5" /> Built with AI
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Everything you need, intelligently automated</h2>
            <p className="text-neutral/70 leading-relaxed">
              From discovery to reading, {name} layers AI across the whole research
              lifecycle — so every paper arrives summarised, highlighted, and organised.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, text, accent }, i) => (
              <Reveal
                key={title}
                delay={i * 0.06}
                className={`group rounded-2xl border p-6 transition-colors ${accent ? 'border-primary-fixed/30 bg-neutral/[0.06] hover:bg-neutral/[0.1]' : 'border-neutral/10 bg-neutral/[0.03] hover:bg-neutral/[0.07]'}`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${accent ? 'bg-primary-fixed text-primary-dark' : 'bg-neutral/10 text-primary-fixed'}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
                  {title}
                  {accent && <span className="rounded-full bg-primary-fixed/20 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-primary-fixed">AI</span>}
                </h3>
                <p className="text-sm text-neutral/65 leading-relaxed">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thematic Domains ── */}
      <section className="bg-surface-container/50 border-y border-line/50 py-20 md:py-28">
        <div className="container-custom">
          <Reveal className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Thematic Domains</h2>
              <p className="text-muted mt-2">Comprehensive coverage of the climate and sustainability research landscape.</p>
            </div>
            <Link to="/topics" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary-dark">
              Browse all topics <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5">
            {featuredTopics.map((topic, index) => {
              const big = index < 2;
              return (
                <Link
                  key={topic.id}
                  to={`/topics/${encodeURIComponent(topic.id)}`}
                  className={`group relative overflow-hidden rounded-xl flex items-end ${big ? 'md:col-span-3 min-h-[440px]' : 'md:col-span-2 min-h-[360px]'}`}
                >
                  <img
                    src={`https://picsum.photos/seed/${topic.id}/900/600`}
                    alt={topic.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/40 to-transparent" />
                  <div className="relative p-6 text-neutral space-y-2 w-full">
                    {big && (
                      <span className="inline-flex rounded-full bg-neutral/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold">
                        Featured Domain
                      </span>
                    )}
                    <h3 className={`font-serif font-bold leading-tight ${big ? 'text-3xl' : 'text-2xl'}`}>{topic.name}</h3>
                    <p className="text-sm text-neutral/75 line-clamp-2">{topic.description}</p>
                    {big && (
                      <span className="inline-flex items-center gap-1.5 mt-2 rounded-md bg-neutral px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
                        Explore Topic <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Scientific Spotlights ── */}
      <section className="container-custom py-20 md:py-28">
        <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Scientific Spotlights</h2>
          <p className="text-muted leading-relaxed">
            Pioneering papers curated by our editorial board for their transformative impact on
            sustainability science.
          </p>
        </Reveal>

        {loading ? (
          <p className="text-center text-muted">Loading research…</p>
        ) : spotlights.length === 0 ? (
          <p className="text-center text-muted">No papers published yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {spotlights.map((paper, index) => (
              <article
                key={paper.id}
                className={`glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>a]:order-2' : ''}`}
              >
                <Link to={`/paper/${paper.id}`} className="block min-h-64 lg:min-h-full bg-primary-dark">
                  <img
                    src={`https://picsum.photos/seed/${paper.id}/1000/700`}
                    alt={paper.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-8 lg:p-10 flex flex-col justify-center space-y-4">
                  <span className="label-caps">{paper.topic || 'Peer Reviewed'}</span>
                  <Link to={`/paper/${paper.id}`}>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold leading-snug hover:text-primary transition-colors">
                      {paper.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted leading-relaxed line-clamp-4">{paper.abstract}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {initials(paper.author_names)}
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-ink">{paper.author_names || 'Unknown author'}</p>
                      <p className="text-muted">{paper.created_at ? new Date(paper.created_at).getFullYear() : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to={`/paper/${paper.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral hover:bg-primary-dark transition-colors"
                    >
                      Read Full Paper
                    </Link>
                    <a
                      href={apiUrl(`/api/paper/${paper.id}/download`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary hover:bg-primary hover:text-neutral transition-colors"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/papers"
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-neutral transition-colors"
          >
            <ScrollText className="h-4 w-4" /> Browse full catalog
          </Link>
        </div>
      </section>

      {/* ── Published by us (original journal, distinct from the indexed library) ── */}
      {originals.length > 0 && (
        <section className="border-y border-line/70 bg-surface-container-low/50">
          <div className="container-custom py-20 md:py-24">
            <div className="mb-12 max-w-2xl space-y-3">
              <span className="label-caps text-primary">Original Journal</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Published by {name}</h2>
              <p className="leading-relaxed text-muted">
                Original, peer-reviewed research published directly by our editorial board —
                distinct from the open-access papers we index from other sources.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {originals.map((paper) => (
                <Link
                  key={paper.id}
                  to={`/paper/${paper.id}`}
                  className="glass-card group flex flex-col space-y-3 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-neutral">Original</span>
                  <h3 className="font-serif text-xl font-bold leading-snug text-ink transition-colors group-hover:text-primary line-clamp-3">{paper.title}</h3>
                  <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{paper.abstract}</p>
                  <p className="pt-1 text-xs text-muted">{paper.author_names || 'Unknown author'}{paper.created_at ? ` · ${new Date(paper.created_at).getFullYear()}` : ''}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA (contained band) ── */}
      <section className="container-custom pb-20 md:pb-24">
        <div className="rounded-2xl bg-primary-dark px-8 py-16 text-center text-neutral shadow-[0_16px_40px_rgba(4,47,46,0.18)]">
          <span className="inline-flex rounded-full border border-neutral/25 px-3 py-1 text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral/70">
            Call for Submissions
          </span>
          <h2 className="mt-5 font-serif text-4xl md:text-5xl font-bold leading-[1.05]">
            Publish your breakthrough.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral/70 leading-relaxed">
            Join the global community of researchers publishing with {name} — advancing
            high-impact climate science through open access and rigorous peer review.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-md bg-neutral px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark hover:bg-primary-fixed transition-colors"
            >
              Submit Research <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-md border border-neutral/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral hover:bg-neutral/10 transition-colors"
            >
              About the Journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
