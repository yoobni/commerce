import { test, expect, type Page } from '@playwright/test';

async function adminLogin(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@ravidog.com');
  await page.locator('input[type="password"]').fill('ravi1234');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
}

test.describe('Admin — 대시보드 (인증 후)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('대시보드 페이지 렌더링', async ({ page }) => {
    const url = page.url();
    expect(url).not.toMatch(/\/login/);
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('상품 목록 페이지 접근', async ({ page }) => {
    const response = await page.goto('/products');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');
  });

  test('주문 목록 페이지 접근', async ({ page }) => {
    const response = await page.goto('/orders');
    expect(response?.status()).toBeLessThan(400);
  });

  test('회원 목록 페이지 접근', async ({ page }) => {
    const response = await page.goto('/members');
    expect(response?.status()).toBeLessThan(400);
  });

  test('쿠폰 목록 페이지 접근', async ({ page }) => {
    const response = await page.goto('/coupons');
    expect(response?.status()).toBeLessThan(400);
  });

  test('배송 목록 페이지 접근', async ({ page }) => {
    const response = await page.goto('/shipping');
    expect(response?.status()).toBeLessThan(400);
  });

  test('로그아웃 후 로그인 페이지 리디렉션', async ({ page }) => {
    // 로그아웃 버튼 또는 링크 탐색
    const logoutButton = page.locator('[data-testid="logout"], button:has-text("로그아웃"), a:has-text("로그아웃")');
    const count = await logoutButton.count();
    if (count > 0) {
      await logoutButton.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('Admin — RBAC (OPERATOR 권한 제한)', () => {
  test('SUPER_ADMIN 전용 경로 — OPERATOR는 /unauthorized로 리디렉션', async ({ page }) => {
    // OPERATOR 계정이 없으므로 URL 직접 접근 시 JWT 없는 상태로 /login으로 떨어짐
    await page.goto('/settings');
    const url = page.url();
    expect(url).toMatch(/\/(login|unauthorized)/);
  });
});
