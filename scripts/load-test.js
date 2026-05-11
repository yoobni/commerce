/**
 * k6 로드 테스트 스크립트
 *
 * 실행:
 *   k6 run scripts/load-test.js
 *   k6 run --vus 50 --duration 60s scripts/load-test.js
 *
 * 설치:  brew install k6  /  https://k6.io/docs/get-started/installation/
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate('errors');
const homePageDuration = new Trend('home_page_duration');
const productListDuration = new Trend('product_list_duration');
const productDetailDuration = new Trend('product_detail_duration');

// ─── Test Config ──────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp-up
    { duration: '1m',  target: 30 },  // steady state
    { duration: '30s', target: 50 },  // peak
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95%ile < 2s
    errors:            ['rate<0.05'],  // 에러율 < 5%
    http_req_failed:   ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ─── Virtual User Scenario ────────────────────────────────────────────────────
export default function () {
  // 1. 홈 페이지
  const homeRes = http.get(`${BASE_URL}/ko`);
  homePageDuration.add(homeRes.timings.duration);
  check(homeRes, {
    'home: status 200': (r) => r.status === 200,
    'home: < 2000ms':   (r) => r.timings.duration < 2000,
  });
  errorRate.add(homeRes.status >= 400);
  sleep(1);

  // 2. 상품 목록
  const listRes = http.get(`${BASE_URL}/ko/products`);
  productListDuration.add(listRes.timings.duration);
  check(listRes, {
    'product_list: status 2xx': (r) => r.status >= 200 && r.status < 300,
    'product_list: < 2000ms':   (r) => r.timings.duration < 2000,
  });
  errorRate.add(listRes.status >= 400);
  sleep(1);

  // 3. 상품 상세 (슬러그는 실제 DB 데이터에 맞게 수정)
  const slug = __ENV.TEST_PRODUCT_SLUG || 'sample-product';
  const detailRes = http.get(`${BASE_URL}/ko/products/${slug}`);
  productDetailDuration.add(detailRes.timings.duration);
  check(detailRes, {
    'product_detail: status 2xx or 404': (r) => r.status < 500,
    'product_detail: < 3000ms':          (r) => r.timings.duration < 3000,
  });
  errorRate.add(detailRes.status >= 500);
  sleep(1);

  // 4. 인증 보호 경로 리디렉션 확인 (미인증)
  const authRes = http.get(`${BASE_URL}/ko/account`, { redirects: 0 });
  check(authRes, {
    'protected route: redirects': (r) => r.status === 302 || r.status === 307,
  });
  sleep(0.5);
}

// ─── Admin Load Test (별도 실행: k6 run --env TARGET=admin scripts/load-test.js)
export function adminScenario() {
  const ADMIN_URL = __ENV.ADMIN_URL || 'http://localhost:3001';

  const loginPage = http.get(`${ADMIN_URL}/login`);
  check(loginPage, {
    'admin_login: status 200': (r) => r.status === 200,
    'admin_login: < 1000ms':   (r) => r.timings.duration < 1000,
  });
  errorRate.add(loginPage.status >= 400);
  sleep(1);
}
