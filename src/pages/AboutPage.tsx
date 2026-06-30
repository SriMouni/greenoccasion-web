import { Leaf, Compass, Users, BookOpen, ShieldCheck, Globe2 } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Hero / Mission */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-secondary">
            <Leaf className="w-4 h-4" />
            <h4 className="label-caps">About The Platform</h4>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-on-surface">
            Green Occasion
          </h1>
          <p className="max-w-3xl text-lg md:text-xl text-on-surface-variant leading-relaxed">
            A scholarly discovery and management platform for environmental research. We help
            researchers, reviewers, and editors publish, curate, and find rigorous work on climate,
            ecology, and sustainable systems — openly and with lasting integrity.
          </p>
        </section>

        <div className="editorial-divider" />

        {/* Mission detail + principles */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article className="glass-card p-8 lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-3xl text-on-surface">Our Mission</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Our mission is to make high-quality environmental research openly accessible to
              scientists, policymakers, and practitioners. We aim to accelerate measurable, real-world
              impact by improving the speed, transparency, and discoverability of publication.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Every manuscript is treated as part of a long-term scholarly record. We prioritize
              reproducibility, transparent review signals, and durable archival quality for each
              published paper.
            </p>
          </article>

          <aside className="glass-card p-8 lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-2xl text-on-surface">Editorial Principles</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Scientific rigor and evidence-based conclusions',
                'Clear methodology and transparent data references',
                'Constructive peer feedback before publication',
                'Open-access dissemination for global reach',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-on-surface-variant leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <div className="editorial-divider" />

        {/* Peer review process */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-3xl text-on-surface">The Peer-Review Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Editorial Screening',
                body: 'Initial review for relevance, scope, and baseline quality before assignment.',
              },
              {
                step: '02',
                title: 'Reviewer Assignment',
                body: 'Matched to specialists by topic to ensure informed, domain-aware feedback.',
              },
              {
                step: '03',
                title: 'Decision Workflow',
                body: 'A transparent path to approve, request revisions, or decline with reasoning.',
              },
              {
                step: '04',
                title: 'Publication',
                body: 'Released with persistent metadata, DOI linkage, and citation tracking.',
              },
            ].map((s) => (
              <div key={s.step} className="glass-card p-6 space-y-3">
                <span className="label-caps text-on-secondary-container">{s.step}</span>
                <h3 className="font-serif text-xl text-on-surface">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="editorial-divider" />

        {/* Publication & open-access policy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="glass-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Globe2 className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-2xl text-on-surface">Open-Access Policy</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Authors retain attribution while granting publication rights under their selected
              open-access terms. Wherever possible, published work is made freely available so that
              findings can travel beyond institutional paywalls.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Submissions must be original and free of plagiarism. Any conflicts of interest should be
              disclosed at the time of submission.
            </p>
          </article>

          <article className="glass-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-2xl text-on-surface">Publication Standards</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Accepted papers are archived with persistent identifiers and structured metadata,
              keeping the scholarly record stable and citable over time.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              For policy and editorial inquiries, please reach the editorial desk through the
              submission channel.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
};
