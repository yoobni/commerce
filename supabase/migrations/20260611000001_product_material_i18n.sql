-- Split products.material (single string) into per-locale columns to match the
-- name_*/description_* pattern. Backfills the Korean column from the existing
-- value, then drops the original.
--
-- Safe to run on dev DB with existing data; downstream code reads via the
-- get_product_material(product, locale) helper which falls back to material_ko
-- when a locale-specific value is empty.

BEGIN;

ALTER TABLE products
  ADD COLUMN material_ko text,
  ADD COLUMN material_en text,
  ADD COLUMN material_ja text,
  ADD COLUMN material_de text;

UPDATE products
  SET material_ko = material
  WHERE material IS NOT NULL;

ALTER TABLE products DROP COLUMN material;

COMMIT;
