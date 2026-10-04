import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { handleMeRequest } from '../../src/app/api/auth/me/route';
import { handleLogoutRequest } from '../../src/app/api/auth/logout/route';
import { proxy } from '../../src/proxy';
import type { PesmadUser } from '../../src/lib/identity/types';

const activeUser: PesmadUser = {
  authUid: 'uid-1',
  legacyUserId: 'legacy-1',
  username: 'ustadz01',
  usernameNormalized: 'ustadz01',
  nama: 'Ustadz Satu',
  role: 'Ustadz',
  active: true,
  modules: {
    tahfidz: 'user',
    kinerja: 'user',
    keuangan: 'none',
    diniyah: 'none',
    santri: 'none',
    laporan: 'none',
  },
  createdAt: '2026-10-04T00:00:00.000Z',
  updatedAt: '2026-10-04T00:00:00.000Z',
};

describe('Pesmad auth HTTP routes', () => {
  it('returns the current profile with no-store for a valid session', async () => {
    const readSession = vi.fn().mockResolvedValue(activeUser);

    const response = await handleMeRequest('signed-cookie', readSession);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ profile: activeUser });
    expect(readSession).toHaveBeenCalledWith('signed-cookie');
  });

  it('returns 401 and no-store when the session is missing or invalid', async () => {
    const readSession = vi.fn().mockResolvedValue(null);

    const response = await handleMeRequest(undefined, readSession);

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ error: 'Tidak terautentikasi.' });
  });

  it('clears the production session cookie without making logout cacheable', () => {
    const response = handleLogoutRequest('production');

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('__Host-pesmad_session=');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=lax');
    expect(setCookie).toContain('Path=/');
  });

  it('clears the development session cookie using the development cookie name', () => {
    const response = handleLogoutRequest('development');

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('pesmad_session=');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).not.toContain('__Host-pesmad_session=');
    expect(setCookie).not.toContain('Secure');
  });
});

describe('Pesmad protected navigation proxy', () => {
  it('redirects unauthenticated dashboard navigation to login', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?next=%2Fdashboard',
    );
  });

  it('redirects unauthenticated admin navigation to login', async () => {
    const request = new NextRequest('http://localhost:3000/admin/access');

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?next=%2Fadmin%2Faccess',
    );
  });

  it('allows protected navigation when the session cookie exists', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: { cookie: 'pesmad_session=signed-cookie' },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
  });
});
