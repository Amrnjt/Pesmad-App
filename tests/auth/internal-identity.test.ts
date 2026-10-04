import { describe, expect, it } from 'vitest';
import { internalAuthEmail, normalizePesmadUsername } from '../../src/lib/auth/internalIdentity';

describe('Pesmad internal identity mapping', () => {
  it.each([
    ['anas', 'anas', 'pesmad.1df38cbe202365fc6f2265391ef6aad4@auth.tahfidzpesmad.my.id'],
    ['ustadz01', 'ustadz01', 'pesmad.d81a4d3803f6ea754d98716b28716fef@auth.tahfidzpesmad.my.id'],
    ['  ADMIN  ', 'admin', 'pesmad.8c6976e5b5410415bde908bd4dee15df@auth.tahfidzpesmad.my.id'],
  ])('maps %s deterministically', (input, normalized, email) => {
    expect(normalizePesmadUsername(input)).toBe(normalized);
    expect(internalAuthEmail(input)).toBe(email);
  });

  it('rejects an empty username after normalization', () => {
    expect(() => normalizePesmadUsername('   ')).toThrow(/username/i);
  });
});
