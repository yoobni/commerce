-- =============================================================================
-- Migration: RLS Policy Patch — 2026-05-07
--
-- 발견된 위반:
--   reviews_soft_delete_own 정책의 WITH CHECK에 status 제약이 없어
--   authenticated 사용자가 자신의 HIDDEN 리뷰를 ACTIVE로 에스컬레이션 가능.
--
-- 수정:
--   WITH CHECK에 status = 'DELETED' 추가 → 사용자는 자기 리뷰를 DELETED로만 변경 가능.
--   (HIDDEN/ACTIVE/BEST 등 다른 상태로의 변경은 service_role만 가능)
-- =============================================================================

DROP POLICY IF EXISTS "reviews_soft_delete_own" ON reviews;

CREATE POLICY "reviews_soft_delete_own"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'DELETED');
