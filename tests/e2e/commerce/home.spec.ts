import { test, expect } from '@playwright/test';

test.describe('Commerce — Home', () => {
  test('홈 페이지 로드 및 핵심 UI 노출', async ({ page }) => {
    await page.goto('/ko');
    await expect(page).toHaveURL(/\/ko/);

    // 응답 200
    const response = await page.request.get('/ko');
    expect(response.status()).toBe(200);
  });

  test('로케일 기본값 리디렉션 (/ → /ko)', async ({ page }) => {
    const response = await page.goto('/');
    // next-intl이 locale 접두사로 리디렉션
    expect(page.url()).toMatch(/\/ko/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('보안 헤더 포함', async ({ page }) => {
    const response = await page.goto('/ko');
    const headers = response?.headers() ?? {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBeDefined();
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});
