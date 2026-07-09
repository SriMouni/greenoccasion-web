import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Eye, Globe2, Lock, MessagesSquare,
  Quote, ScrollText, ShieldCheck, Sparkles, Target,
} from 'lucide-react';
import { useJournal } from '../lib/journal';

const PRINCIPLES = [
  { icon: ShieldCheck, title: 'Scientific Rigor', body: 'Evidence-based conclusions backed by robust methodology and exhaustive peer verification.' },
  { icon: Eye, title: 'Transparency', body: 'Open access to data, code, and methods so every result can be independently reproduced.' },
  { icon: MessagesSquare, title: 'Constructive Review', body: 'A mentorship-driven feedback loop that strengthens manuscripts while upholding strict standards.' },
];

const STAGES = [
  { n: '01', title: 'Editorial Screening', body: 'Initial review for relevance and scope before reviewers are assigned.' },
  { n: '02', title: 'Expert Assignment', body: 'Matched to specialists for informed, domain-aware peer review.' },
  { n: '03', title: 'Decision Workflow', body: 'A transparent path to revisions or a final decision on merit.' },
  { n: '04', title: 'Publication', body: 'Released open-access with persistent metadata and DOI linkage.' },
];

export const AboutPage = () => {
  const { name } = useJournal();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80"
          alt="Forested mountains"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(150deg, rgba(4,47,46,0.82) 0%, rgba(15,33,22,0.55) 50%, rgba(4,47,46,0.85) 100%)' }} />
        <div className="relative container-custom py-20 md:py-28 text-neutral">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.24em] text-primary-fixed/90 mb-4">Our Founding Purpose</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.04] max-w-3xl">
            Advancing rigorous science for a <em className="italic">low-carbon future.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-neutral/80 text-base md:text-lg leading-relaxed">
            {name} is an open-access, peer-reviewed journal for research on climate change,
            decarbonization, and the transition to a sustainable world — published openly and with
            lasting integrity.
          </p>
          <Link to="/papers" className="mt-8 inline-flex items-center gap-2 rounded-md bg-neutral px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark transition-colors hover:bg-primary-fixed">
            Explore the Archive <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Mission + pull quote */}
      <section className="container-custom py-16 md:py-20 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-3xl text-ink">Our Mission</h2>
          </div>
          <p className="text-muted leading-relaxed">
            We believe high-quality climate research should be a global public good. Our mission is to
            accelerate measurable, real-world impact by improving the speed, transparency, and
            discoverability of publication.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            Every manuscript is treated as part of a long-term scholarly record — with reproducibility,
            transparent review signals, and durable archival quality for each published paper.
          </p>
        </div>
        <figure className="rounded-2xl border border-line/70 bg-surface-bright p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <Quote className="h-7 w-7 text-primary/30" />
          <blockquote className="mt-3 font-serif text-xl italic leading-snug text-ink">
            Research is not just about data; it is about the legacy we leave for a planet in transition.
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><ScrollText className="h-4 w-4" /></span>
            <span className="font-mono-label text-[11px] uppercase tracking-widest text-muted">Editorial Director · {name}</span>
          </figcaption>
        </figure>
      </section>

      {/* Editorial principles */}
      <section className="bg-surface-bright border-y border-line/60">
        <div className="container-custom py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label-caps mb-3">Core Values</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Editorial Principles</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-line/70 bg-surface p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-primary"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Peer-review process */}
      <section className="container-custom py-16 md:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-ink">The Peer-Review Process</h2>
          <p className="mt-3 text-muted leading-relaxed">A meticulous journey from manuscript to global impact — designed for transparency and academic rigor.</p>
        </div>
        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="hidden md:block absolute left-0 right-0 top-5 h-px bg-line/70" />
          {STAGES.map((s) => (
            <div key={s.n} className="relative">
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-mono-label text-xs font-bold text-neutral shadow-sm">{s.n}</span>
              <h3 className="mt-4 font-serif text-lg text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open-access commitment */}
      <section className="container-custom pb-20">
        <div className="grid overflow-hidden rounded-2xl bg-primary-dark text-neutral md:grid-cols-[1.5fr_1fr]">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary-fixed" />
              <h2 className="font-serif text-2xl md:text-3xl">Open-Access Commitment</h2>
            </div>
            <p className="mt-4 max-w-xl text-neutral/75 leading-relaxed">
              As stewards of climate knowledge, we believe research must be accessible to everyone. All
              papers are published under CC-BY 4.0, so scientists, policymakers, and the public can read,
              share, and build on findings without barriers.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-2 text-neutral/85"><BadgeCheck className="h-4 w-4 text-primary-fixed" /> DOI &amp; metadata verified</span>
              <span className="inline-flex items-center gap-2 text-neutral/85"><Globe2 className="h-4 w-4 text-primary-fixed" /> CC-BY 4.0 open access</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 border-t border-white/10 bg-white/[0.04] p-8 md:border-l md:border-t-0 md:p-12">
            <p className="font-serif text-xl italic">Become part of the movement.</p>
            <p className="text-sm text-neutral/65">We're inviting submissions and applications for our reviewer database.</p>
            <div className="flex flex-col gap-3">
              <Link to="/submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark transition-colors hover:bg-primary-fixed">
                <Sparkles className="h-4 w-4" /> Submit Research
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
