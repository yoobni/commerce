-- =============================================================================
-- Migration: Indexes & Business Logic Triggers
-- Created: 2026-04-14
-- =============================================================================

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

-- users
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_status     ON users (status);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NOT NULL;

-- addresses
CREATE INDEX idx_addresses_user_id   ON addresses (user_id);
CREATE INDEX idx_addresses_is_default ON addresses (user_id, is_default) WHERE is_default = TRUE;

-- categories
CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_slug      ON categories (slug);

-- products
CREATE INDEX idx_products_category_id  ON products (category_id);
CREATE INDEX idx_products_status       ON products (status);
CREATE INDEX idx_products_slug         ON products (slug);
CREATE INDEX idx_products_is_featured  ON products (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_published_at ON products (published_at);

-- product_options
CREATE INDEX idx_product_options_product_id ON product_options (product_id);
CREATE INDEX idx_product_options_sku        ON product_options (sku);
CREATE INDEX idx_product_options_stock      ON product_options (stock) WHERE stock <= low_stock_threshold;

-- coupons
CREATE INDEX idx_coupons_code       ON coupons (code);
CREATE INDEX idx_coupons_status     ON coupons (status);
CREATE INDEX idx_coupons_expires_at ON coupons (expires_at);

-- coupon_issuances
CREATE INDEX idx_coupon_issuances_user_id   ON coupon_issuances (user_id);
CREATE INDEX idx_coupon_issuances_coupon_id ON coupon_issuances (coupon_id);
CREATE INDEX idx_coupon_issuances_status    ON coupon_issuances (status);
CREATE INDEX idx_coupon_issuances_expires   ON coupon_issuances (expires_at) WHERE status = 'ISSUED';

-- carts
CREATE INDEX idx_carts_user_id    ON carts (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session_id ON carts (session_id) WHERE session_id IS NOT NULL;

-- cart_items
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);

-- orders
CREATE INDEX idx_orders_user_id      ON orders (user_id);
CREATE INDEX idx_orders_status       ON orders (status);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_ordered_at   ON orders (ordered_at DESC);
CREATE INDEX idx_orders_pending_payment
  ON orders (status, ordered_at)
  WHERE status = 'PENDING_PAYMENT';
CREATE INDEX idx_orders_delivered
  ON orders (status, updated_at)
  WHERE status = 'DELIVERED';

-- order_items
CREATE INDEX idx_order_items_order_id          ON order_items (order_id);
CREATE INDEX idx_order_items_product_option_id ON order_items (product_option_id);

-- payments
CREATE INDEX idx_payments_order_id    ON payments (order_id);
CREATE INDEX idx_payments_payment_key ON payments (payment_key);
CREATE INDEX idx_payments_status      ON payments (status);

-- shipments
CREATE INDEX idx_shipments_order_id        ON shipments (order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments (tracking_number);
CREATE INDEX idx_shipments_status          ON shipments (status);

-- supply_orders
CREATE INDEX idx_supply_orders_product_option_id ON supply_orders (product_option_id);
CREATE INDEX idx_supply_orders_status            ON supply_orders (status);

-- points
CREATE INDEX idx_points_user_id ON points (user_id);

-- point_transactions
CREATE INDEX idx_point_transactions_user_id    ON point_transactions (user_id);
CREATE INDEX idx_point_transactions_type       ON point_transactions (type);
CREATE INDEX idx_point_transactions_expires_at ON point_transactions (expires_at)
  WHERE expires_at IS NOT NULL AND type = 'EARN';

-- wishlists
CREATE INDEX idx_wishlists_user_id    ON wishlists (user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists (product_id);

-- reviews
CREATE INDEX idx_reviews_product_id ON reviews (product_id);
CREATE INDEX idx_reviews_user_id    ON reviews (user_id);
CREATE INDEX idx_reviews_status     ON reviews (status);
CREATE INDEX idx_reviews_is_best    ON reviews (is_best) WHERE is_best = TRUE;

-- posts
CREATE INDEX idx_posts_user_id    ON posts (user_id);
CREATE INDEX idx_posts_board_type ON posts (board_type);
CREATE INDEX idx_posts_status     ON posts (status);
CREATE INDEX idx_posts_is_pinned  ON posts (is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- comments
CREATE INDEX idx_comments_post_id   ON comments (post_id);
CREATE INDEX idx_comments_user_id   ON comments (user_id);
CREATE INDEX idx_comments_parent_id ON comments (parent_id) WHERE parent_id IS NOT NULL;

-- likes
CREATE INDEX idx_likes_user_id     ON likes (user_id);
CREATE INDEX idx_likes_target      ON likes (target_type, target_id);

-- reports
CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_target      ON reports (target_type, target_id);
CREATE INDEX idx_reports_status      ON reports (status);

-- sanctions
CREATE INDEX idx_sanctions_user_id  ON sanctions (user_id);
CREATE INDEX idx_sanctions_is_active ON sanctions (is_active, ends_at)
  WHERE is_active = TRUE;

-- audit_logs
CREATE INDEX idx_audit_logs_admin_id    ON audit_logs (admin_id);
CREATE INDEX idx_audit_logs_target      ON audit_logs (target_type, target_id);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs (created_at DESC);
-- Partition-friendly: filter by date range for archival
CREATE INDEX idx_audit_logs_created_at_brin ON audit_logs USING BRIN (created_at);

-- event_logs
CREATE INDEX idx_event_logs_event_name ON event_logs (event_name);
CREATE INDEX idx_event_logs_user_id    ON event_logs (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_event_logs_created_at ON event_logs USING BRIN (created_at);

-- ---------------------------------------------------------------------------
-- TRIGGERS: Business Logic
-- ---------------------------------------------------------------------------

-- 1. Auto-create user profile on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email')::auth_provider
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- 2. Auto-create point record on user INSERT
CREATE OR REPLACE FUNCTION handle_new_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.points (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_init_points
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_points();

-- 3. Order number generator: RV-YYYYMMDD-XXXX (sequential per day)
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'RV-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('order_number_seq') % 10000 AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- 4. Supply order number generator
CREATE SEQUENCE IF NOT EXISTS supply_order_number_seq;

CREATE OR REPLACE FUNCTION generate_supply_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.supply_order_number IS NULL OR NEW.supply_order_number = '' THEN
    NEW.supply_order_number := 'SO-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(nextval('supply_order_number_seq') % 10000 AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER supply_orders_set_number
  BEFORE INSERT ON supply_orders
  FOR EACH ROW EXECUTE FUNCTION generate_supply_order_number();

-- 5. Prevent review duplicate (one review per order_item, enforced by UNIQUE, but also guard status)
-- Note: order_item_id UNIQUE constraint already handles this at DB level.

-- 6. Ensure only one default address per user
CREATE OR REPLACE FUNCTION enforce_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER addresses_single_default
  AFTER INSERT OR UPDATE OF is_default ON addresses
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION enforce_single_default_address();

-- 7. Update product review cache on review INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION update_product_review_cache()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
  new_count INT;
  new_avg DECIMAL(3,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  SELECT COUNT(*), COALESCE(AVG(rating), 0)
  INTO new_count, new_avg
  FROM reviews
  WHERE product_id = target_product_id AND status = 'ACTIVE';

  UPDATE products
  SET review_count = new_count,
      review_avg_rating = new_avg
  WHERE id = target_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_product_cache
  AFTER INSERT OR UPDATE OF status, rating OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_review_cache();

-- 8. Update post comment_count on comment INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
  ELSE
    target_post_id := NEW.post_id;
  END IF;

  UPDATE posts
  SET comment_count = (
    SELECT COUNT(*) FROM comments
    WHERE post_id = target_post_id AND status = 'ACTIVE'
  )
  WHERE id = target_post_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_update_post_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- 9. Update like_count on likes INSERT/DELETE
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'POST' THEN
      UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'COMMENT' THEN
      UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'POST' THEN
      UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'COMMENT' THEN
      UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_update_counts
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- ---------------------------------------------------------------------------
-- SEED: CountryConfig defaults
-- ---------------------------------------------------------------------------
INSERT INTO country_configs (
  country_code, default_locale, default_currency,
  shipping_available, free_shipping_threshold, base_shipping_fee,
  estimated_delivery_days_min, estimated_delivery_days_max,
  tax_rate, tax_included, return_period_days, is_active
) VALUES
  ('KR', 'ko', 'KRW', TRUE, 50000,   3000,  2,  4,  0.1,    FALSE, 7,  TRUE),
  ('US', 'en', 'USD', TRUE, 100,     15,    7,  14, 0.0,    FALSE, 14, TRUE),
  ('JP', 'ja', 'JPY', TRUE, 10000,   1500,  5,  10, 0.1,    TRUE,  8,  TRUE),
  ('DE', 'de', 'EUR', TRUE, 80,      12,    7,  14, 0.19,   TRUE,  14, TRUE)
ON CONFLICT (country_code) DO NOTHING;
