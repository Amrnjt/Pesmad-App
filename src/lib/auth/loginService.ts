import { internalAuthEmail } from './internalIdentity';
import type { LegacyInternalUser, PesmadUser } from '../identity/types';

export interface LoginDependencies {
  getIdentityByUsername(username: string): Promise<PesmadUser | null>;
  verifyLegacyCredential(input: { username: string; password: string }): Promise<LegacyInternalUser | null>;
  createFirebaseUser(input: { email: string; password: string; displayName: string }): Promise<{ uid: string }>;
  deleteFirebaseUser(uid: string): Promise<void>;
  createMigratedIdentity(input: LegacyInternalUser & { authUid: string }): Promise<PesmadUser>;
  signInFirebasePassword(input: { email: string; password: string }): Promise<{ idToken: string; localId: string }>;
}

export class PesmadLoginError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'PesmadLoginError';
  }
}

export class UnsupportedLegacyRoleError extends Error {
  constructor() {
    super('Legacy role is not eligible for Pesmad App');
    this.name = 'UnsupportedLegacyRoleError';
  }
}

export async function authenticatePesmadCredentials(
  input: { username: string; password: string },
  deps: LoginDependencies,
): Promise<{ identity: PesmadUser; idToken: string }> {
  const username = input.username.trim();
  const password = input.password;

  if (!username || !password) {
    throw new PesmadLoginError(401, 'Username atau password tidak valid.');
  }

  const existingIdentity = await deps.getIdentityByUsername(username);
  if (existingIdentity) {
    if (!existingIdentity.active) {
      throw new PesmadLoginError(403, 'Akun Pesmad tidak aktif.');
    }

    const signIn = await deps.signInFirebasePassword({
      email: internalAuthEmail(username),
      password,
    });

    return { identity: existingIdentity, idToken: signIn.idToken };
  }

  let legacyUser: LegacyInternalUser | null;
  try {
    legacyUser = await deps.verifyLegacyCredential({ username, password });
  } catch (error) {
    if (error instanceof UnsupportedLegacyRoleError) {
      throw new PesmadLoginError(403, 'Role ini belum dapat menggunakan Pesmad App.');
    }
    throw error;
  }

  if (!legacyUser) {
    throw new PesmadLoginError(401, 'Username atau password salah.');
  }

  const email = internalAuthEmail(legacyUser.username);
  const firebaseUser = await deps.createFirebaseUser({
    email,
    password,
    displayName: legacyUser.nama,
  });

  let identity: PesmadUser;
  try {
    identity = await deps.createMigratedIdentity({ ...legacyUser, authUid: firebaseUser.uid });
  } catch (error) {
    await deps.deleteFirebaseUser(firebaseUser.uid);
    throw error;
  }

  const signIn = await deps.signInFirebasePassword({ email, password });
  return { identity, idToken: signIn.idToken };
}
