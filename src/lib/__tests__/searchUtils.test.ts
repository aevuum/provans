// ARCHIVED TEST FILE
// Оригинальные тесты утилит поиска удалены вместе с логикой.
// Оставлено закомментированным, чтобы не подтягивать зависимость 'vitest'.
/*
import { describe, it, expect } from 'vitest';
import { findMatchPosition, generateSnippet } from '../searchUtils';

describe('searchUtils', () => {
  it('finds consecutive substring in simple text', () => {
    const text = 'Ваза декоративная красивая';
    const q = 'ваза';
    const pos = findMatchPosition(text, q);
    expect(pos).not.toBeNull();
    if (pos) {
      expect(text.slice(pos.start, pos.end).toLowerCase()).toBe(q);
    }
  });

  it('returns null when substring not consecutive', () => {
    const text = 'Подсвечник набор';
    const q = 'под свеч';
    const pos = findMatchPosition(text, q);
    expect(pos).toBeNull();
  });

  it('generateSnippet highlights match', () => {
    const text = 'Ваза декоративная';
    const q = 'дек';
    const pos = findMatchPosition(text, q);
    expect(pos).not.toBeNull();
    if (pos) {
      const snippet = generateSnippet(text, pos.start, pos.end, 5);
      expect(snippet.includes('<mark>')).toBe(true);
      expect(snippet.toLowerCase()).toContain(q);
    }
  });
});
*/
