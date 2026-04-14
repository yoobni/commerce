-- =============================================================================
-- Migration: Core Tables DDL
-- Created: 2026-04-14
-- Dependency order: independent → dependent
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. country_configs
-- ---------------------------------------------------------------------------
CREATE TABLE country_configs (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code                 country_code    NOT NULL UNIQUE,
  default_locale               user_locale     NOT NULL,
  default_currency             currency_code   NOT NULL,
  shipping_available           BOOLEAN         NOT NULL DEFAULT TRUE,
  free_shipping_threshold      DECIMAL(12, 2)  NULL,
  base_shipping_fee            DECIMAL(12, 2)  NOT NULL DEFAULT 0,
  estimated_delivery_days_min  INT             NOT NULL DEFAULT 3,
  estimated_delivery_days_max  INT             NOT NULL DEFAULT 7,
  tax_rate                     DECIMAL(5, 4)   NOT NULL DEFAULT 0,
  tax_included                 BOOLEAN         NOT NULL DEFAULT FALSE,
  return_period_days           INT             NOT NULL DEFAULT 7,
  is_active                    BOOLEAN         NOT NULL DEFAULT TRUE,
  updated_at                   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. admins (separate from Supabase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE admins (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT          NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  name          TEXT          NOT NULL,
  role          admin_role    NOT NULL DEFAULT 'VIEWER',
  status        admin_status  NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMPTZ   NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. users (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id                  UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT          NOT NULL UNIQUE,
  name                TEXT          NOT NULL,
  phone               TEXT          NULL,
  locale              user_locale   NOT NULL DEFAULT 'ko',
  country             country_code  NOT NULL DEFAULT 'KR',
  currency            currency_code NOT NULL DEFAULT 'KRW',
  profile_image_url   TEXT          NULL,
  marketing_agreed    BOOLEAN       NOT NULL DEFAULT FALSE,
  status              user_status   NOT NULL DEFAULT 'ACTIVE',
  provider            auth_provider NOT NULL DEFAULT 'email',
  last_login_at       TIMESTAMPTZ   NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ   NULL
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. addresses
-- ---------------------------------------------------------------------------
CREATE TABLE addresses (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           TEXT          NULL,
  recipient_name  TEXT          NOT NULL,
  phone           TEXT          NOT NULL,
  country         country_code  NOT NULL,
  postal_code     TEXT          NOT NULL,
  state_province  TEXT          NULL,
  city            TEXT          NOT NULL,
  address_line1   TEXT          NOT NULL,
  address_line2   TEXT          NULL,
  is_default      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. sizes
-- ---------------------------------------------------------------------------
CREATE TABLE sizes (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label               TEXT        NOT NULL UNIQUE,
  chest_cm_min        INT         NOT NULL,
  chest_cm_max        INT         NOT NULL,
  back_length_cm_min  INT         NOT NULL,
  back_length_cm_max  INT         NOT NULL,
  neck_cm_min         INT         NOT NULL,
  neck_cm_max         INT         NOT NULL,
  weight_kg_min       DECIMAL(5,1) NOT NULL,
  weight_kg_max       DECIMAL(5,1) NOT NULL,
  breed_examples      JSONB       NOT NULL DEFAULT '[]',
  sort_order          INT         NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. categories (self-referencing, max 2-depth)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID        NULL REFERENCES categories(id) ON DELETE SET NULL,
  slug        TEXT        NOT NULL UNIQUE,
  name_ko     TEXT        NOT NULL,
  name_en     TEXT        NOT NULL,
  name_ja     TEXT        NOT NULL,
  name_de     TEXT        NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. products
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID           NOT NULL REFERENCES categories(id),
  slug              TEXT           NOT NULL UNIQUE,
  name_ko           TEXT           NOT NULL,
  name_en           TEXT           NOT NULL,
  name_ja           TEXT           NOT NULL,
  name_de           TEXT           NOT NULL,
  description_ko    TEXT           NOT NULL DEFAULT '',
  description_en    TEXT           NOT NULL DEFAULT '',
  description_ja    TEXT           NOT NULL DEFAULT '',
  description_de    TEXT           NOT NULL DEFAULT '',
  base_price_krw    INT            NOT NULL DEFAULT 0,
  base_price_usd    DECIMAL(12,2)  NOT NULL DEFAULT 0,
  base_price_jpy    INT            NOT NULL DEFAULT 0,
  base_price_eur    DECIMAL(12,2)  NOT NULL DEFAULT 0,
  material          TEXT           NULL,
  care_instruction  TEXT           NULL,
  weight_g          INT            NULL,
  thumbnail_url     TEXT           NOT NULL DEFAULT '',
  images            JSONB          NOT NULL DEFAULT '[]',
  status            product_status NOT NULL DEFAULT 'DRAFT',
  is_featured       BOOLEAN        NOT NULL DEFAULT FALSE,
  view_count        INT            NOT NULL DEFAULT 0,
  review_count      INT            NOT NULL DEFAULT 0,
  review_avg_rating DECIMAL(3,2)   NOT NULL DEFAULT 0,
  published_at      TIMESTAMPTZ    NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. product_options
-- ---------------------------------------------------------------------------
CREATE TABLE product_options (
  id                      UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id              UUID           NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id                 UUID           NOT NULL REFERENCES sizes(id),
  color                   TEXT           NOT NULL,
  color_hex               TEXT           NULL,
  sku                     TEXT           NOT NULL UNIQUE,
  additional_price_krw    INT            NOT NULL DEFAULT 0,
  additional_price_usd    DECIMAL(12,2)  NOT NULL DEFAULT 0,
  additional_price_jpy    INT            NOT NULL DEFAULT 0,
  additional_price_eur    DECIMAL(12,2)  NOT NULL DEFAULT 0,
  stock                   INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold     INT            NOT NULL DEFAULT 5,
  is_active               BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER product_options_updated_at
  BEFORE UPDATE ON product_options
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. coupons
-- ---------------------------------------------------------------------------
CREATE TABLE coupons (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT          NOT NULL UNIQUE,
  name_ko                 TEXT          NOT NULL,
  name_en                 TEXT          NOT NULL,
  name_ja                 TEXT          NOT NULL,
  name_de                 TEXT          NOT NULL,
  type                    coupon_type   NOT NULL,
  discount_value          DECIMAL(12,2) NOT NULL,
  max_discount_amount     DECIMAL(12,2) NULL,
  min_order_amount        DECIMAL(12,2) NULL,
  currency                currency_code NULL,
  applicable_category_ids JSONB         NULL,
  applicable_product_ids  JSONB         NULL,
  max_issuance_count      INT           NULL,
  max_use_per_user        INT           NOT NULL DEFAULT 1,
  is_combinable           BOOLEAN       NOT NULL DEFAULT FALSE,
  status                  coupon_status NOT NULL DEFAULT 'ACTIVE',
  starts_at               TIMESTAMPTZ   NOT NULL,
  expires_at              TIMESTAMPTZ   NOT NULL,
  created_by              UUID          NOT NULL REFERENCES admins(id),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT coupon_expires_after_starts CHECK (expires_at > starts_at)
);

CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. coupon_issuances
-- ---------------------------------------------------------------------------
CREATE TABLE coupon_issuances (
  id            UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id     UUID                     NOT NULL REFERENCES coupons(id),
  user_id       UUID                     NOT NULL REFERENCES users(id),
  status        coupon_issuance_status   NOT NULL DEFAULT 'ISSUED',
  used_at       TIMESTAMPTZ              NULL,
  used_order_id UUID                     NULL,  -- FK added after orders table
  issued_at     TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ              NOT NULL
);

-- ---------------------------------------------------------------------------
-- 11. carts
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id  TEXT          NULL,
  currency    currency_code NOT NULL DEFAULT 'KRW',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_identity CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 12. cart_items
-- ---------------------------------------------------------------------------
CREATE TABLE cart_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id           UUID        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_option_id UUID        NOT NULL REFERENCES product_options(id),
  quantity          INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_option_id)
);

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 13. orders
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number                TEXT          NOT NULL UNIQUE,
  user_id                     UUID          NOT NULL REFERENCES users(id),
  address_id                  UUID          NOT NULL REFERENCES addresses(id),
  shipping_address_snapshot   JSONB         NOT NULL,
  currency                    currency_code NOT NULL,
  subtotal                    DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_fee                DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount             DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount                  DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount                DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_issuance_id          UUID          NULL REFERENCES coupon_issuances(id),
  point_used                  INT           NOT NULL DEFAULT 0,
  status                      order_status  NOT NULL DEFAULT 'PENDING_PAYMENT',
  memo                        TEXT          NULL,
  admin_memo                  TEXT          NULL,
  ordered_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add FK from coupon_issuances.used_order_id → orders
ALTER TABLE coupon_issuances
  ADD CONSTRAINT coupon_issuances_used_order_id_fkey
  FOREIGN KEY (used_order_id) REFERENCES orders(id);

-- ---------------------------------------------------------------------------
-- 14. order_items
-- ---------------------------------------------------------------------------
CREATE TABLE order_items (
  id                UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID             NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_option_id UUID             NOT NULL REFERENCES product_options(id),
  product_snapshot  JSONB            NOT NULL,
  quantity          INT              NOT NULL CHECK (quantity > 0),
  unit_price        DECIMAL(12,2)    NOT NULL,
  total_price       DECIMAL(12,2)    NOT NULL,
  status            order_item_status NOT NULL DEFAULT 'PENDING',
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 15. payments
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID             NOT NULL UNIQUE REFERENCES orders(id),
  payment_key   TEXT             NOT NULL UNIQUE,
  method        payment_method   NOT NULL,
  provider      payment_provider NOT NULL,
  currency      currency_code    NOT NULL,
  amount        DECIMAL(12,2)    NOT NULL,
  status        payment_status   NOT NULL DEFAULT 'PENDING',
  paid_at       TIMESTAMPTZ      NULL,
  failed_at     TIMESTAMPTZ      NULL,
  cancelled_at  TIMESTAMPTZ      NULL,
  refund_amount DECIMAL(12,2)    NULL,
  refunded_at   TIMESTAMPTZ      NULL,
  pg_response   JSONB            NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 16. shipments
-- ---------------------------------------------------------------------------
CREATE TABLE shipments (
  id                      UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID              NOT NULL UNIQUE REFERENCES orders(id),
  carrier                 shipment_carrier  NOT NULL,
  tracking_number         TEXT              NOT NULL,
  country                 country_code      NOT NULL,
  status                  shipment_status   NOT NULL DEFAULT 'PENDING',
  shipped_at              TIMESTAMPTZ       NULL,
  delivered_at            TIMESTAMPTZ       NULL,
  estimated_delivery_at   TIMESTAMPTZ       NULL,
  return_tracking_number  TEXT              NULL,
  created_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 17. supply_orders
-- ---------------------------------------------------------------------------
CREATE TABLE supply_orders (
  id                   UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_order_number  TEXT                 NOT NULL UNIQUE,
  product_option_id    UUID                 NOT NULL REFERENCES product_options(id),
  quantity             INT                  NOT NULL CHECK (quantity > 0),
  unit_cost            DECIMAL(12,2)        NOT NULL,
  total_cost           DECIMAL(12,2)        NOT NULL,
  status               supply_order_status  NOT NULL DEFAULT 'REQUESTED',
  supplier_name        TEXT                 NOT NULL,
  expected_at          TIMESTAMPTZ          NULL,
  received_at          TIMESTAMPTZ          NULL,
  memo                 TEXT                 NULL,
  created_by           UUID                 NOT NULL REFERENCES admins(id),
  created_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE TRIGGER supply_orders_updated_at
  BEFORE UPDATE ON supply_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 18. points
-- ---------------------------------------------------------------------------
CREATE TABLE points (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance       INT         NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned  INT         NOT NULL DEFAULT 0,
  total_used    INT         NOT NULL DEFAULT 0,
  total_expired INT         NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 19. point_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE point_transactions (
  id              UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                     NOT NULL REFERENCES users(id),
  type            point_transaction_type   NOT NULL,
  amount          INT                      NOT NULL CHECK (amount > 0),
  balance_after   INT                      NOT NULL,
  reason          TEXT                     NOT NULL,
  reference_type  point_reference_type     NULL,
  reference_id    UUID                     NULL,
  expires_at      TIMESTAMPTZ              NULL,
  created_by      UUID                     NULL REFERENCES admins(id),
  created_at      TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 20. wishlists
-- ---------------------------------------------------------------------------
CREATE TABLE wishlists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- 21. reviews
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES users(id),
  product_id      UUID           NOT NULL REFERENCES products(id),
  order_item_id   UUID           NOT NULL UNIQUE REFERENCES order_items(id),
  rating          INT            NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content         TEXT           NOT NULL,
  images          JSONB          NULL DEFAULT '[]',
  dog_weight_kg   DECIMAL(5,1)   NULL,
  dog_breed       TEXT           NULL,
  purchased_size  TEXT           NOT NULL,
  size_feedback   size_feedback  NOT NULL,
  is_photo_review BOOLEAN        NOT NULL DEFAULT FALSE,
  is_best         BOOLEAN        NOT NULL DEFAULT FALSE,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  point_rewarded  BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 22. posts
-- ---------------------------------------------------------------------------
CREATE TABLE posts (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES users(id),
  board_type      board_type     NOT NULL,
  title           TEXT           NOT NULL,
  content         TEXT           NOT NULL,
  images          JSONB          NULL DEFAULT '[]',
  product_ids     JSONB          NULL DEFAULT '[]',
  dog_breed       TEXT           NULL,
  like_count      INT            NOT NULL DEFAULT 0,
  comment_count   INT            NOT NULL DEFAULT 0,
  view_count      INT            NOT NULL DEFAULT 0,
  is_pinned       BOOLEAN        NOT NULL DEFAULT FALSE,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 23. comments
-- ---------------------------------------------------------------------------
CREATE TABLE comments (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID           NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID           NOT NULL REFERENCES users(id),
  parent_id   UUID           NULL REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT           NOT NULL,
  like_count  INT            NOT NULL DEFAULT 0,
  status      content_status NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 24. likes
-- ---------------------------------------------------------------------------
CREATE TABLE likes (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type like_target_type NOT NULL,
  target_id   UUID             NOT NULL,
  created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

-- ---------------------------------------------------------------------------
-- 25. reports
-- ---------------------------------------------------------------------------
CREATE TABLE reports (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID               NOT NULL REFERENCES users(id),
  target_type   report_target_type NOT NULL,
  target_id     UUID               NOT NULL,
  reason        report_reason      NOT NULL,
  detail        TEXT               NULL,
  status        report_status      NOT NULL DEFAULT 'PENDING',
  reviewed_by   UUID               NULL REFERENCES admins(id),
  reviewed_at   TIMESTAMPTZ        NULL,
  action_taken  report_action      NULL,
  admin_memo    TEXT               NULL,
  created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 26. sanctions
-- ---------------------------------------------------------------------------
CREATE TABLE sanctions (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES users(id),
  type        sanction_type  NOT NULL,
  reason      TEXT           NOT NULL,
  report_id   UUID           NULL REFERENCES reports(id),
  starts_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  ends_at     TIMESTAMPTZ    NULL,
  is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
  created_by  UUID           NOT NULL REFERENCES admins(id),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 27. audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID        NOT NULL REFERENCES admins(id),
  action        TEXT        NOT NULL,
  target_type   TEXT        NOT NULL,
  target_id     UUID        NOT NULL,
  before_value  JSONB       NULL,
  after_value   JSONB       NULL,
  ip_address    TEXT        NOT NULL,
  user_agent    TEXT        NOT NULL,
  memo          TEXT        NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 28. event_logs
-- ---------------------------------------------------------------------------
CREATE TABLE event_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT        NOT NULL,
  user_id     UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  session_id  TEXT        NULL,
  properties  JSONB       NOT NULL DEFAULT '{}',
  context     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
