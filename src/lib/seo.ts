import { useEffect } from 'react';

// Lightweight head manager for our Vite SPA (no react-helmet). Sets <title>, meta
// description, canonical, and Open Graph / Twitter tags per route. Google and the
// major AI crawlers (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) render JS,
// so runtime-injected tags are read — but we also ship static defaults in index.html
// for the first paint and non-rendering fetchers.

type SeoInput = {
  title?: string;
  description?: string;
  canonical?: string; // absolute URL; defaults to the current location
  image?: string;
  type?: string; // og:type — 'website' | 'article'
};

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export const useSeo = ({ title, description, canonical, image, type = 'website' }: SeoInput) => {
  useEffect(() => {
    const url = canonical || window.location.href;
    if (title) {
      document.title = title;
      upsertMeta('property', 'og:title', title);
      upsertMeta('name', 'twitter:title', title);
    }
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
    upsertLink('canonical', url);
  }, [title, description, canonical, image, type]);
};

// Inject (and clean up) a JSON-LD structured-data block. Structured data is what
// lets Google rich-results AND AI answer engines extract facts (title, authors,
// DOI, license, publisher) reliably. Pass `data = null` to emit nothing.
export const useJsonLd = (id: string, data: object | null) => {
  const serialized = data ? JSON.stringify(data) : '';
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    const existing = document.getElementById(scriptId);
    if (!serialized) {
      if (existing) existing.remove();
      return;
    }
    let el = existing as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = scriptId;
      document.head.appendChild(el);
    }
    el.textContent = serialized;
    return () => {
      const e = document.getElementById(scriptId);
      if (e) e.remove();
    };
  }, [id, serialized]);
};

// Trim text to a clean meta-description length (~155 chars, no mid-word cut).
export const metaDescription = (text: string, max = 155) => {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max)).trim() + '…';
};
