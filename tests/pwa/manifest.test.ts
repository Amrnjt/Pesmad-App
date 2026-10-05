import { describe, expect, it } from 'vitest';
import manifest from '../../src/app/manifest';

describe('Pesmad App manifest', () => {
  it('is installable with standalone mode and required icons', () => {
    const value = manifest();

    expect(value.name).toBe('Pesmad App');
    expect(value.display).toBe('standalone');
    expect(value.start_url).toBe('/dashboard');
    expect(value.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/icons/icon-192.png', sizes: '192x192' }),
        expect.objectContaining({ src: '/icons/icon-512.png', sizes: '512x512' }),
      ]),
    );
  });
});
