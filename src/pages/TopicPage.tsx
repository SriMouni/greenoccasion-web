import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Users } from 'lucide-react';

export const TopicPage = () => {
  const { topicId } = useParams();
  const topicName = topicId ? decodeURIComponent(topicId) : '';
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // The Topics directory links broad fields; fall back to an exact topic match
    // (e.g. older links) if the field query returns nothing.
    fetch(`/api/papers?field=${encodeURIComponent(topicName)}`)
      .then((res) => res.json())
      .then(async (data) => {
        let list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          const byTopic = await fetch(`/api/papers?topic=${encodeURIComponent(topicName)}`).then((r) => r.json()).catch(() => []);
          if (Array.isArray(byTopic)) list = byTopic;
        }
        setPapers(list);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [topicName]);

  return (
    <div className="py-12 md:py-16 container-custom min-h-screen">
      {/* Back link */}
      <Link
        to="/topics"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All Domains
      </Link>

      {/* Editorial header */}
      <header className="space-y-4 mb-10">
        <p className="label-caps">Thematic Domain</p>
        <h1 className="font-serif font-bold text-4xl md:text-5xl text-primary leading-tight">
          {topicName || 'Topic'}
        </h1>
        <p className="text-on-surface-variant text-base">
          {papers.length} {papers.length === 1 ? 'publication' : 'publications'} in
          this domain.
        </p>
      </header>

      <div className="editorial-divider" />

      {/* Papers */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant font-serif italic text-lg">
          Loading papers&hellip;
        </div>
      ) : papers.length === 0 ? (
        <div className="glass-card py-20 px-8 text-center">
          <h3 className="font-serif text-2xl text-primary mb-2">
            No papers in this domain yet
          </h3>
          <p className="text-on-surface-variant mb-6">
            Be the first to contribute research to {topicName}.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition-colors hover:bg-primary-dark"
          >
            Submit Research
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {papers.map((paper) => (
            <article
              key={paper.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_4px_20px_rgba(45,45,45,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_12px_30px_rgba(45,45,45,0.12)]"
            >
              <div className="aspect-[3/2] overflow-hidden bg-surface-container">
                <img
                  src={`https://picsum.photos/seed/${paper.id}/600/400`}
                  alt={paper.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 space-y-4">
                <p className="label-caps">{paper.topic || topicName}</p>
                <Link to={`/paper/${paper.id}`}>
                  <h3 className="font-serif text-xl leading-snug text-on-surface transition-colors group-hover:text-primary">
                    {paper.title}
                  </h3>
                </Link>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
                  {paper.abstract}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">
                      {paper.author_names || 'Unknown'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {paper.publication_year ||
                      (paper.created_at
                        ? new Date(paper.created_at).getFullYear()
                        : 'N/A')}
                  </span>
                </div>
                <div className="pt-4 mt-auto border-t border-outline-variant/60 flex items-center justify-between">
                  <Link
                    to={`/paper/${paper.id}`}
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary-dark"
                  >
                    Read Paper
                  </Link>
                  <a
                    href={`/api/paper/${paper.id}/download`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-secondary hover:text-primary"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
