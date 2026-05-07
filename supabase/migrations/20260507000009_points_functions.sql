-- ---------------------------------------------------------------------------
-- points 원자적 차감/적립 RPC 함수
-- service_role로 호출 (RLS 우회)
-- ---------------------------------------------------------------------------

-- points 행 없을 경우 upsert 보장
CREATE OR REPLACE FUNCTION ensure_points_row(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO points (user_id, balance, total_earned, total_used, total_expired)
  VALUES (p_user_id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- 포인트 차감: USE 트랜잭션 insert + balance 감소 (단일 트랜잭션)
CREATE OR REPLACE FUNCTION use_points(
  p_user_id     UUID,
  p_amount      INT,
  p_reason      TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance     INT;
  v_balance_after INT;
BEGIN
  PERFORM ensure_points_row(p_user_id);

  SELECT balance INTO v_balance
  FROM points
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_points: balance=% required=%', v_balance, p_amount;
  END IF;

  v_balance_after := v_balance - p_amount;

  UPDATE points
  SET balance    = v_balance_after,
      total_used = total_used + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO point_transactions
    (user_id, type, amount, balance_after, reason, reference_type, reference_id)
  VALUES
    (p_user_id, 'USE', p_amount, v_balance_after, p_reason, 'ORDER', p_reference_id);
END;
$$;

-- 포인트 적립: EARN 트랜잭션 insert + balance 증가 (단일 트랜잭션)
CREATE OR REPLACE FUNCTION earn_points(
  p_user_id     UUID,
  p_amount      INT,
  p_reason      TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance       INT;
  v_balance_after INT;
BEGIN
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  PERFORM ensure_points_row(p_user_id);

  SELECT balance INTO v_balance
  FROM points
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_balance_after := v_balance + p_amount;

  UPDATE points
  SET balance      = v_balance_after,
      total_earned = total_earned + p_amount,
      updated_at   = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO point_transactions
    (user_id, type, amount, balance_after, reason, reference_type, reference_id)
  VALUES
    (p_user_id, 'EARN', p_amount, v_balance_after, p_reason, 'ORDER', p_reference_id);
END;
$$;
