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
  image_zoom: {
    product_id: string;
    image_index: number;
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
  purchase: {
    order_id: string;
    total_value: number;
    tax: number;
    shipping_cost: number;
    coupon_code: string | null;
    point_used: number;
    items: ProductSummary[];
    is_first_purchase: boolean;
    payment_method: string;
  };

  // ─── Wishlist / Coupon / Points ───────────────────────────────────────
  wishlist_add: {
    product_id: string;
    product_name: string;
    price: number;
    category: string;
  };
  wishlist_remove: {
    product_id: string;
  };
  coupon_apply: {
    coupon_code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    order_total_before: number;
  };
  point_use: {
    points_used: number;
    order_total_before: number;
  };

  // ─── Auth ─────────────────────────────────────────────────────────────
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
  community_to_product_click: {
    post_id: string;
    product_id: string;
  };
}

export type EventName = keyof EventMap;
export type EventProperties<T extends EventName> = EventMap[T];
