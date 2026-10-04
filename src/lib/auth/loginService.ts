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
  _input: { username: string; password: string },
  _deps: LoginDependencies,
): Promise<{ identity: PesmadUser; idToken: string }> {
  throw new PesmadLoginError(501, 'Not implemented');
}
