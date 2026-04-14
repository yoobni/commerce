-- =============================================================================
-- Migration: Row Level Security Policies
-- Created: 2026-04-14
--
-- Strategy:
--   - service_role key (used by admin backend) bypasses RLS automatically
--   - authenticated users (commerce frontend) are governed by these policies
--   - anon role has very limited access (public product/category data only)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------
ALTER TABLE country_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins               ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_issuances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE points               ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs           ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- country_configs: public read (anon + authenticated)
-- ---------------------------------------------------------------------------
CREATE POLICY "country_configs_read_all"
  ON country_configs FOR SELECT
  USING (TRUE);

-- ---------------------------------------------------------------------------
-- admins: no direct access from client (service_role only)
-- ---------------------------------------------------------------------------
-- No policies = no access for anon/authenticated roles

-- ---------------------------------------------------------------------------
-- users: own record only
-- ---------------------------------------------------------------------------
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert handled by trigger on auth.users (see triggers migration)
-- Delete (WITHDRAWN) handled via service_role only

-- ---------------------------------------------------------------------------
-- addresses: own records only
-- ---------------------------------------------------------------------------
CREATE POLICY "addresses_select_own"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_own"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- sizes: public read
-- ---------------------------------------------------------------------------
CREATE POLICY "sizes_read_all"
  ON sizes FOR SELECT
  USING (TRUE);

-- ---------------------------------------------------------------------------
-- categories: public read (active only for anon, all for authenticated)
-- ---------------------------------------------------------------------------
CREATE POLICY "categories_read_active"
  ON categories FOR SELECT
  USING (is_active = TRUE);

-- ---------------------------------------------------------------------------
-- products: public read for ACTIVE only; all statuses via service_role
-- ---------------------------------------------------------------------------
CREATE POLICY "products_read_active"
  ON products FOR SELECT
  USING (status = 'ACTIVE');

-- ---------------------------------------------------------------------------
-- product_options: public read for active options on active products
-- ---------------------------------------------------------------------------
CREATE POLICY "product_options_read_active"
  ON product_options FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.status = 'ACTIVE'
    )
  );

-- ---------------------------------------------------------------------------
-- coupons: no client read (queried via server action with service_role)
-- ---------------------------------------------------------------------------
-- No policies for anon/authenticated

-- ---------------------------------------------------------------------------
-- coupon_issuances: own records
-- ---------------------------------------------------------------------------
CREATE POLICY "coupon_issuances_select_own"
  ON coupon_issuances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- carts: own cart (user_id) or session-based (handled server-side)
-- ---------------------------------------------------------------------------
CREATE POLICY "carts_select_own"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "carts_insert_own"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_update_own"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "carts_delete_own"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- cart_items: via cart ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "cart_items_select_own"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_insert_own"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_update_own"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_delete_own"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- orders: own orders
-- ---------------------------------------------------------------------------
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert/Update via service_role (order creation is server-side)

-- ---------------------------------------------------------------------------
-- order_items: via order ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- payments: via order ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- shipments: via order ownership
-- ---------------------------------------------------------------------------
CREATE POLICY "shipments_select_own"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- supply_orders: no client access
-- ---------------------------------------------------------------------------
-- No policies

-- ---------------------------------------------------------------------------
-- points: own record
-- ---------------------------------------------------------------------------
CREATE POLICY "points_select_own"
  ON points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- point_transactions: own records
-- ---------------------------------------------------------------------------
CREATE POLICY "point_transactions_select_own"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- wishlists: own records
-- ---------------------------------------------------------------------------
CREATE POLICY "wishlists_select_own"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reviews: ACTIVE reviews are public read; own records for write
-- ---------------------------------------------------------------------------
CREATE POLICY "reviews_select_active"
  ON reviews FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'ACTIVE')
  WITH CHECK (auth.uid() = user_id);

-- Soft delete: update status to DELETED
CREATE POLICY "reviews_soft_delete_own"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- posts: ACTIVE posts are public read; own records for write
-- ---------------------------------------------------------------------------
CREATE POLICY "posts_select_active"
  ON posts FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'ACTIVE')
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- comments: ACTIVE comments are public read; own records for write
-- ---------------------------------------------------------------------------
CREATE POLICY "comments_select_active"
  ON comments FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'ACTIVE')
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- likes: own records; count reads via denormalized columns
-- ---------------------------------------------------------------------------
CREATE POLICY "likes_select_own"
  ON likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "likes_insert_own"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reports: own submitted reports
-- ---------------------------------------------------------------------------
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- ---------------------------------------------------------------------------
-- sanctions: own records (read-only)
-- ---------------------------------------------------------------------------
CREATE POLICY "sanctions_select_own"
  ON sanctions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- audit_logs: no client access (service_role only)
-- ---------------------------------------------------------------------------
-- No policies

-- ---------------------------------------------------------------------------
-- event_logs: insert-only for authenticated (server-side writes preferred)
-- ---------------------------------------------------------------------------
-- No client-side policies; all writes via service_role
