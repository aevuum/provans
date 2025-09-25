// Common text normalization utility for search/filter logic.
// NFKC + lowercase; keeps spaces to ensure only consecutive substring matches.
export const normalizeText = (s: string) => (s || '').toString().normalize('NFKC').toLowerCase();
