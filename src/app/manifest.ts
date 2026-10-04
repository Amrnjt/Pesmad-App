import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Portal',
    short_name: 'Portal',
    start_url: '/',
    display: 'browser',
    icons: [],
  };
}
