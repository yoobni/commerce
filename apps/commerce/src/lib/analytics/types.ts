/**
 * Analytics Event Types
 * Based on: docs/analytics-kpi-event-schema.md
 *
 * All events share GlobalProperties injected by AnalyticsManager.
 * Event-specific properties are typed per event name.
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type UserType = 'guest' | 'member' | 'first_purchase' | 'returning';
export type Locale = 'ko' | 'en' | 'ja' | 'de';
export type Currency = 'KRW' | 'USD' | 'JPY' | 'EUR';

/** Injected automatically on every event — do not pass manually */
export interface GlobalEventProperties {
  event_id: string;
  event_timestamp: string;
  user_id: string | null;
  anonymous_id: string;
  session_id: string;
  language: Locale;
  country: string | null;
  currency: Currency;
  device_type: DeviceType;
  os: string;
  browser: string;
  screen_resolution: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  page_url: string;
  page_title: string;
  user_type: UserType;
  app_version: string;
}

export interface ProductSummary {
  product_id: string;
  product_name: string;
  price: number;
  category: string;
  variant_id?: string | null;
  size?: string | null;
  image_url?: string | null;
}

/** Map of event name → event-specific properties */
export interface EventMap {
  // ─── Landing / Entry ─────────────────────────────────────────────────
  landing_view: {
    landing_type: 'main' | 'campaign' | 'product' | 'collection';
    campaign_id: string | null;
  };
  home_view: Record<string, never>;

  // ─── Browse / Discovery ──────────────────────────────────────────────
  collection_view: {
    collection_id: string;
    collection_name: string;
    sort_by: string | null;
    filter_applied: Record<string, unknown> | null;
  };
  product_list_view: {
    list_name: string;
    items: ProductSummary[];
    item_count: number;
    page_number: number;
  };
  product_list_item_click: {
    product_id: string;
    product_name: string;
    position: number;
    list_name: string;
    price: number;
    category: string;
  };
  search_submit: {
    search_query: string;
    search_type: 'keyword' | 'filter';
  };
  search_result_view: {
    search_query: string;
    result_count: number;
    items: ProductSummary[];
  };
  search_result_click: {
    search_query: string;
    product_id: string;
    position: number;
  };
  filter_apply: {
    filter_type: string;
    filter_value: string;
    list_name: string;
  };
  sort_change: {
    sort_by: string;
    list_name: string;
  };

  // ─── Product Detail ──────────────────────────────────────────────────
  product_detail_view: {
    product_id: string;
    product_name: string;
    price: number;
    category: string;
    variant_id: string | null;
    size: string | null;
    community_inflow: boolean;
  };
  size_guide_view: {
    product_id: string;
    breed_type: string | null;
  };
  product_image_view: {
    product_id: string;
    image_index: number;
    image_type: 'main' | 'detail' | 'fit';
  };
  product_review_section_view: {
    product_id: string;
    review_count: number;
    average_rating: number;
  };
  product_option_select: {
    product_id: string;
    option_type: 'size' | 'color';
    option_value: string;
  };

  // ─── Cart ────────────────────────────────────────────────────────────
  add_to_cart_clicked: {
    product_id: string;
    source: 'pdp_inline' | 'pdp_sticky';
    has_selection: boolean;
  };
  cart_view: {
    items: ProductSummary[];
    item_count: number;
    cart_total: number;
  };
  cart_quantity_change: {
    product_id: string;
    size: string | null;
    previous_quantity: number;
    new_quantity: number;
  };

  // ─── Commerce Funnel ─────────────────────────────────────────────────
  add_to_cart: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    size: string | null;
    variant_id: string | null;
    category: string;
    list_name: string | null;
    community_inflow: boolean;
  };
  remove_from_cart: {
    product_id: string;
    variant_id: string | null;
    quantity: number;
  };
  begin_checkout: {
    items: ProductSummary[];
    total_value: number;
    coupon_applied: boolean;
    coupon_code: string | null;
    point_used: number;
  };
  add_shipping_info: {
    shipping_method: string;
    country: string;
    total_value: number;
  };
  add_payment_info: {
    payment_method: string;
    total_value: number;
  };
  coupon_apply: {
    coupon_code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    order_total_before: number;
  };
  coupon_apply_fail: {
    coupon_code: string;
    fail_reason: 'expired' | 'invalid' | 'min_order' | 'already_used';
  };
  point_use: {
    points_used: number;
    order_total_before: number;
  };
  checkout_abandon: {
    abandon_step: 'shipping' | 'payment' | 'review';
    cart_total: number;
    item_count: number;
  };
  purchase: {
    order_id: string;
    transaction_id: string | null;
    total: number;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    discount_total: number;
    coupon_code: string | null;
    coupon_discount: number;
    points_used: number;
    points_discount: number;
    item_count: number;
    items: ProductSummary[];
    first_purchase: boolean;
    community_inflow: boolean;
    shipping_country: string;
    shipping_method: string;
    payment_method: string;
  };

  // ─── Wishlist ─────────────────────────────────────────────────────────
  wishlist_add: {
    product_id: string;
    product_name: string;
    price: number;
    category: string;
    source_page: 'list' | 'detail' | 'community';
  };
  wishlist_remove: {
    product_id: string;
  };
  wishlist_view: {
    item_count: number;
  };

  // ─── Auth ─────────────────────────────────────────────────────────────
  signup_start: {
    method: 'email' | 'google' | 'kakao' | 'apple';
  };
  signup_complete: {
    method: 'email' | 'google' | 'kakao' | 'apple';
    referral_code: string | null;
  };
  login_complete: {
    method: 'email' | 'google' | 'kakao' | 'apple';
  };
  logout: Record<string, never>;

  // ─── Community / Reviews ──────────────────────────────────────────────
  review_create: {
    product_id: string;
    rating: number;
    has_photo: boolean;
    has_text: boolean;
    size_purchased: string | null;
  };
  review_view: {
    product_id: string;
    review_id: string;
  };
  review_helpful: {
    review_id: string;
    product_id: string;
  };
  community_feed_view: {
    feed_type: 'all' | 'popular' | 'following';
  };
  community_post_create: {
    category: string;
    has_photo: boolean;
    product_tag_count: number;
  };
  community_post_view: {
    post_id: string;
    category: string;
    from_product_page: boolean;
  };
  community_post_like: {
    post_id: string;
  };
  community_comment_create: {
    post_id: string;
    comment_length: number;
  };
  community_to_product: {
    post_id: string;
    product_id: string;
    click_source: 'tag' | 'link' | 'review';
  };

  // ─── Account / My Page ────────────────────────────────────────────────────
  profile_update: {
    fields_changed: string[];
  };
  pet_profile_create: {
    breed: string | null;
    weight_kg: number | null;
    size_category: 'medium' | 'large' | 'xlarge';
  };
  address_add: {
    country: string;
    is_default: boolean;
  };
  address_edit: {
    country: string;
  };
  address_delete: Record<string, never>;
  address_set_default: Record<string, never>;
  password_change: Record<string, never>;
  password_reset_request: Record<string, never>;
  account_delete: Record<string, never>;

  // ─── Post-order ────────────────────────────────────────────────────────
  order_detail_view: {
    order_id: string;
    order_status: string;
  };
  order_cancel_request: {
    order_id: string;
    cancel_reason: string | null;
  };
  refund_request: {
    order_id: string;
    refund_reason: string | null;
    refund_items: ProductSummary[];
  };

  // ─── Engagement / Global ──────────────────────────────────────────────
  share: {
    share_type: 'product' | 'post' | 'review';
    share_method: 'link' | 'kakao' | 'twitter' | 'facebook';
    content_id: string;
  };
  newsletter_subscribe: {
    subscribe_source: 'footer' | 'popup' | 'checkout';
  };
  language_change: {
    from_language: Locale;
    to_language: Locale;
  };
  currency_change: {
    from_currency: Currency;
    to_currency: Currency;
  };
  error_view: {
    error_type: '404' | '500' | 'network';
    error_page_url: string;
  };
}

export type EventName = keyof EventMap;
export type EventProperties<T extends EventName> = EventMap[T];
