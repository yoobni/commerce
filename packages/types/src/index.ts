/**
 * @commerce/types — Shared Domain Types
 * Based on: docs/domain-model.md (2026-04-13)
 *
 * Rules:
 * - All optional fields use `null` as default (not undefined)
 * - Enums are string literal unions
 * - Timestamps are ISO 8601 strings
 * - Prices are stored per-currency as separate fields
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export type UUID = string;
export type ISODateTime = string;

export type Locale = 'ko' | 'en' | 'ja' | 'de';
export type Country = 'KR' | 'US' | 'JP' | 'DE';
export type Currency = 'KRW' | 'USD' | 'JPY' | 'EUR';

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
export type AuthProvider = 'email' | 'google' | 'apple' | 'kakao';

export interface User {
  id: UUID;
  email: string;
  name: string;
  phone: string | null;
  locale: Locale;
  country: Country;
  currency: Currency;
  profile_image_url: string | null;
  marketing_agreed: boolean;
  status: UserStatus;
  provider: AuthProvider;
  last_login_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  deleted_at: ISODateTime | null;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  id: UUID;
  user_id: UUID;
  label: string | null;
  recipient_name: string;
  phone: string;
  country: Country;
  postal_code: string;
  state_province: string | null;
  city: string;
  address_line1: string;
  address_line2: string | null;
  is_default: boolean;
  created_at: ISODateTime;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: UUID;
  parent_id: UUID | null;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  sort_order: number;
  is_active: boolean;
  created_at: ISODateTime;
}

// ─── Size ─────────────────────────────────────────────────────────────────────

export type SizeLabel = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export interface Size {
  id: UUID;
  label: SizeLabel;
  chest_cm_min: number;
  chest_cm_max: number;
  back_length_cm_min: number;
  back_length_cm_max: number;
  neck_cm_min: number;
  neck_cm_max: number;
  weight_kg_min: number;
  weight_kg_max: number;
  breed_examples: string[];
  sort_order: number;
  created_at: ISODateTime;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN' | 'DISCONTINUED';

export interface Product {
  id: UUID;
  category_id: UUID;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  description_ko: string;
  description_en: string;
  description_ja: string;
  description_de: string;
  base_price_krw: number;
  base_price_usd: number;
  base_price_jpy: number;
  base_price_eur: number;
  material: string | null;
  care_instruction: string | null;
  weight_g: number | null;
  thumbnail_url: string;
  images: string[];
  status: ProductStatus;
  is_featured: boolean;
  view_count: number;
  review_count: number;
  review_avg_rating: number;
  published_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** Product with resolved relations — used in frontend */
export interface ProductWithDetails extends Product {
  category: Category;
  options: ProductOption[];
}

// ─── ProductOption ────────────────────────────────────────────────────────────

export interface ProductOption {
  id: UUID;
  product_id: UUID;
  size_id: UUID;
  color: string;
  color_hex: string | null;
  sku: string;
  additional_price_krw: number;
  additional_price_usd: number;
  additional_price_jpy: number;
  additional_price_eur: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  /** Resolved relation */
  size?: Size;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface Cart {
  id: UUID;
  user_id: UUID | null;
  session_id: string | null;
  currency: Currency;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CartItem {
  id: UUID;
  cart_id: UUID;
  product_option_id: UUID;
  quantity: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  /** Resolved relation */
  product_option?: ProductOption & { product?: Product };
}

export interface CartWithItems extends Cart {
  items: CartItem[];
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED';

export type OrderItemStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID;
  address_id: UUID;
  shipping_address_snapshot: Address;
  currency: Currency;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_issuance_id: UUID | null;
  point_used: number;
  status: OrderStatus;
  memo: string | null;
  admin_memo: string | null;
  ordered_at: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ProductSnapshot {
  product_id: UUID;
  product_option_id: UUID;
  name: string;
  sku: string;
  thumbnail_url: string;
  size: string;
  color: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_option_id: UUID;
  product_snapshot: ProductSnapshot;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderItemStatus;
  created_at: ISODateTime;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CARD' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY' | 'STRIPE' | 'KLARNA';
export type PaymentProvider = 'STRIPE' | 'TOSS_PAYMENTS';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED';

export interface Payment {
  id: UUID;
  order_id: UUID;
  payment_key: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  currency: Currency;
  amount: number;
  status: PaymentStatus;
  paid_at: ISODateTime | null;
  failed_at: ISODateTime | null;
  cancelled_at: ISODateTime | null;
  refund_amount: number | null;
  refunded_at: ISODateTime | null;
  pg_response: Record<string, unknown>;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type CouponType = 'FIXED_AMOUNT' | 'PERCENTAGE';
export type CouponStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'DEPLETED';
export type CouponIssuanceStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'REVOKED';

export interface Coupon {
  id: UUID;
  code: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  type: CouponType;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  currency: Currency | null;
  applicable_category_ids: UUID[] | null;
  applicable_product_ids: UUID[] | null;
  max_issuance_count: number | null;
  max_use_per_user: number;
  is_combinable: boolean;
  status: CouponStatus;
  starts_at: ISODateTime;
  expires_at: ISODateTime;
  created_by: UUID;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CouponIssuance {
  id: UUID;
  coupon_id: UUID;
  user_id: UUID;
  status: CouponIssuanceStatus;
  used_at: ISODateTime | null;
  used_order_id: UUID | null;
  issued_at: ISODateTime;
  expires_at: ISODateTime;
}

// ─── Point ────────────────────────────────────────────────────────────────────

export type PointTransactionType =
  | 'EARN'
  | 'USE'
  | 'EXPIRE'
  | 'CANCEL_EARN'
  | 'CANCEL_USE'
  | 'ADMIN_GRANT'
  | 'ADMIN_DEDUCT';

export type PointReferenceType = 'ORDER' | 'REVIEW' | 'SIGNUP' | 'ADMIN' | 'EVENT';

export interface Point {
  id: UUID;
  user_id: UUID;
  balance: number;
  total_earned: number;
  total_used: number;
  total_expired: number;
  updated_at: ISODateTime;
}

export interface PointTransaction {
  id: UUID;
  user_id: UUID;
  type: PointTransactionType;
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: PointReferenceType | null;
  reference_id: UUID | null;
  expires_at: ISODateTime | null;
  created_by: UUID | null;
  created_at: ISODateTime;
}

// ─── Shipment ─────────────────────────────────────────────────────────────────

export type Carrier = 'CJ' | 'HANJIN' | 'LOGEN' | 'EMS' | 'DHL' | 'FEDEX' | 'UPS' | 'USPS' | 'YAMATO' | 'SAGAWA';
export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'CUSTOMS_HELD'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED';

export interface Shipment {
  id: UUID;
  order_id: UUID;
  carrier: Carrier;
  tracking_number: string;
  country: Country;
  status: ShipmentStatus;
  shipped_at: ISODateTime | null;
  delivered_at: ISODateTime | null;
  estimated_delivery_at: ISODateTime | null;
  return_tracking_number: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// ─── SupplyOrder ──────────────────────────────────────────────────────────────

export type SupplyOrderStatus = 'REQUESTED' | 'CONFIRMED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface SupplyOrder {
  id: UUID;
  supply_order_number: string;
  product_option_id: UUID;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  status: SupplyOrderStatus;
  supplier_name: string;
  expected_at: ISODateTime | null;
  received_at: ISODateTime | null;
  memo: string | null;
  created_by: UUID;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface Wishlist {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  created_at: ISODateTime;
  /** Resolved relation */
  product?: Product;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export type SizeFeedback = 'SMALL' | 'PERFECT' | 'LARGE';
export type ReviewStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED';

export interface Review {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  order_item_id: UUID;
  rating: number;
  content: string;
  images: string[] | null;
  dog_weight_kg: number | null;
  dog_breed: string | null;
  purchased_size: string;
  size_feedback: SizeFeedback;
  is_photo_review: boolean;
  is_best: boolean;
  status: ReviewStatus;
  point_rewarded: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  /** Resolved relation */
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

// ─── Community ────────────────────────────────────────────────────────────────

export type BoardType = 'DAILY' | 'STYLE' | 'TIP' | 'QUESTION';
export type PostStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED';

export interface Post {
  id: UUID;
  user_id: UUID;
  board_type: BoardType;
  title: string;
  content: string;
  images: string[] | null;
  product_ids: UUID[];
  dog_breed: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  status: PostStatus;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  /** Resolved relation */
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

export interface Comment {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  parent_id: UUID | null;
  content: string;
  like_count: number;
  status: PostStatus;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  /** Resolved relation */
  user?: Pick<User, 'id' | 'name' | 'profile_image_url'>;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'CS' | 'VIEWER';
export type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface Admin {
  id: UUID;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  last_login_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

// ─── CountryConfig ────────────────────────────────────────────────────────────

export interface CountryConfig {
  id: UUID;
  country_code: Country;
  default_locale: Locale;
  default_currency: Currency;
  shipping_available: boolean;
  free_shipping_threshold: number | null;
  base_shipping_fee: number;
  estimated_delivery_days_min: number;
  estimated_delivery_days_max: number;
  tax_rate: number;
  tax_included: boolean;
  return_period_days: number;
  is_active: boolean;
  updated_at: ISODateTime;
}

// ─── AuditLog / EventLog ──────────────────────────────────────────────────────

export interface AuditLog {
  id: UUID;
  admin_id: UUID;
  action: string;
  target_type: string;
  target_id: UUID;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  memo: string | null;
  created_at: ISODateTime;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchProductsParams {
  query: string;
  locale?: Locale;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'relevance';
  page?: number;
  per_page?: number;
}

export interface SearchSuggestion {
  product_id: UUID;
  name: string;
  slug: string;
  thumbnail_url: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
