import { test, expect } from '@playwright/test';

test.describe('Admin — 인증', () => {
  test('로그인 페이지 로드', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('보안 헤더 — X-Frame-Options: DENY', async ({ page }) => {
    const response = await page.goto('/login');
    const headers = response?.headers() ?? {};
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('미인증 대시보드 접근 — 로그인 리디렉션', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('미인증 상품 페이지 접근 — 로그인 리디렉션', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/login/);
  });

  test('로그인 — 잘못된 자격증명', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('invalid@admin.com');
    await page.locator('input[type="password"]').fill('wrongpass');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/login/);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('관리자 로그인 성공 — 대시보드 이동', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@ravidog.com');
    await page.locator('input[type="password"]').fill('ravi1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // 로그인 성공 시 /login이 아닌 대시보드로 이동
    await expect(page).not.toHaveURL(/\/login/);
  });
});
