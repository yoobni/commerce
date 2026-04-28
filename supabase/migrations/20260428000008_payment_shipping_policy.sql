-- =============================================================================
-- Migration: Payment / Shipping Policy DB Boilerplate — 2026-04-28
-- Implements: docs/payment-shipping-policy.md §7 작업 #1~#4
--
-- #1  country_configs — fx_rate, supported_payment_methods 추가
-- #2  payments        — payment_ref, mode(mock/real) 추가
-- #3  shipments       — carrier_code, tracking_url_template 추가
-- #4  coupon_type     — FREE_SHIPPING 값 추가
-- =============================================================================

-- ---------------------------------------------------------------------------
-- #1. country_configs — 결제수단/환율 슬롯
--   fx_rate                    : 1 USD 기준 해당 통화 환율 (어드민 수동 입력)
--   supported_payment_methods  : 국가별 허용 결제수단 배열 (JSONB string[])
--                                예: ["CARD","KAKAO_PAY","TOSS_PAY"]
-- ---------------------------------------------------------------------------
ALTER TABLE country_configs
  ADD COLUMN IF NOT EXISTS fx_rate                   DECIMAL(12,6) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS supported_payment_methods JSONB         NOT NULL DEFAULT '[]';

COMMENT ON COLUMN country_configs.fx_rate                   IS '1 USD 기준 해당 통화 환율 — 어드민 수동 설정, 변경 시 AuditLog 필수';
COMMENT ON COLUMN country_configs.supported_payment_methods IS '국가별 허용 결제수단 배열 (PaymentMethod enum 값). 예: ["CARD","KAKAO_PAY"]';

-- ---------------------------------------------------------------------------
-- #2. payments — PG 참조번호 + mock/real 모드 슬롯
--   payment_ref : 외부 PG가 반환하는 결제 참조번호 (MOCK 어댑터는 내부 생성값)
--   mode        : mock | real — 운영 환경 분리 추적 + 어드민 UI 표시용
-- ---------------------------------------------------------------------------
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_ref TEXT NULL,
  ADD COLUMN IF NOT EXISTS mode        TEXT NOT NULL DEFAULT 'mock'
    CONSTRAINT payments_mode_check CHECK (mode IN ('mock', 'real'));

COMMENT ON COLUMN payments.payment_ref IS '외부 PG 결제 참조번호 — MOCK 어댑터: mock_{orderId}_{ts}, 실제 PG: PG 반환 ID';
COMMENT ON COLUMN payments.mode        IS '''mock'' | ''real'' — PAYMENT_MODE 환경변수 기반 주입, 운영에서 mock 차단';

CREATE INDEX idx_payments_mode ON payments (mode);

-- ---------------------------------------------------------------------------
-- #3. shipments — 배송사 코드(텍스트) + 추적 URL 템플릿 슬롯
--   carrier_code          : 외부 추적 API용 배송사 코드 (enum과 별도 관리)
--                           예: 'kr.cjlogistics', 'dhl'
--   tracking_url_template : 추적 링크 URL 패턴, {tracking_number} 치환자 포함
--                           예: 'https://trace.cjlogistics.com/web/concordEnview.jsp?wblNum={tracking_number}'
-- ---------------------------------------------------------------------------
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS carrier_code          TEXT NULL,
  ADD COLUMN IF NOT EXISTS tracking_url_template TEXT NULL;

COMMENT ON COLUMN shipments.carrier_code          IS '외부 배송 추적 API용 배송사 코드 (Aftership/EasyPost 호환). 예: ''kr.cjlogistics''';
COMMENT ON COLUMN shipments.tracking_url_template IS '배송 추적 URL 패턴 — {tracking_number} 치환. null이면 추적링크 미노출';

-- ---------------------------------------------------------------------------
-- #4. coupon_type — FREE_SHIPPING 값 추가
--   기존: FIXED_AMOUNT, PERCENTAGE
--   추가: FREE_SHIPPING (배송비 전액 할인)
-- ---------------------------------------------------------------------------
ALTER TYPE coupon_type ADD VALUE IF NOT EXISTS 'FREE_SHIPPING';
