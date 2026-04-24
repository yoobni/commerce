-- =============================================================================
-- Migration: Schema Addendum — 2026-04-24
-- 갭 보완:
--   1. auth_provider ENUM에 naver, twitter 추가 (유저 요구사항: JP/US 소셜 로그인)
--   2. posts 스토리지 버킷 + RLS 정책
--   3. orders 테이블에 cancel_reason / return_reason 컬럼 추가 (CS 운영 필수)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. auth_provider ENUM 확장
--    기존: email, google, apple, kakao
--    추가: naver (JP 소셜), twitter (US 소셜)
-- ---------------------------------------------------------------------------
ALTER TYPE auth_provider ADD VALUE IF NOT EXISTS 'naver';
ALTER TYPE auth_provider ADD VALUE IF NOT EXISTS 'twitter';

-- ---------------------------------------------------------------------------
-- 2. orders — 취소·반품 사유 컬럼
--    cancel_reason : 고객/어드민이 입력하는 취소 사유 (CANCELLED 상태 전이 시 필수)
--    return_reason  : 반품 요청 사유 (RETURN_REQUESTED 전이 시 필수)
-- ---------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS return_reason  TEXT NULL;

COMMENT ON COLUMN orders.cancel_reason IS '주문 취소 사유 — status = CANCELLED 전이 시 기록';
COMMENT ON COLUMN orders.return_reason  IS '반품 요청 사유 — status = RETURN_REQUESTED 전이 시 기록';

-- ---------------------------------------------------------------------------
-- 3. posts 스토리지 버킷
--    community_posts 이미지 업로드용 버킷
--    Path: posts/{user_id}/{post_id}/{filename}
--    - 5 MB 제한, JPEG/PNG/WebP
--    - READ: public
--    - WRITE: authenticated, path[0] = auth.uid()
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- READ: public
CREATE POLICY "posts_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

-- INSERT: authenticated, 첫 번째 경로 세그먼트 = 본인 user_id
CREATE POLICY "posts_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: authenticated, 본인 경로만
CREATE POLICY "posts_storage_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
