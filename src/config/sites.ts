export const SITES = ['coollaa', 'longshade', 'mypicmag'] as const;

export type Site = (typeof SITES)[number];

export function isValidSite(site: string): site is Site {
  return SITES.includes(site as Site);
}
