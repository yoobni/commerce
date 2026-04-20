-- =============================================================================
-- Migration: Stock management RPC functions for atomic order processing
-- Created: 2026-04-20
-- =============================================================================

-- Atomically decrements product_option stock.
-- Returns the new stock value, or raises exception if insufficient.
CREATE OR REPLACE FUNCTION decrement_stock(
  p_option_id  UUID,
  p_quantity   INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock INT;
BEGIN
  UPDATE product_options
     SET stock = stock - p_quantity
   WHERE id = p_option_id
     AND stock >= p_quantity
  RETURNING stock INTO v_new_stock;

  IF v_new_stock IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: option_id=%, requested=%', p_option_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;

  RETURN v_new_stock;
END;
$$;

-- Atomically increments product_option stock (used on order cancel / payment fail).
CREATE OR REPLACE FUNCTION increment_stock(
  p_option_id  UUID,
  p_quantity   INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock INT;
BEGIN
  UPDATE product_options
     SET stock = stock + p_quantity
   WHERE id = p_option_id
  RETURNING stock INTO v_new_stock;

  RETURN COALESCE(v_new_stock, 0);
END;
$$;

-- Grant execution to authenticated users (called from server-side actions)
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock(UUID, INT) TO authenticated;
