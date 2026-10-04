import { expect, test } from '@playwright/test';

test('mocked login reaches a protected route and logout clears the session', async ({
  page,
  context,
}) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'set-cookie': 'pesmad_session=test-session; Path=/; HttpOnly; SameSite=Lax',
      },
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

  await expect(page).toHaveURL(/\\/dashboard$/);
  await expect.poll(async () => {
    const cookies = await context.cookies('http://localhost:3000');
    return cookies.some((cookie) => cookie.name === 'pesmad_session');
  }).toBeTruthy();

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'set-cookie': 'pesmad_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      },
      json: { success: true },
    });
  });
  const logoutOk = await page.evaluate(async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    return response.ok;
  });
  expect(logoutOk).toBeTruthy();

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

  await expect(page.locator('.form-error')).toHaveText('Akses ditolak.');
  await expect(page).toHaveURL(/\\/login$/);
});

test('unauthenticated protected navigation redirects to login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\\/login\\?next=%2Fdashboard$/);
});
