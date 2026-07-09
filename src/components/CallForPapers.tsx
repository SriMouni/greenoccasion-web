import { useEffect, useState, type FormEvent } from 'react';
import { X, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { apiUrl, JOURNAL_SLUG } from '../lib/api-base';
import { useJournal } from '../lib/journal';

// Fired by the "Call for Papers" nav button (and anywhere else) to open the modal.
export const openCallForPapers = () => window.dispatchEvent(new Event('open-cfp'));

const SEEN_KEY = 'cfp-seen';

export const CallForPapers = () => {
  const { name: journalName } = useJournal();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', affiliation: '', interest: '', message: '' });

  // Open on demand; also auto-open once on a visitor's first session (gentle, dismissible).
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-cfp', onOpen);
    let timer: number | undefined;
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        timer = window.setTimeout(() => setOpen(true), 7000);
      }
    } catch { /* localStorage unavailable */ }
    return () => {
      window.removeEventListener('open-cfp', onOpen);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (open) {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch(apiUrl('/api/author-leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, journalSlug: JOURNAL_SLUG }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
      setStatus('done');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const inputCls = 'w-full rounded-lg border border-line/70 bg-surface-bright px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface-bright shadow-[0_24px_70px_rgba(4,47,46,0.35)]">
        {/* Header band */}
        <div className="relative bg-primary-dark px-6 py-6 text-neutral">
          <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral/70 hover:bg-neutral/10 hover:text-neutral">
            <X className="h-5 w-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral/80">
            <Sparkles className="h-3 w-3" /> Call for Papers
          </span>
          <h2 className="mt-3 font-serif text-2xl font-bold leading-snug">Submit your research to {journalName}</h2>
          <p className="mt-1 text-sm text-neutral/70">
            Open access · peer-reviewed · climate & sustainability. Tell us about your work and our editorial team will be in touch.
          </p>
        </div>

        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-secondary" />
            <h3 className="font-serif text-xl font-bold text-ink">Thank you!</h3>
            <p className="max-w-xs text-sm text-muted">We've received your interest and will reach out shortly. You can also submit a full manuscript any time.</p>
            <button onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral hover:bg-primary-dark transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 px-6 py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input required placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
            </div>
            <input placeholder="Affiliation / institution" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} className={inputCls} />
            <input placeholder="Research area of interest" value={form.interest} onChange={(e) => set('interest', e.target.value)} className={inputCls} />
            <textarea placeholder="A short note about your work (optional)" value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} className={inputCls} />
            {status === 'error' && <p className="text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-neutral transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {status === 'submitting' ? 'Sending…' : 'Express interest'}
            </button>
            <p className="text-center text-[11px] text-muted/70">We'll only use your details to contact you about publishing.</p>
          </form>
        )}
      </div>
    </div>
  );
};
