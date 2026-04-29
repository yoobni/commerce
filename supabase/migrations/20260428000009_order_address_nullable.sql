-- shipping_address_snapshot is the authoritative record; address_id is a convenience FK
-- Users without pre-saved addresses should still be able to checkout
ALTER TABLE public.orders
  ALTER COLUMN address_id DROP NOT NULL;
