-- Migration: wishlists 테이블에 wishlist_added_at 컬럼 추가
-- 목적: 찜 추가 시각을 명시적으로 기록 (analytics 이벤트 타임스탬프 검증용)
-- created_at은 DB 레코드 생성 시각이므로 비즈니스 이벤트 시각과 분리

ALTER TABLE wishlists
  ADD COLUMN IF NOT EXISTS wishlist_added_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 기존 행은 created_at으로 백필
UPDATE wishlists
  SET wishlist_added_at = created_at
  WHERE TRUE;

COMMENT ON COLUMN wishlists.wishlist_added_at IS '사용자가 찜 버튼을 클릭한 시각 (UTC). analytics wishlist_toggled 이벤트 타임스탬프 검증용';
