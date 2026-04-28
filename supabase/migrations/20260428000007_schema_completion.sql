-- =============================================================================
-- Migration: Schema Completion — 2026-04-28
-- Author: Politis (backend lead)
--
-- 1. shipments — 외부 배송 추적 API 연동 컬럼 추가 (shipping-tracking-plan.md Phase 1)
-- 2. order_status_history — 주문 상태 전이 완전 이력 (운영/CS 감사 필수)
-- 3. admin_sessions — 어드민 분리 인증 세션 관리
-- 4. pg_trgm 확장 — 상품 한/영 텍스트 검색
-- 5. sizes 시드 데이터 — 대형견 전용 S~3XL
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. shipments — 외부 배송 추적 API 필드
--    external_tracker_id : Aftership / EasyPost Tracker ID
--    last_synced_at      : 마지막 외부 API 동기화 시각 (Polling 배치에서 사용)
--    tracking_events     : 배송사 원시 이벤트 이력 JSONB 배열
-- ---------------------------------------------------------------------------
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS external_tracker_id  TEXT        NULL,
  ADD COLUMN IF NOT EXISTS last_synced_at        TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS tracking_events       JSONB       NOT NULL DEFAULT '[]';

COMMENT ON COLUMN shipments.external_tracker_id IS 'Aftership/EasyPost Tracker ID — 운송장 등록 후 채워짐';
COMMENT ON COLUMN shipments.last_synced_at       IS '마지막 외부 API 동기화 시각 — Polling 배치가 이 값 기준으로 대상 선정';
COMMENT ON COLUMN shipments.tracking_events      IS '배송사 원시 이벤트 이력 (JSONB 배열) — Webhook/Polling 수신 시 append';

CREATE INDEX idx_shipments_sync_target
  ON shipments (last_synced_at)
  WHERE status IN ('PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_HELD', 'OUT_FOR_DELIVERY');

-- ---------------------------------------------------------------------------
-- 2. order_status_history — 주문 상태 전이 이력 테이블
--    주문 상태가 바뀔 때마다 한 행을 추가.
--    triggered_by 값: 'system' | 'user' | 'webhook' | 'admin' | 'batch'
--    admin_id는 어드민이 직접 변경한 경우만 채워짐.
-- ---------------------------------------------------------------------------
CREATE TABLE order_status_history (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   order_status  NULL,       -- NULL = 주문 최초 생성
  to_status     order_status  NOT NULL,
  triggered_by  TEXT          NOT NULL DEFAULT 'system',
  admin_id      UUID          NULL REFERENCES admins(id),
  note          TEXT          NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- indexes
CREATE INDEX idx_order_status_history_order_id   ON order_status_history (order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history (order_id, created_at DESC);
CREATE INDEX idx_order_status_history_admin_id
  ON order_status_history (admin_id)
  WHERE admin_id IS NOT NULL;

-- RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_history_select_own"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- trigger: 주문 생성 시 초기 상태 기록
CREATE OR REPLACE FUNCTION record_order_creation_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_history (order_id, from_status, to_status, triggered_by)
  VALUES (NEW.id, NULL, NEW.status, 'system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_record_initial_status
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION record_order_creation_status();

-- trigger: 주문 상태 변경 시 이력 기록
-- triggered_by 는 application 레이어에서 update 직전 session variable 로 주입하거나
-- 기본값 'system' 사용. 어드민 변경은 action 레이어에서 별도 INSERT 호출.
CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, triggered_by)
    VALUES (NEW.id, OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_track_status_history
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION record_order_status_change();

-- ---------------------------------------------------------------------------
-- 3. admin_sessions — 어드민 세션 관리
--    admins 테이블은 Supabase Auth와 분리되어 있으므로 JWT/세션을 직접 관리.
--    token_hash : 발급된 세션 토큰의 SHA-256 해시 (원본은 클라이언트에만 보관)
--    is_revoked : 로그아웃 또는 강제 만료 시 TRUE
-- ---------------------------------------------------------------------------
CREATE TABLE admin_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID        NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,
  ip_address    TEXT        NOT NULL,
  user_agent    TEXT        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_admin_id   ON admin_sessions (admin_id);
CREATE INDEX idx_admin_sessions_token_hash ON admin_sessions (token_hash);
CREATE INDEX idx_admin_sessions_active
  ON admin_sessions (admin_id, expires_at)
  WHERE is_revoked = FALSE;

-- RLS: service_role only (admin backend bypasses RLS automatically)
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
-- No client-side policies

-- ---------------------------------------------------------------------------
-- 4. pg_trgm — 상품 한/영/일/독 텍스트 검색
--    GIN(gin_trgm_ops) : LIKE '%keyword%' 쿼리를 인덱스로 처리
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_name_trgm
  ON products USING GIN (
    (name_ko || ' ' || name_en || ' ' || name_ja || ' ' || name_de) gin_trgm_ops
  );

CREATE INDEX idx_products_slug_trgm
  ON products USING GIN (slug gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 5. sizes 시드 데이터 — 대형견 전용 S~3XL
--    기준: 가슴둘레(chest), 등길이(back_length), 목둘레(neck), 체중(weight)
--    대형견 특화: 최소 13kg부터 — 소형견 사이즈 없음
-- ---------------------------------------------------------------------------
INSERT INTO sizes (
  label,
  chest_cm_min, chest_cm_max,
  back_length_cm_min, back_length_cm_max,
  neck_cm_min, neck_cm_max,
  weight_kg_min, weight_kg_max,
  breed_examples,
  sort_order
) VALUES
  (
    'S',
    50, 57, 32, 38, 34, 39, 13.0, 20.0,
    '["비글", "코커스패니얼", "웰시 코기"]',
    10
  ),
  (
    'M',
    57, 65, 38, 46, 39, 46, 20.0, 28.0,
    '["보더콜리", "시베리안 허스키", "아키타(소형)"]',
    20
  ),
  (
    'L',
    65, 73, 46, 54, 46, 52, 28.0, 35.0,
    '["골든리트리버(소형)", "래브라도 리트리버(소형)", "달마시안"]',
    30
  ),
  (
    'XL',
    73, 83, 54, 62, 52, 60, 35.0, 44.0,
    '["골든리트리버", "래브라도 리트리버", "저먼 셰퍼드"]',
    40
  ),
  (
    '2XL',
    83, 94, 62, 72, 60, 70, 44.0, 55.0,
    '["알래스칸 말라뮤트", "로트와일러", "아이리시 울프하운드"]',
    50
  ),
  (
    '3XL',
    94, 110, 72, 85, 70, 82, 55.0, 80.0,
    '["그레이트 피레니즈", "버니즈 마운틴 독", "세인트 버나드", "레오니버거"]',
    60
  )
ON CONFLICT (label) DO NOTHING;
