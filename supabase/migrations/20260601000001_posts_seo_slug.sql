-- Community SEO — add short_id + slug to posts so individual posts get
-- crawlable, keyword-rich URLs (Reddit/SO style: /community/{shortid}/{slug?}).
--
-- short_id is the lookup key (8 hex chars, unique).
-- slug is decorative; mismatch is canonical-corrected at the route level.

alter table posts
  add column if not exists short_id text,
  add column if not exists slug text;

-- ─── Backfill helpers ────────────────────────────────────────────────────────

create or replace function posts_generate_slug(p_title text)
returns text
language plpgsql
immutable
as $$
declare
  v_slug text;
begin
  -- 1) keep latin alnum, hangul, whitespace, hyphen — strip everything else
  v_slug := regexp_replace(
    coalesce(p_title, ''),
    '[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s\-]',
    '',
    'g'
  );
  -- 2) collapse whitespace runs to single hyphen
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  -- 3) collapse consecutive hyphens
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  -- 4) trim leading/trailing hyphens
  v_slug := trim(both '-' from v_slug);
  -- 5) lowercase (no-op for hangul; latin chars get normalized)
  v_slug := lower(v_slug);
  -- 6) empty fallback (all-emoji / all-special titles)
  if v_slug is null or v_slug = '' then
    v_slug := 'post';
  end if;
  -- 7) cap length (Postgres b-tree key limit + URL hygiene)
  return substring(v_slug from 1 for 120);
end;
$$;

-- ─── Backfill existing rows ──────────────────────────────────────────────────

update posts
set
  short_id = substring(replace(id::text, '-', '') from 1 for 8),
  slug     = posts_generate_slug(title)
where short_id is null or slug is null;

-- ─── Constraints & indexes ───────────────────────────────────────────────────

alter table posts
  alter column short_id set not null,
  alter column slug set not null;

-- short_id is the primary lookup; must be globally unique
create unique index if not exists posts_short_id_unique on posts (short_id);

-- slug not unique (two posts can share a title) but indexed for occasional
-- reverse lookups & sitemap streaming
create index if not exists posts_slug_idx on posts (slug);

-- ─── Default generators for future inserts ───────────────────────────────────
-- Application layer also generates these, but DB defaults guarantee invariants
-- if some path bypasses the action.

alter table posts
  alter column short_id set default substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8);

-- slug has no DB default — it depends on title and must be generated at the
-- application layer where title is in scope. NOT NULL enforces presence.
