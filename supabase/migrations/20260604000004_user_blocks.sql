-- User-to-user block list.
--
-- When user A blocks user B, A no longer sees B's posts/comments anywhere on
-- the community surface. B's perspective is unchanged — blocks are unilateral
-- and silent (no notification to the blocked party).
--
-- Enforcement lives at the query layer (server-side filter), not RLS, because
-- the data itself remains public; we just hide it from one viewer.

create table if not exists user_blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references users(id) on delete cascade,
  blocked_id  uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint user_blocks_no_self check (blocker_id <> blocked_id),
  constraint user_blocks_unique  unique (blocker_id, blocked_id)
);

-- Lookup by blocker — used to fetch "who has this user blocked" on every
-- community page load. Heavily read, lightly written.
create index if not exists user_blocks_blocker_idx on user_blocks (blocker_id);

-- RLS: a user can only read/insert/delete their own block list.
alter table user_blocks enable row level security;

create policy "user_blocks_select_own"
  on user_blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "user_blocks_insert_own"
  on user_blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "user_blocks_delete_own"
  on user_blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);
