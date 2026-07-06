// When the public site is hosted on a CDN (separate origin from the backend),
// set VITE_API_BASE_URL to the backend URL. All `/api` and `/uploads` requests
// are then prefixed with it. Left empty for same-origin (dev / admin served by backend).
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Per-journal serving: this site only shows one journal's content. Set VITE_JOURNAL_SLUG
// (e.g. "green-occasion") and the scoped read endpoints below get `?journal=<slug>`.
const JOURNAL = (import.meta.env.VITE_JOURNAL_SLUG || '').trim();
const SCOPED_ENDPOINTS = ['/api/papers', '/api/topics', '/api/authors'];

/** Append `journal=<slug>` to the whitelisted read endpoints (dev + prod). */
const withJournal = (path: string): string => {
  if (!JOURNAL) return path;
  const base = path.split('?')[0].split('#')[0];
  if (!SCOPED_ENDPOINTS.includes(base)) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}journal=${encodeURIComponent(JOURNAL)}`;
};

if ((BASE || JOURNAL) && typeof window !== 'undefined') {
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && (input.startsWith('/api') || input.startsWith('/uploads'))) {
      const scoped = withJournal(input);
      // include credentials only cross-origin (cookie-based sessions for admin)
      return BASE ? original(BASE + scoped, { credentials: 'include', ...init }) : original(scoped, init);
    }
    return original(input as any, init);
  };
}

export const API_BASE = BASE;
export const JOURNAL_SLUG = JOURNAL;

/**
 * Prefix an /api or /uploads path with the backend origin. Use for URLs that the
 * fetch patch can't rewrite — e.g. <iframe src>, <a href> downloads, window.open.
 */
export const apiUrl = (path: string): string =>
  path && (path.startsWith('/api') || path.startsWith('/uploads')) ? BASE + path : path;
