-- =============================================================================
-- Migration: Schema Completion — Notifications, Banners, Notices, FAQ, Tags
-- Created: 2026-04-28
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New ENUMs
-- ---------------------------------------------------------------------------

CREATE TYPE notification_type AS ENUM (
  'ORDER_PLACED',
  'ORDER_PAID',
  'ORDER_PREPARING',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'RETURN_APPROVED',
  'REFUND_COMPLETED',
  'COUPON_ISSUED',
  'POINT_EARNED',
  'PROMOTION',
  'NOTICE',
  'SYSTEM'
);

CREATE TYPE banner_position AS ENUM ('HERO', 'MIDDLE', 'SIDE', 'POPUP');

CREATE TYPE notice_type AS ENUM (
  'GENERAL', 'SHIPPING', 'POLICY', 'EVENT', 'SYSTEM'
);

CREATE TYPE faq_category AS ENUM (
  'ORDER', 'SHIPPING', 'RETURN', 'PRODUCT', 'ACCOUNT', 'PAYMENT', 'OTHER'
);

-- ---------------------------------------------------------------------------
-- notifications — user notification inbox
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             notification_type NOT NULL,
  title_ko         TEXT        NOT NULL,
  title_en         TEXT        NULL,
  title_ja         TEXT        NULL,
  title_de         TEXT        NULL,
  body_ko          TEXT        NOT NULL,
  body_en          TEXT        NULL,
  body_ja          TEXT        NULL,
  body_de          TEXT        NULL,
  reference_type   TEXT        NULL,
  reference_id     UUID        NULL,
  is_read          BOOLEAN     NOT NULL DEFAULT false,
  read_at          TIMESTAMPTZ NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- site_banners — homepage / promotional banners
-- ---------------------------------------------------------------------------
CREATE TABLE site_banners (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  position          banner_position NOT NULL DEFAULT 'HERO',
  title_ko          TEXT          NULL,
  title_en          TEXT          NULL,
  title_ja          TEXT          NULL,
  title_de          TEXT          NULL,
  subtitle_ko       TEXT          NULL,
  subtitle_en       TEXT          NULL,
  subtitle_ja       TEXT          NULL,
  subtitle_de       TEXT          NULL,
  image_url         TEXT          NOT NULL,
  mobile_image_url  TEXT          NULL,
  link_url          TEXT          NULL,
  cta_label_ko      TEXT          NULL,
  cta_label_en      TEXT          NULL,
  cta_label_ja      TEXT          NULL,
  cta_label_de      TEXT          NULL,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  starts_at         TIMESTAMPTZ   NULL,
  ends_at           TIMESTAMPTZ   NULL,
  sort_order        INT           NOT NULL DEFAULT 0,
  created_by        UUID          NULL REFERENCES admins(id),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- notices — store announcements (공지사항)
-- ---------------------------------------------------------------------------
CREATE TABLE notices (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  type        notice_type   NOT NULL DEFAULT 'GENERAL',
  title_ko    TEXT          NOT NULL,
  title_en    TEXT          NULL,
  title_ja    TEXT          NULL,
  title_de    TEXT          NULL,
  content_ko  TEXT          NOT NULL,
  content_en  TEXT          NULL,
  content_ja  TEXT          NULL,
  content_de  TEXT          NULL,
  is_pinned   BOOLEAN       NOT NULL DEFAULT false,
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  view_count  INT           NOT NULL DEFAULT 0,
  created_by  UUID          NULL REFERENCES admins(id),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- faq — customer support FAQ
-- ---------------------------------------------------------------------------
CREATE TABLE faq (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category     faq_category  NOT NULL DEFAULT 'OTHER',
  question_ko  TEXT          NOT NULL,
  question_en  TEXT          NULL,
  question_ja  TEXT          NULL,
  question_de  TEXT          NULL,
  answer_ko    TEXT          NOT NULL,
  answer_en    TEXT          NULL,
  answer_ja    TEXT          NULL,
  answer_de    TEXT          NULL,
  is_active    BOOLEAN       NOT NULL DEFAULT true,
  sort_order   INT           NOT NULL DEFAULT 0,
  created_by   UUID          NULL REFERENCES admins(id),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- tags / product_tags — product tag system for search & filtering
-- ---------------------------------------------------------------------------
CREATE TABLE tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ko    TEXT        NOT NULL,
  name_en    TEXT        NULL,
  name_ja    TEXT        NULL,
  name_de    TEXT        NULL,
  slug       TEXT        NOT NULL UNIQUE,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Triggers — updated_at
-- ---------------------------------------------------------------------------
CREATE TRIGGER set_updated_at_site_banners
  BEFORE UPDATE ON site_banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_notices
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_faq
  BEFORE UPDATE ON faq
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- notifications
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- site_banners
CREATE INDEX idx_site_banners_active_position
  ON site_banners(position, sort_order) WHERE is_active = true;

-- notices
CREATE INDEX idx_notices_active_pinned
  ON notices(is_pinned DESC, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_notices_type_active
  ON notices(type, created_at DESC) WHERE is_active = true;

-- faq
CREATE INDEX idx_faq_category_active
  ON faq(category, sort_order) WHERE is_active = true;

-- tags / product_tags
CREATE INDEX idx_tags_slug   ON tags(slug);
CREATE INDEX idx_product_tags_tag ON product_tags(tag_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_banners   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags   ENABLE ROW LEVEL SECURITY;

-- notifications: authenticated users see & update own only
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- site_banners: public read (active only)
CREATE POLICY "site_banners_read_active"
  ON site_banners FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at   IS NULL OR ends_at   >= now())
  );

-- notices: public read (active only)
CREATE POLICY "notices_read_active"
  ON notices FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- faq: public read (active only)
CREATE POLICY "faq_read_active"
  ON faq FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- tags: public read
CREATE POLICY "tags_read_all"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- product_tags: public read
CREATE POLICY "product_tags_read_all"
  ON product_tags FOR SELECT
  TO anon, authenticated
  USING (true);
