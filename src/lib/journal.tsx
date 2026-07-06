import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// This public site is bound to one journal via VITE_JOURNAL_SLUG. Its name, description
// and theme are fetched at runtime, so the same build powers any journal.
const SLUG = (import.meta.env.VITE_JOURNAL_SLUG || '').trim();
const DEFAULT_NAME = 'Green Occasion';

export type JournalMeta = {
  name: string;
  slug: string;
  description: string | null;
  theme: string;
};

const fallback: JournalMeta = { name: DEFAULT_NAME, slug: SLUG, description: null, theme: 'default' };

const JournalContext = createContext<JournalMeta>(fallback);
export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [meta, setMeta] = useState<JournalMeta>(fallback);

  useEffect(() => {
    if (!SLUG) return;
    fetch(`/api/journal-site?slug=${encodeURIComponent(SLUG)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.name) setMeta({ name: d.name, slug: d.slug || SLUG, description: d.description ?? null, theme: d.theme || 'default' });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = meta.name;
    document.documentElement.dataset.theme = meta.theme;
  }, [meta]);

  return <JournalContext.Provider value={meta}>{children}</JournalContext.Provider>;
};
