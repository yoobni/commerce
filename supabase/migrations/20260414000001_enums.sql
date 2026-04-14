-- =============================================================================
-- Migration: ENUM Types
-- Created: 2026-04-14
-- =============================================================================

-- User
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'WITHDRAWN');
CREATE TYPE user_locale AS ENUM ('ko', 'en', 'ja', 'de');
CREATE TYPE country_code AS ENUM ('KR', 'US', 'JP', 'DE');
CREATE TYPE currency_code AS ENUM ('KRW', 'USD', 'JPY', 'EUR');
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'apple', 'kakao');

-- Product
CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'SOLD_OUT', 'HIDDEN', 'DISCONTINUED');

-- Order
CREATE TYPE order_status AS ENUM (
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'CANCELLED',
  'DELIVERY_FAILED'
);

CREATE TYPE order_item_status AS ENUM (
  'PENDING',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'CANCELLED'
);

-- Payment
CREATE TYPE payment_method AS ENUM (
  'CARD',
  'KAKAO_PAY',
  'NAVER_PAY',
  'TOSS_PAY',
  'STRIPE',
  'KLARNA'
);

CREATE TYPE payment_provider AS ENUM ('STRIPE', 'TOSS_PAYMENTS');

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'FULLY_REFUNDED'
);

-- Shipment
CREATE TYPE shipment_carrier AS ENUM (
  'CJ', 'HANJIN', 'LOGEN', 'EMS',
  'DHL', 'FEDEX', 'UPS', 'USPS',
  'YAMATO', 'SAGAWA'
);

CREATE TYPE shipment_status AS ENUM (
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS_HELD',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED'
);

-- Coupon
CREATE TYPE coupon_type AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');
CREATE TYPE coupon_status AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED');
CREATE TYPE coupon_issuance_status AS ENUM ('ISSUED', 'USED', 'EXPIRED', 'REVOKED');

-- Point
CREATE TYPE point_transaction_type AS ENUM (
  'EARN',
  'USE',
  'EXPIRE',
  'CANCEL_EARN',
  'CANCEL_USE',
  'ADMIN_GRANT',
  'ADMIN_DEDUCT'
);

CREATE TYPE point_reference_type AS ENUM (
  'ORDER', 'REVIEW', 'SIGNUP', 'ADMIN', 'EVENT'
);

-- Supply Order
CREATE TYPE supply_order_status AS ENUM (
  'REQUESTED', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED'
);

-- Community
CREATE TYPE board_type AS ENUM ('DAILY', 'STYLE', 'TIP', 'QUESTION');
CREATE TYPE content_status AS ENUM ('ACTIVE', 'HIDDEN', 'DELETED');
CREATE TYPE like_target_type AS ENUM ('POST', 'COMMENT');

-- Report
CREATE TYPE report_reason AS ENUM (
  'SPAM', 'ABUSE', 'INAPPROPRIATE', 'FRAUD', 'OTHER'
);

CREATE TYPE report_status AS ENUM (
  'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'
);

CREATE TYPE report_action AS ENUM (
  'NONE', 'WARNING', 'CONTENT_HIDDEN', 'USER_SUSPENDED'
);

CREATE TYPE report_target_type AS ENUM ('POST', 'COMMENT', 'REVIEW', 'USER');

-- Sanction
CREATE TYPE sanction_type AS ENUM (
  'WARNING', 'SUSPEND_7D', 'SUSPEND_30D', 'PERMANENT_BAN'
);

-- Admin
CREATE TYPE admin_role AS ENUM (
  'SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CS', 'VIEWER'
);

CREATE TYPE admin_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- Review
CREATE TYPE size_feedback AS ENUM ('SMALL', 'PERFECT', 'LARGE');
