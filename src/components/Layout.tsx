import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Globe, History, Menu, Share2, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useJournal } from '../lib/journal';
import { useJsonLd } from '../lib/seo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Research Papers', path: '/papers' },
  { name: 'Topics', path: '/topics' },
  { name: 'Authors', path: '/authors' },
  { name: 'About', path: '/about' },
];

// Public reading site — no login, no admin. (Admins use the separate admin app.)
export const Navbar = () => {
  const location = useLocation();
  const { name } = useJournal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Transparent, light-text bar floating over the hero only at the top of Home.
  const overlay = isHome && !scrolled;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 z-50 w-full transition-colors duration-300',
          overlay
            ? 'bg-transparent border-b border-transparent'
            : 'bg-surface-bright/95 backdrop-blur-md border-b border-line/70 shadow-[0_2px_18px_rgba(15,23,42,0.07)]'
        )}
      >
        <div className="container-custom flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt={`${name} logo`} className="h-12 w-12 shrink-0 object-contain" />
            <span className={cn('block font-serif text-lg font-bold leading-tight', overlay ? 'text-neutral' : 'text-ink')}>{name}</span>
          </Link>

          {/* Right cluster: links + submit + mobile toggle */}
          <div className="flex items-center gap-6 lg:gap-8">
          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative text-[13px] font-medium transition-colors',
                  overlay
                    ? (isActive(item.path) ? 'text-neutral' : 'text-neutral/80 hover:text-neutral')
                    : (isActive(item.path) ? 'text-primary' : 'text-muted hover:text-primary')
                )}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className={cn('absolute -bottom-[21px] left-0 h-0.5 w-full', overlay ? 'bg-neutral' : 'bg-primary')} />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center">
            <Link
              to="/submit"
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
                overlay ? 'bg-neutral text-primary-dark hover:bg-neutral/90' : 'bg-primary text-neutral hover:bg-primary-dark'
              )}
            >
              Submit Research
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={cn('lg:hidden p-2', overlay ? 'text-neutral' : 'text-ink')}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-line/60 bg-surface-bright">
            <div className="container-custom flex flex-col py-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-container',
                    isActive(item.path) && 'text-primary bg-surface-container'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/submit"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-neutral"
              >
                Submit Research
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to offset the fixed nav on every page except Home (hero sits under it). */}
      {!isHome && <div className="h-16" />}
    </>
  );
};

export const PublicLayout = () => {
  const { name } = useJournal();
  // Site-wide structured data — identifies the publication to search + AI engines.
  useJsonLd('site', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    ...(typeof window !== 'undefined' ? { url: window.location.origin } : {}),
    publisher: { '@type': 'Organization', name },
  });
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const Footer = () => {
  const { name } = useJournal();
  return (
    <footer className="bg-[#1b1c1c] text-neutral">
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-start gap-3">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt={`${name} logo`} className="h-16 w-16 shrink-0 object-contain" />
              <span className="font-serif text-xl font-bold leading-tight tracking-tight">{name}</span>
            </div>
            <p className="text-sm text-neutral/50 leading-relaxed">
              An open-access library of peer-reviewed climate and sustainability research — browse,
              read, and download papers on the transition to a low-carbon future.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, History].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral/10 hover:bg-neutral hover:text-[#1b1c1c] transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral/50">Library</h4>
            <ul className="space-y-2.5 text-sm text-neutral/70">
              <li><Link to="/papers" className="hover:text-neutral transition-colors">Research Papers</Link></li>
              <li><Link to="/topics" className="hover:text-neutral transition-colors">Topics</Link></li>
              <li><Link to="/authors" className="hover:text-neutral transition-colors">Authors</Link></li>
              <li><Link to="/submit" className="hover:text-neutral transition-colors">Submit Research</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral/50">About</h4>
            <ul className="space-y-2.5 text-sm text-neutral/70">
              <li><Link to="/about" className="hover:text-neutral transition-colors">Ethos &amp; Ecology</Link></li>
              <li><Link to="/about" className="hover:text-neutral transition-colors">Peer Review</Link></li>
              <li><Link to="/about" className="hover:text-neutral transition-colors">Open Access Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral/50">Newsletter</h4>
            <p className="text-sm text-neutral/55">Research-to-inbox. Quarterly insights on the green innovation landscape.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-md bg-neutral/10 border border-neutral/15 px-3 py-2 text-sm text-neutral placeholder:text-neutral/40 outline-none focus:border-neutral/40"
              />
              <button className="rounded-md bg-neutral/15 px-4 text-sm font-semibold hover:bg-neutral/25 transition-colors">→</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-neutral/45 uppercase tracking-[0.14em]">
            © 2026 {name}. Published under CC BY 4.0.
          </p>
          <div className="flex gap-6 text-[11px] text-neutral/45 uppercase tracking-[0.14em]">
            <Link to="/about" className="hover:text-neutral transition-colors">Privacy</Link>
            <Link to="/about" className="hover:text-neutral transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-neutral transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
