-- "수정됨" indicator support for posts & comments.
--
-- posts.updated_at gets bumped by view_count/like_count triggers, so it can't
-- be used to detect content edits. Adding a dedicated last_edited_at that's
-- only touched by the update action.
--
-- Set to NULL by default → no badge. After first edit, set to now() → badge
-- shows along with the timestamp.

alter table posts
  add column if not exists last_edited_at timestamptz null;

alter table comments
  add column if not exists last_edited_at timestamptz null;

-- Lightweight index — used to query "recently edited" feeds if needed later.
create index if not exists posts_last_edited_at_idx on posts (last_edited_at)
  where last_edited_at is not null;
