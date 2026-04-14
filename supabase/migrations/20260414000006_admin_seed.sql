-- =============================================================================
-- Migration: Admin Seed Data
-- Created: 2026-04-14
--
-- Default super-admin for initial setup.
-- Password is hashed via pgcrypto (bcrypt / Blowfish, cost=10).
-- Compatible with bcryptjs.compare() on the Node.js side.
--
-- Default credentials:
--   email:    admin@ravi.com
--   password: Admin1234!
--
-- IMPORTANT: Change the password immediately after first login in production.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admins (email, password_hash, name, role, status)
VALUES (
  'admin@ravi.com',
  crypt('Admin1234!', gen_salt('bf', 10)),
  '슈퍼관리자',
  'SUPER_ADMIN',
  'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;
