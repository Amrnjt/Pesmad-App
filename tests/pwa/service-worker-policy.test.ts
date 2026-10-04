import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Pesmad App service worker policy', () => {
  it('never durably caches protected API responses', () => {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

    expect(source).toContain('/api/auth/');
    expect(source).toContain('/api/dashboard');
    expect(source).toContain('/api/admin/');
    expect(source).toContain('networkOnly');
  });

  it('uses cache-first for versioned static assets and network-first navigation', () => {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

    expect(source).toContain('cacheFirst');
    expect(source).toContain('networkFirstNavigation');
    expect(source).toContain('/offline.html');
  });
});
