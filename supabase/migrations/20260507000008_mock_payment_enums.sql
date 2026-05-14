-- MockProvider 지원을 위한 enum 확장
-- PAYMENT_PROVIDER=mock 환경에서만 사용됨. 실제 PG 연동 시 불필요.
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'MOCK';
ALTER TYPE payment_status  ADD VALUE IF NOT EXISTS 'MOCK_SUCCEEDED';
ALTER TYPE payment_status  ADD VALUE IF NOT EXISTS 'MOCK_REFUNDED';
