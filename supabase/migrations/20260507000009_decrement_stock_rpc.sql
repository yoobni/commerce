-- Atomic per-item stock decrement — concurrent-safe via row-level UPDATE lock
-- Called exclusively from server-side order flow via service_role
CREATE OR REPLACE FUNCTION decrement_stock(p_option_id UUID, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_options
  SET stock = stock - p_qty
  WHERE id = p_option_id
    AND stock >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock'
      USING
        DETAIL  = format('option_id=%s qty=%s', p_option_id, p_qty),
        ERRCODE = 'P0001';
  END IF;
END;
$$;

-- Compensating increment — rollback path only
CREATE OR REPLACE FUNCTION increment_stock(p_option_id UUID, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_options
  SET stock = stock + p_qty
  WHERE id = p_option_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION decrement_stock(UUID, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO service_role;
REVOKE EXECUTE ON FUNCTION increment_stock(UUID, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION increment_stock(UUID, INT) TO service_role;
