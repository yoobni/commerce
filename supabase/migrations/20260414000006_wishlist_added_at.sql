-- ---------------------------------------------------------------------------
-- 006: Add wishlist_added_at to wishlists
-- ---------------------------------------------------------------------------
-- Separate from created_at so analytics can always reference "when added"
-- even if schema later switches to soft-delete (is_active flag).
-- ---------------------------------------------------------------------------

ALTER TABLE wishlists
  ADD COLUMN IF NOT EXISTS wishlist_added_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill existing rows from created_at
UPDATE wishlists SET wishlist_added_at = created_at;
