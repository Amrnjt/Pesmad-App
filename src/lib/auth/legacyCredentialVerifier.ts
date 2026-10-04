import { normalizePesmadUsername } from './internalIdentity';
import { getPesmadFirestore } from '../firebase/admin';
import type { LegacyInternalUser, PesmadRole } from '../identity/types';

const LEGACY_ROLES = ['Superadmin', 'Ustadz', 'Pimpinan', 'Wali', 'Santri'] as const;
const INTERNAL_ROLES = new Set<PesmadRole>(['Superadmin', 'Pimpinan', 'Ustadz']);

export interface LegacyUserCandidate {
  id: string;
  username: string;
  password?: string;
  role: string;
  nama: string;
}

export class UnsupportedLegacyRoleError extends Error {
  constructor() {
    super('Legacy role is not eligible for Pesmad App');
    this.name = 'UnsupportedLegacyRoleError';
  }
}

function isInternalRole(role: string): role is PesmadRole {
  return INTERNAL_ROLES.has(role as PesmadRole);
}

export function resolveLegacyCredential(
  candidates: LegacyUserCandidate[],
  input: { username: string; password: string },
): LegacyInternalUser | null {
  let normalized: string;
  try {
    normalized = normalizePesmadUsername(input.username);
  } catch {
    return null;
  }

  const candidate = candidates.find((user) => {
    try {
      return normalizePesmadUsername(user.username) === normalized;
    } catch {
      return false;
    }
  });

  if (!candidate || candidate.password !== input.password) return null;
  if (!isInternalRole(candidate.role)) throw new UnsupportedLegacyRoleError();

  return {
    legacyUserId: candidate.id,
    username: candidate.username,
    nama: candidate.nama,
    role: candidate.role,
  };
}

export async function verifyLegacyCredential(input: {
  username: string;
  password: string;
}): Promise<LegacyInternalUser | null> {
  const snapshot = await getPesmadFirestore()
    .collection('users')
    .where('role', 'in', [...LEGACY_ROLES])
    .get();

  const candidates: LegacyUserCandidate[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: typeof data.id === 'string' ? data.id : doc.id,
      username: typeof data.username === 'string' ? data.username : '',
      password: typeof data.password === 'string' ? data.password : undefined,
      role: typeof data.role === 'string' ? data.role : '',
      nama: typeof data.nama === 'string' ? data.nama : '',
    };
  });

  return resolveLegacyCredential(candidates, input);
}
