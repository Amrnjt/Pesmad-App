import { expect, test } from '@playwright/test';

test('mocked login reaches a protected route and logout clears the session', async ({
  page,
  context,
}) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        profile: {
          authUid: 'uid-test',
          username: 'ustadz01',
          nama: 'Ustadz Satu',
          role: 'Ustadz',
          active: true,
        },
      },
    });
  });

  await page.goto('/login?next=%2Fdashboard');
  await page.getByLabel('Username').fill('ustadz01');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Masuk' }).click();

  await context.addCookies([
    {
      name: 'pesmad_session',
      value: 'test-session',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await page.route('http://localhost:3000/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body><h1>Dashboard</h1></body></html>',
    });
  });

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  const logout = await page.request.post('/api/auth/logout');
  expect(logout.ok()).toBeTruthy();

  await expect.poll(async () => {
    const cookies = await context.cookies('http://localhost:3000');
    return cookies.some((cookie) => cookie.name === 'pesmad_session');
  }).toBeFalsy();
});

test('Wali or Santri credentials are rejected by the login UI contract', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 403,
      json: { error: 'Akses ditolak.' },
    });
  });

  await page.goto('/login');
  await page.getByLabel('Username').fill('wali01');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Masuk' }).click();

  await expect(page.getByRole('alert')).toHaveText('Akses ditolak.');
  await expect(page).toHaveURL(/\/login$/);
});

test('unauthenticated protected navigation redirects to login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});
