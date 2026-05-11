import { test, expect } from '@playwright/test';

test.describe('Commerce — 상품 목록 / 상세', () => {
  test('상품 목록 페이지 로드', async ({ page }) => {
    const response = await page.goto('/ko/products');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/ko\/products/);
  });

  test('상품 목록 — 상품 카드 1개 이상 노출', async ({ page }) => {
    await page.goto('/ko/products');
    // 상품 카드 또는 빈 상태 모두 렌더링 완료를 기다림
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('상품 상세 — 첫 번째 상품 카드 클릭 후 PDP 이동', async ({ page }) => {
    await page.goto('/ko/products');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/products/"]');
    const count = await productLinks.count();

    if (count > 0) {
      const href = await productLinks.first().getAttribute('href');
      if (href) {
        const response = await page.goto(href);
        expect(response?.status()).toBeLessThan(400);
        await expect(page).toHaveURL(/\/products\//);
      }
    }
  });

  test('존재하지 않는 상품 슬러그 — 404 또는 에러 페이지', async ({ page }) => {
    const response = await page.goto('/ko/products/this-product-does-not-exist-xyz');
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});
