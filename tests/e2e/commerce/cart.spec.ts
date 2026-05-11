import { test, expect } from '@playwright/test';

test.describe('Commerce — 장바구니', () => {
  test('장바구니 페이지 로드', async ({ page }) => {
    const response = await page.goto('/ko/cart');
    expect(response?.status()).toBeLessThan(400);
  });

  test('비로그인 장바구니 — 페이지 렌더링', async ({ page }) => {
    await page.goto('/ko/cart');
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('체크아웃 미인증 접근 — 로그인 리디렉션', async ({ page }) => {
    await page.goto('/ko/checkout');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
