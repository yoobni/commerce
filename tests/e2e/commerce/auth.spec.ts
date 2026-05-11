import { test, expect } from '@playwright/test';

test.describe('Commerce — 인증', () => {
  test('로그인 페이지 로드', async ({ page }) => {
    const response = await page.goto('/ko/auth/login');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('보호된 경로 미인증 접근 — 로그인 리디렉션', async ({ page }) => {
    await page.goto('/ko/account');
    // 미인증 상태에서 account 접근 시 login으로 리디렉션
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('보호된 경로 — 주문 미인증 접근', async ({ page }) => {
    await page.goto('/ko/orders');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('보호된 경로 — 위시리스트 미인증 접근', async ({ page }) => {
    await page.goto('/ko/wishlist');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('로그인 — 잘못된 자격증명 에러 메시지', async ({ page }) => {
    await page.goto('/ko/auth/login');
    await page.locator('input[type="email"]').fill('notexist@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    // 에러 메시지가 노출되거나 로그인 페이지에 머물러야 함
    expect(bodyText).toBeTruthy();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('회원가입 페이지 로드', async ({ page }) => {
    const response = await page.goto('/ko/auth/sign-up');
    expect(response?.status()).toBeLessThan(400);
  });
});
