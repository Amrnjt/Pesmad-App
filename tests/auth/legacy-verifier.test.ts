import { describe, expect, it } from 'vitest';
import {
  resolveLegacyCredential,
  UnsupportedLegacyRoleError,
  type LegacyUserCandidate,
} from '../../src/lib/auth/legacyCredentialVerifier';

const candidates: LegacyUserCandidate[] = [
  { id: 'u1', username: 'Ustadz01', password: 'rahasia', role: 'Ustadz', nama: 'Ustadz Satu' },
  { id: 'u2', username: 'Wali01', password: 'wali-pass', role: 'Wali', nama: 'Wali Satu' },
];

describe('legacy credential resolver', () => {
  it('matches username case-insensitively and returns only internal profile fields', () => {
    expect(resolveLegacyCredential(candidates, { username: '  ustadz01 ', password: 'rahasia' })).toEqual({
      legacyUserId: 'u1',
      username: 'Ustadz01',
      nama: 'Ustadz Satu',
      role: 'Ustadz',
    });
  });

  it('returns null for the wrong password', () => {
    expect(resolveLegacyCredential(candidates, { username: 'Ustadz01', password: 'salah' })).toBeNull();
  });

  it('rejects valid Wali credentials as unsupported instead of migrating them', () => {
    expect(() => resolveLegacyCredential(candidates, { username: 'wali01', password: 'wali-pass' })).toThrow(
      UnsupportedLegacyRoleError,
    );
  });
});
