-- Add hound profile to users for the "Fit for Hana" onboarding flow.
-- Stored as JSONB so we can iterate on the schema (additional fields like
-- coat, age, allergies) without a fresh migration each time.
--
-- Shape (TS-side, validated by zod in the server):
--   { name: string, breed?: string, body_type: 'Sporty'|'Sturdy'|'Slim'|'Cloud',
--     weight_kg: number, size: 'S'|'M'|'L'|'XL'|'XXL', avatar_url?: string }

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS hound_profile jsonb;
