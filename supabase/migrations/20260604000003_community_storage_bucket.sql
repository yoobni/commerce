-- Community storage bucket — user-uploaded images for community posts.
--
-- Path convention: community/{user_id}/{random}.{ext}
--   The post_id can't be in the path because uploads happen BEFORE the post
--   is created. Random filenames + user_id folder give us uniqueness +
--   ownership enforcement via RLS.
--
-- Limits: 5 MB per file, JPEG/PNG/WebP only. Same as reviews bucket.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community',
  'community',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- READ : public (anyone visiting a post can see images)
CREATE POLICY "community_storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community');

-- INSERT : authenticated only, first path segment must be own user_id
CREATE POLICY "community_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE : authenticated only, first path segment must be own user_id
CREATE POLICY "community_storage_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
