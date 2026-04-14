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
/** Mirrors board_type ENUM in supabase/migrations/20260414000001_enums.sql */
export type BoardType = 'DAILY' | 'STYLE' | 'TIP' | 'QUESTION';
/** Mirrors like_target_type ENUM */
export type LikeTargetType = 'POST' | 'COMMENT';
/** Mirrors report_reason ENUM */
export type ReportReason = 'SPAM' | 'HATE' | 'SEXUAL' | 'VIOLENCE' | 'ETC';

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
  /**
   * Single unified event for both add and remove.
   * source_position: 1-based index within the list (null when source is not a list, e.g. PDP)
   * source_section:  where the toggle was triggered from
   */
  wishlist_toggled: {
    product_id: string;
    product_name: string;
    price: number;
    category: string;
    action: 'add' | 'remove';
    source_position: number | null;
    source_section: 'plp' | 'pdp' | 'wishlist' | 'cart';
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

  /**
   * 게시판 목록 진입 (board_type별 탭 전환 포함)
   * KPI: 게시판별 DAU, 세션당 게시판 체류 비율
   */
  community_board_view: {
    board_type: BoardType;
    sort_by: 'latest' | 'popular' | null;
    page_number: number;
  };

  /**
   * 게시글 작성 완료
   * KPI: 게시판별 글 생성율, 사진/태그 첨부율
   */
  community_post_create: {
    board_type: BoardType;
    has_photo: boolean;
    has_text: boolean;
    product_tag_count: number;
  };

  /**
   * 게시글 수정 완료
   * KPI: 수정율, 수정 필드 분포 (콘텐츠 품질 지표)
   */
  community_post_edit: {
    post_id: string;
    board_type: BoardType;
    fields_changed: string[];
  };

  /**
   * 게시글 삭제
   * KPI: 자진 삭제율 (신고 대비 자진 삭제 비율)
   */
  community_post_delete: {
    post_id: string;
    board_type: BoardType;
  };

  /**
   * 게시글 상세 조회
   * KPI: 게시판별 게시글 조회수, 커뮤니티→상품 유입률
   */
  community_post_view: {
    post_id: string;
    board_type: BoardType;
    from_product_page: boolean;
    like_count: number;
    comment_count: number;
    is_author: boolean;
  };

  /**
   * 댓글/대댓글 작성 완료
   * KPI: 게시글당 댓글수, 대댓글 비율 (토론 깊이)
   */
  community_comment_create: {
    post_id: string;
    comment_id: string;
    board_type: BoardType;
    is_reply: boolean;
  };

  /**
   * 댓글 삭제
   * KPI: 댓글 자진 삭제율
   */
  community_comment_delete: {
    post_id: string;
    comment_id: string;
    board_type: BoardType;
  };

  /**
   * 좋아요 토글 (POST/COMMENT 공통)
   * KPI: 게시판별 좋아요율, 댓글 vs 게시글 좋아요 비율
   */
  community_like_toggle: {
    target_type: LikeTargetType;
    target_id: string;
    post_id: string;
    board_type: BoardType;
    action: 'like' | 'unlike';
  };

  /**
   * 신고 제출
   * KPI: 신고율, 신고 사유 분포 (모더레이션 부하 지표)
   * 주의: post_id는 COMMENT 신고 시에도 상위 게시글 ID를 포함 (컨텍스트 보존)
   */
  community_report_submit: {
    target_type: LikeTargetType;
    target_id: string;
    post_id: string;
    board_type: BoardType;
    reason: ReportReason;
  };

  /**
   * 커뮤니티 게시글 내 상품 태그 클릭 → PDP 이동
   * KPI: 커뮤니티 → 커머스 전환율 (핵심 퍼널 연결 지표)
   */
  community_to_product_click: {
    post_id: string;
    product_id: string;
    board_type: BoardType;
  };
}

export type EventName = keyof EventMap;
export type EventProperties<T extends EventName> = EventMap[T];
