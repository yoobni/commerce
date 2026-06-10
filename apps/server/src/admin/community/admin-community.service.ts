import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import type {
  BoardType,
  Comment,
  PaginatedResponse,
  Post,
  PostStatus,
  User,
} from '@commerce/types';

export interface AdminPostRow extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface AdminCommentRow extends Comment {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface AdminPostDetail extends Post {
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
  comments: AdminCommentRow[];
}

export interface ListPostsParams {
  status?: PostStatus | 'ALL';
  board_type?: BoardType | 'ALL';
  is_pinned?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

@Injectable()
export class AdminCommunityService {
  private readonly logger = new Logger(AdminCommunityService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async listPosts(params: ListPostsParams = {}): Promise<PaginatedResponse<AdminPostRow>> {
    const {
      status = 'ALL',
      board_type = 'ALL',
      is_pinned,
      search,
      page = 1,
      per_page = 20,
    } = params;
    const offset = (page - 1) * per_page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('posts') as any).select(
      '*, user:users!user_id(id, name, profile_image_url)',
      { count: 'exact' }
    );
    if (status !== 'ALL') query = query.eq('status', status);
    if (board_type !== 'ALL') query = query.eq('board_type', board_type);
    if (is_pinned !== undefined) query = query.eq('is_pinned', is_pinned);
    if (search) {
      const safe = search.replace(/[%_]/g, (m) => `\\${m}`);
      query = query.ilike('title', `%${safe}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: (data ?? []) as AdminPostRow[],
      total,
      page,
      per_page,
      has_next: offset + per_page < total,
    };
  }

  async getPost(id: string): Promise<AdminPostDetail | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: postError } = await (this.supabase.from('posts') as any)
      .select('*, user:users!user_id(id, name, profile_image_url)')
      .eq('id', id)
      .maybeSingle();
    if (postError) throw postError;
    if (!post) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: comments, error: commentError } = await (this.supabase.from('comments') as any)
      .select('*, user:users!user_id(id, name, profile_image_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (commentError) throw commentError;

    return {
      ...(post as Post & { user: Pick<User, 'id' | 'name' | 'profile_image_url'> | null }),
      comments: (comments ?? []) as AdminCommentRow[],
    };
  }

  async setPostStatus(postId: string, status: PostStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('posts') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) {
      this.logger.error(`[setPostStatus] ${error.message}`);
      throw new BadRequestException('post_status_update_failed');
    }
  }

  async setPostPinned(postId: string, isPinned: boolean): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('posts') as any)
      .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) {
      this.logger.error(`[setPostPinned] ${error.message}`);
      throw new BadRequestException('post_pin_update_failed');
    }
  }

  async setCommentStatus(commentId: string, status: PostStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('comments') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (error) {
      this.logger.error(`[setCommentStatus] ${error.message}`);
      throw new BadRequestException('comment_status_update_failed');
    }
  }
}
