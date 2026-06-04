-- Atomic like toggle for community posts & comments.
--
-- Replaces the prior read-modify-write pattern in app code which had two
-- bugs:
--   1. Race condition (two concurrent clicks could leave the counter off
--      by one).
--   2. Wrong table reference (`post_likes`/`comment_likes` don't exist —
--      the schema uses a single polymorphic `likes` table keyed by
--      (user_id, target_type, target_id)).
--
-- This function INSERTs/DELETEs into `likes` only. The pre-existing
-- `likes_update_counts` AFTER trigger handles the posts/comments counter
-- atomically via `like_count = like_count + 1` / `GREATEST(like_count-1, 0)`.

DROP FUNCTION IF EXISTS toggle_like(like_target_type, uuid, uuid);

CREATE OR REPLACE FUNCTION toggle_like(
  p_target_type like_target_type,
  p_target_id   uuid,
  p_user_id     uuid
)
RETURNS TABLE(out_liked boolean, out_like_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted   int;
  v_new_count int;
BEGIN
  -- DELETE-first: if a row existed, this is an unlike. The trigger handles
  -- the counter decrement.
  DELETE FROM likes
    WHERE user_id     = p_user_id
      AND target_type = p_target_type
      AND target_id   = p_target_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    -- Read the trigger's resulting counter.
    IF p_target_type = 'POST' THEN
      SELECT posts.like_count INTO v_new_count FROM posts WHERE id = p_target_id;
    ELSE
      SELECT comments.like_count INTO v_new_count FROM comments WHERE id = p_target_id;
    END IF;
    RETURN QUERY SELECT false, v_new_count;
    RETURN;
  END IF;

  -- Insert. UNIQUE constraint on (user_id, target_type, target_id) protects
  -- against concurrent duplicate inserts; trigger handles the counter.
  BEGIN
    INSERT INTO likes (user_id, target_type, target_id)
      VALUES (p_user_id, p_target_type, p_target_id);
  EXCEPTION
    WHEN unique_violation THEN
      -- A concurrent insert from the same user won. Fall through and just
      -- read the resulting state.
      NULL;
  END;

  IF p_target_type = 'POST' THEN
    SELECT posts.like_count INTO v_new_count FROM posts WHERE id = p_target_id;
  ELSE
    SELECT comments.like_count INTO v_new_count FROM comments WHERE id = p_target_id;
  END IF;
  RETURN QUERY SELECT true, v_new_count;
END;
$$;

REVOKE ALL ON FUNCTION toggle_like(like_target_type, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION toggle_like(like_target_type, uuid, uuid) TO authenticated, service_role;
