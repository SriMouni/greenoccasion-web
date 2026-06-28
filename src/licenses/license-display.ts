import { normalizeLicense } from './license-normalizer.ts';

/**
 * Maps a Creative Commons license to its official deed URL, for on-page attribution.
 * Version 4.0 is the current default CC version and the one OpenAlex/Crossref report
 * most often; the raw provider codes don't carry a version, so we link the 4.0 deed.
 */
const LICENSE_DEED_URLS: Record<string, string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-ND': 'https://creativecommons.org/licenses/by-nd/4.0/',
  'CC BY-NC': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'CC BY-NC-SA': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'CC BY-NC-ND': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
};

export type LicenseDisplay = {
  /** Human-readable license name, e.g. "CC BY". */
  name: string;
  /** Official license deed URL, or null when none can be resolved. */
  url: string | null;
  /** Whether the license requires crediting the original author/source. */
  requiresAttribution: boolean;
};

/**
 * Resolve a displayable license from whatever we stored: the canonical name from the
 * `licenses` table (license_name) and/or the raw provider code on the paper (license_url,
 * which is actually a code like "cc-by", not a URL). Returns null when there is nothing
 * meaningful to show.
 */
export const describeLicense = (input: {
  licenseName?: string | null;
  licenseCode?: string | null;
}): LicenseDisplay | null => {
  const raw = (input.licenseName || input.licenseCode || '').trim();
  if (!raw) return null;

  const { canonicalName } = normalizeLicense({ licenseText: raw, licenseUrl: raw });

  if (canonicalName === 'Unknown') {
    return { name: raw, url: null, requiresAttribution: false };
  }

  if (canonicalName === 'All rights reserved') {
    return { name: canonicalName, url: null, requiresAttribution: false };
  }

  return {
    name: canonicalName,
    url: LICENSE_DEED_URLS[canonicalName] ?? null,
    requiresAttribution: canonicalName !== 'CC0',
  };
};
