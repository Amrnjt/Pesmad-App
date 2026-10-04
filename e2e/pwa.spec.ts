import { expect, test } from '@playwright/test';

test('serves an installable manifest and registers the service worker', async ({ page, request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();

  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Pesmad App');
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/dashboard');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PESMAD APP' })).toBeVisible();

  const registration = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return null;
    const ready = await navigator.serviceWorker.ready;
    return ready.active?.scriptURL ?? null;
  });

  expect(registration).toContain('/sw.js');
});

test('offline navigation shows the neutral offline shell without dashboard data', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });
  await page.reload();

  await context.setOffline(true);
  await page.goto('/offline-probe').catch(() => undefined);

  await expect(page.getByRole('heading', { name: 'Pesmad App' })).toBeVisible();
  await expect(page.getByText(/Anda sedang offline/i)).toBeVisible();
  await expect(page.getByText(/setoran|tugas|santri aktif/i)).toHaveCount(0);
});
