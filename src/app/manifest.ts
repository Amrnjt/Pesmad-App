import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pesmad App',
    short_name: 'Pesmad',
    description: 'Pusat sistem informasi internal Pesmad.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f7f8',
    theme_color: '#142018',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
