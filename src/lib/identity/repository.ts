import { normalizePesmadUsername } from '../auth/internalIdentity';
import { getPesmadFirestore } from '../firebase/admin';
import {
  defaultModuleAccessForRole,
  type LegacyInternalUser,
  type PesmadUser,
} from './types';

export function buildMigratedIdentity(
  input: LegacyInternalUser & { authUid: string },
  nowIso = new Date().toISOString(),
): PesmadUser {
  return {
    authUid: input.authUid,
    legacyUserId: input.legacyUserId,
    username: input.username,
    usernameNormalized: normalizePesmadUsername(input.username),
    nama: input.nama,
    role: input.role,
    active: true,
    modules: defaultModuleAccessForRole(input.role),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function getIdentityByUsername(username: string): Promise<PesmadUser | null> {
  const usernameNormalized = normalizePesmadUsername(username);
  const snapshot = await getPesmadFirestore()
    .collection('pesmadUsers')
    .where('usernameNormalized', '==', usernameNormalized)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as PesmadUser;
}

export async function getIdentityByAuthUid(authUid: string): Promise<PesmadUser | null> {
  const snapshot = await getPesmadFirestore().collection('pesmadUsers').doc(authUid).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as PesmadUser;
}

export async function createMigratedIdentity(
  input: LegacyInternalUser & { authUid: string },
): Promise<PesmadUser> {
  const record = buildMigratedIdentity(input);
  await getPesmadFirestore().collection('pesmadUsers').doc(input.authUid).create(record);
  return record;
}
