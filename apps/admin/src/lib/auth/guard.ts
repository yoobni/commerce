import { getSession, type AdminSession } from './session';
import { hasPermission, type AdminRole } from './roles';

/**
 * Call at the top of every server action that requires authorization.
 * Throws 'Unauthorized' if no session, 'Forbidden' if role is insufficient.
 */
export async function requireRole(minRole: AdminRole): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (!hasPermission(session.role, minRole)) throw new Error('Forbidden');
  return session;
}
