import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';

export type LikeTarget = 'POST' | 'COMMENT';

export interface ToggleLikeResult {
  liked: boolean;
  like_count: number;
}

@Injectable()
export class LikesService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  /**
   * Atomic toggle via the `toggle_like` Postgres function — adds or removes
   * the like and returns the new state + counter in one round-trip.
   */
  async toggle(target: LikeTarget, targetId: string, userId: string): Promise<ToggleLikeResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.rpc as any)('toggle_like', {
      p_target_type: target,
      p_target_id: targetId,
      p_user_id: userId,
    });
    if (error || !data || !data[0]) throw error ?? new Error('community_db_error');
    const row = data[0] as { out_liked: boolean; out_like_count: number };
    return { liked: row.out_liked, like_count: row.out_like_count };
  }

  /** Whether `userId` has liked a given post. */
  async hasLikedPost(postId: string, userId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('likes') as any)
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', 'POST')
      .eq('target_id', postId)
      .maybeSingle();
    return !!data;
  }

  /**
   * Comment ids under `postId` that `userId` has liked. Used for the
   * comment-list initial-state hydration (filled hearts on first render).
   */
  async likedCommentIdsForPost(postId: string, userId: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: commentRows } = await (this.supabase.from('comments') as any)
      .select('id')
      .eq('post_id', postId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commentIds = ((commentRows ?? []) as any[]).map((r) => r.id as string);
    if (commentIds.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('likes') as any)
      .select('target_id')
      .eq('user_id', userId)
      .eq('target_type', 'COMMENT')
      .in('target_id', commentIds);
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((r) => r.target_id as string);
  }
}
