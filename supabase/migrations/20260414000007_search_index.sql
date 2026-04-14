-- Migration: Search indexes
-- Enables pg_trgm for trigram-based ILIKE acceleration and
-- GIN full-text search on product name/description columns.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for fast ILIKE on localized product names
CREATE INDEX IF NOT EXISTS idx_products_name_ko_trgm
  ON products USING gin (name_ko gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_name_en_trgm
  ON products USING gin (name_en gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_name_ja_trgm
  ON products USING gin (name_ja gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_name_de_trgm
  ON products USING gin (name_de gin_trgm_ops);

-- Full-text search vectors (simple config works for all languages)
CREATE INDEX IF NOT EXISTS idx_products_fts_ko
  ON products USING gin (
    to_tsvector('simple', coalesce(name_ko, '') || ' ' || coalesce(description_ko, ''))
  );

CREATE INDEX IF NOT EXISTS idx_products_fts_en
  ON products USING gin (
    to_tsvector('english', coalesce(name_en, '') || ' ' || coalesce(description_en, ''))
  );

CREATE INDEX IF NOT EXISTS idx_products_fts_ja
  ON products USING gin (
    to_tsvector('simple', coalesce(name_ja, '') || ' ' || coalesce(description_ja, ''))
  );

CREATE INDEX IF NOT EXISTS idx_products_fts_de
  ON products USING gin (
    to_tsvector('german', coalesce(name_de, '') || ' ' || coalesce(description_de, ''))
  );
