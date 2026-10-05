import { createHash } from 'node:crypto';

export function normalizePesmadUsername(username: string): string {
  const normalized = username.trim().toLowerCase();
  if (!normalized) throw new Error('Username tidak boleh kosong.');
  return normalized;
}

export function internalAuthEmail(username: string): string {
  const normalized = normalizePesmadUsername(username);
  const hash32 = createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 32);
  return `pesmad.${hash32}@auth.tahfidzpesmad.my.id`;
}
