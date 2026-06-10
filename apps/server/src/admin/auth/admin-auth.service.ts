import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../supabase/supabase.module';
import { signSession, type AdminSessionPayload } from '../common/admin-session';
import type { AdminRole } from '../common/admin-roles';

interface AdminRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: string;
  password_hash: string;
}

const SESSION_TTL_HOURS = 8;

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  /**
   * Verify credentials, issue a session token, and record the session.
   * Caller (admin app) is responsible for setting the httpOnly cookie.
   *
   * Returns the token + the admin profile so the admin app can render the
   * authenticated shell immediately without a follow-up /me roundtrip.
   */
  async login(
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ): Promise<{ token: string; admin: AdminSessionPayload; expires_at: string }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (this.supabase.from('admins') as any)
      .select('id, email, name, role, status, password_hash')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      this.logger.error(`admin lookup failed: ${error.message}`);
    }
    if (!row) {
      throw new UnauthorizedException('invalid_credentials');
    }
    const admin = row as AdminRow;

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('account_inactive');
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('invalid_credentials');
    }

    const payload: AdminSessionPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    const token = await signSession(payload);

    // Fire-and-forget — login should not block on session bookkeeping.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (this.supabase.from('admins') as any)
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(
      Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000
    ).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (this.supabase.from('admin_sessions') as any).insert({
      admin_id: admin.id,
      token_hash: tokenHash,
      ip_address: ip,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    return { token, admin: payload, expires_at: expiresAt };
  }

  /**
   * Revoke the session row matching the bearer token. Idempotent — if the
   * row is already revoked or missing the call is a no-op.
   */
  async logout(token: string): Promise<void> {
    if (!token) return;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.supabase.from('admin_sessions') as any)
      .update({ is_revoked: true })
      .eq('token_hash', tokenHash);
  }
}
