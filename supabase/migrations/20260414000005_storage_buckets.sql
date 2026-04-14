-- =============================================================================
-- Migration: Supabase Storage Buckets & Policies
-- Created: 2026-04-14
--
-- Buckets:
--   products — 상품 이미지 (10MB, 공개, 어드민 전용 업로드)
--   reviews  — 리뷰 이미지  (5MB,  공개, 회원 업로드 — 자기 폴더만)
--   avatars  — 프로필 이미지 (2MB, 공개, 회원 업로드 — 자기 폴더만)
--
-- Path conventions:
--   products/{product_id}/{filename}
--   reviews/{user_id}/{review_id}/{filename}
--   avatars/{user_id}/{filename}
--
-- Write access strategy:
--   products → service_role only (admin app bypasses RLS automatically)
--   reviews  → authenticated, first path segment must equal auth.uid()
--   avatars  → authenticated, first path segment must equal auth.uid()
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'products',
    'products',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'reviews',
    'reviews',
    true,
    5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152,  -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- storage.objects RLS Policies
-- NOTE: storage.objects has RLS enabled by default in Supabase.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- products bucket
-- READ  : public (anon + authenticated)
-- WRITE : service_role only (no policy = no client access)
-- ---------------------------------------------------------------------------
CREATE POLICY "products_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- ---------------------------------------------------------------------------
-- reviews bucket
-- READ   : public (anon + authenticated)
-- INSERT : authenticated, path[0] must be own user_id
-- DELETE : authenticated, path[0] must be own user_id
-- (UPDATE not needed; re-upload with upsert=false → delete + insert)
-- ---------------------------------------------------------------------------
CREATE POLICY "reviews_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reviews');

CREATE POLICY "reviews_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reviews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "reviews_storage_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reviews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- avatars bucket
-- READ   : public (anon + authenticated)
-- INSERT : authenticated, path[0] must be own user_id
-- UPDATE : authenticated, path[0] must be own user_id (for upsert)
-- DELETE : authenticated, path[0] must be own user_id
-- ---------------------------------------------------------------------------
CREATE POLICY "avatars_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
