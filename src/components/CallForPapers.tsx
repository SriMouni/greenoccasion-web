import { useState, type FormEvent } from 'react';
import { X, Send, CheckCircle2, PenLine } from 'lucide-react';
import { apiUrl, JOURNAL_SLUG } from '../lib/api-base';
import { useJournal } from '../lib/journal';

// A small, always-visible widget pinned to the bottom-right corner. Collapsed it's a
// pill; expanded it takes an email + phone and notifies the editorial inbox.
export const CallForPapers = () => {
  const { name: journalName } = useJournal();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', phone: '' });

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
    <div className="fixed bottom-5 right-5 z-[100] print:hidden">
      {open ? (
        <div className="w-[19rem] overflow-hidden rounded-2xl bg-surface-bright shadow-[0_18px_50px_rgba(4,47,46,0.28)] ring-1 ring-line/60">
          {/* Header */}
          <div className="relative bg-primary-dark px-5 py-4 text-neutral">
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-neutral/70 hover:bg-neutral/10 hover:text-neutral">
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral/70">Open for submissions</p>
            <h3 className="mt-1 font-serif text-lg font-bold leading-snug">Publish with {journalName}</h3>
          </div>

          {status === 'done' ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-secondary" />
              <p className="font-serif text-base font-bold text-ink">Thank you!</p>
              <p className="text-xs text-muted">Our editorial team will reach out to you shortly.</p>
              <button onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-neutral hover:bg-primary-dark transition-colors">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-2.5 px-5 py-4">
              <p className="text-xs leading-relaxed text-muted">Leave your contact and we'll get in touch about submitting your research.</p>
              <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
              <input required type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
              {status === 'error' && <p className="text-xs text-error">{error}</p>}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-neutral transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {status === 'submitting' ? 'Sending…' : 'Send'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-neutral shadow-[0_10px_30px_rgba(4,47,46,0.3)] transition-all hover:bg-primary-dark hover:shadow-[0_14px_36px_rgba(4,47,46,0.4)]"
        >
          <PenLine className="h-4 w-4" /> Publish with us
        </button>
      )}
    </div>
  );
};
