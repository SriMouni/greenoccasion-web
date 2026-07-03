import { useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { submitUrl } from '../lib/links';

/**
 * "Submit Research" hands off to the JMS author portal (register/sign in → submit →
 * track through peer review). The public site is read-only, so authenticated
 * submission lives in the JMS app; this page just forwards visitors there.
 */
export const SubmitPaperPage = () => {
  useEffect(() => {
    if (submitUrl) window.location.href = submitUrl;
  }, []);

  return (
    <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center text-center">
      {submitUrl ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-4 text-muted">Taking you to the submission portal…</p>
          <a href={submitUrl} className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            Continue <ArrowRight className="h-4 w-4" />
          </a>
        </>
      ) : (
        <div className="max-w-md space-y-3">
          <h1 className="font-serif text-3xl font-bold text-ink">Submit your research</h1>
          <p className="text-muted">
            Manuscript submission and tracking happen in the author portal. Please contact the
            editorial team for the submission link.
          </p>
        </div>
      )}
    </div>
  );
};
