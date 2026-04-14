# 분석 KPI 및 이벤트 스키마 설계

> 작성: Iseria (planner)
> 최종 수정: 2026-04-13
> 상태: 확정 대기 — 사용자 승인 후 Lua(analytics)/Yuna(frontend)/Politis(backend)에 배분

---

## 1. 목표

- 퍼널 전 구간(landing → purchase)의 이벤트 목록을 확정한다.
- 핵심 속성(property)을 정의하여 국가/언어/캠페인/쿠폰/커뮤니티 단위 분석이 가능하게 한다.
- KPI 대시보드 항목을 정의하여 운영팀이 바로 의사결정할 수 있게 한다.
- 커뮤니티→커머스 전환 흐름을 측정 가능하게 한다.

---

## 2. 포함 범위

- 커머스 퍼널 전 구간 이벤트 (landing → purchase)
- 커뮤니티/리뷰 관련 이벤트
- 회원 라이프사이클 이벤트 (가입, 로그인, 탈퇴)
- 마케팅 관련 이벤트 (쿠폰, 위시리스트, 검색)
- KPI 대시보드 항목 정의
- 이벤트 속성(property) 스키마

## 3. 제외 범위

- 어드민 내부 이벤트 (운영자 행동 추적) → 2차
- 푸시/이메일 CRM 이벤트 → 2차
- A/B 테스트 이벤트 → 2차
- 실시간 알림 이벤트 → 2차
- 분석 툴 선정 및 SDK 구현 세부 → Lua/Yuna 담당

---

## 4. 이벤트 네이밍 규칙

| 규칙 | 설명 |
|------|------|
| 형식 | `snake_case` |
| 구조 | `{object}_{action}` 또는 `{action}_{object}` |
| 언어 | 영어 |
| 접두사 금지 | `track_`, `event_` 같은 불필요한 접두사 사용 안 함 |
| 시점 | 완료 시점 기준 (`purchase` = 결제 완료 시, `add_to_cart` = 장바구니 추가 완료 시) |

---

## 5. 전역 속성 (Global Properties)

모든 이벤트에 자동으로 포함되는 속성. 프론트엔드에서 이벤트 매니저 레벨에서 주입한다.

| 속성 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `event_id` | string (uuid) | 이벤트 고유 ID (중복 제거용) | `"550e8400-e29b..."` |
| `event_timestamp` | string (ISO 8601) | 이벤트 발생 시각 (UTC) | `"2026-04-13T09:30:00Z"` |
| `user_id` | string \| null | 로그인 회원 ID. 비로그인 시 null | `"usr_abc123"` |
| `anonymous_id` | string | 비로그인 식별자 (디바이스/세션 기반) | `"anon_xyz789"` |
| `session_id` | string | 세션 ID | `"sess_def456"` |
| `language` | string (ISO 639-1) | 현재 UI 언어 | `"ko"`, `"en"`, `"ja"`, `"de"` |
| `country` | string (ISO 3166-1 alpha-2) | 사용자 국가 (감지 또는 설정) | `"US"`, `"KR"`, `"JP"`, `"DE"` |
| `currency` | string (ISO 4217) | 현재 표시 통화 | `"USD"`, `"KRW"`, `"JPY"`, `"EUR"` |
| `device_type` | string | 디바이스 유형 | `"mobile"`, `"tablet"`, `"desktop"` |
| `os` | string | 운영체제 | `"iOS"`, `"Android"`, `"Windows"`, `"macOS"` |
| `browser` | string | 브라우저 | `"Chrome"`, `"Safari"`, `"Firefox"` |
| `screen_resolution` | string | 화면 해상도 | `"1920x1080"` |
| `referrer` | string \| null | 유입 referrer URL | `"https://google.com"` |
| `utm_source` | string \| null | UTM source | `"instagram"` |
| `utm_medium` | string \| null | UTM medium | `"paid_social"` |
| `utm_campaign` | string \| null | UTM campaign | `"spring_2026_launch"` |
| `utm_content` | string \| null | UTM content | `"banner_a"` |
| `utm_term` | string \| null | UTM term | `"large_dog_clothes"` |
| `page_url` | string | 현재 페이지 URL | `"/en/products/winter-jacket"` |
| `page_title` | string | 현재 페이지 타이틀 | `"Winter Jacket - RAVI"` |
| `user_type` | string | 사용자 유형 | `"guest"`, `"member"`, `"first_purchase"`, `"returning"` |
| `app_version` | string | 프론트 앱 버전 | `"1.0.0"` |

---

## 6. 이벤트 목록 — 커머스 퍼널

### 6-1. 랜딩/유입

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `landing_view` | 랜딩 페이지 진입 | 랜딩 페이지 로드 완료 | `landing_type`: `"main"` \| `"campaign"` \| `"product"` \| `"collection"`, `campaign_id`: string \| null |
| `home_view` | 홈 화면 진입 | 홈 페이지 로드 완료 | — |

### 6-2. 탐색/발견

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `collection_view` | 컬렉션/카테고리 페이지 진입 | 컬렉션 페이지 로드 완료 | `collection_id`, `collection_name`, `sort_by`, `filter_applied`: object \| null |
| `product_list_view` | 상품 목록 노출 | 목록 렌더링 완료 | `list_name`, `items`: array (상품 요약 배열), `item_count`, `page_number` |
| `product_list_item_click` | 상품 목록에서 상품 클릭 | 상품 카드 클릭 | `product_id`, `product_name`, `position`, `list_name`, `price`, `category` |
| `search_submit` | 검색 실행 | 검색 제출 | `search_query`, `search_type`: `"keyword"` \| `"filter"` |
| `search_result_view` | 검색 결과 노출 | 검색 결과 렌더링 | `search_query`, `result_count`, `items`: array |
| `search_result_click` | 검색 결과 상품 클릭 | 결과 내 상품 클릭 | `search_query`, `product_id`, `position` |
| `filter_apply` | 필터 적용 | 필터 변경 적용 | `filter_type`, `filter_value`, `list_name` |
| `sort_change` | 정렬 변경 | 정렬 기준 변경 | `sort_by`, `list_name` |

### 6-3. 상품 상세

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `product_detail_view` | 상품 상세 진입 | 상세 페이지 로드 완료 | `product_id`, `product_name`, `category`, `subcategory`, `price`, `original_price`, `discount_rate`, `brand`, `in_stock`, `size_options`: array, `community_inflow`: boolean |
| `size_guide_view` | 사이즈 가이드 열기 | 사이즈 가이드 모달/섹션 노출 | `product_id`, `guide_type`: `"chart"` \| `"measure"` \| `"fit_photo"` |
| `product_image_view` | 상품 이미지 확대/스와이프 | 이미지 인터랙션 | `product_id`, `image_index`, `image_type`: `"main"` \| `"detail"` \| `"fit"` |
| `product_review_section_view` | 리뷰 섹션 노출 | 리뷰 영역 뷰포트 진입 | `product_id`, `review_count`, `average_rating` |
| `product_option_select` | 옵션 선택 | 사이즈/색상 선택 | `product_id`, `option_type`: `"size"` \| `"color"`, `option_value` |

### 6-4. 장바구니

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `add_to_cart` | 장바구니 추가 | 장바구니 추가 완료 | `product_id`, `product_name`, `category`, `size`, `color`, `quantity`, `price`, `currency`, `community_inflow`: boolean |
| `remove_from_cart` | 장바구니 삭제 | 장바구니 항목 삭제 | `product_id`, `size`, `color`, `quantity`, `price` |
| `cart_view` | 장바구니 조회 | 장바구니 페이지/패널 열기 | `items`: array, `item_count`, `cart_total`, `currency` |
| `cart_quantity_change` | 수량 변경 | 수량 +/- | `product_id`, `size`, `previous_quantity`, `new_quantity` |

### 6-5. 체크아웃

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `begin_checkout` | 체크아웃 시작 | 체크아웃 페이지 진입 | `items`: array, `item_count`, `cart_total`, `currency`, `coupon_code`: string \| null |
| `add_shipping_info` | 배송 정보 입력 | 배송 정보 입력 완료 | `shipping_country`, `shipping_method`, `shipping_cost`, `estimated_delivery_days` |
| `add_payment_info` | 결제 정보 입력 | 결제 수단 선택/입력 완료 | `payment_method`: `"card"` \| `"kakao_pay"` \| `"naver_pay"` \| `"klarna"` \| `"toss"` |
| `coupon_apply` | 쿠폰 적용 | 쿠폰 코드 적용 성공 | `coupon_code`, `coupon_type`: `"percent"` \| `"fixed"`, `discount_amount`, `coupon_name` |
| `coupon_apply_fail` | 쿠폰 적용 실패 | 쿠폰 적용 실패 | `coupon_code`, `fail_reason`: `"expired"` \| `"invalid"` \| `"min_order"` \| `"already_used"` |
| `point_use` | 포인트 사용 | 포인트 사용 입력 | `points_used`, `points_value`, `currency` |
| `purchase` | 구매 완료 | 결제 완료 확인 | 아래 별도 정의 |
| `checkout_abandon` | 체크아웃 이탈 | 체크아웃 중 페이지 이탈 | `abandon_step`: `"shipping"` \| `"payment"` \| `"review"`, `cart_total`, `item_count` |

### 6-6. `purchase` 이벤트 상세 스키마

구매 완료는 가장 중요한 이벤트이므로 속성을 별도 정의한다.

```json
{
  "event": "purchase",
  "properties": {
    "order_id": "string — 주문 고유 ID",
    "transaction_id": "string — 결제 트랜잭션 ID",
    "total": "number — 최종 결제 금액",
    "subtotal": "number — 할인 전 금액",
    "shipping_cost": "number — 배송비",
    "tax": "number — 세금",
    "discount_total": "number — 총 할인 금액",
    "currency": "string — ISO 4217",
    "payment_method": "string",
    "coupon_code": "string | null",
    "coupon_discount": "number",
    "points_used": "number",
    "points_discount": "number",
    "item_count": "number",
    "items": [
      {
        "product_id": "string",
        "product_name": "string",
        "category": "string",
        "subcategory": "string",
        "size": "string",
        "color": "string",
        "quantity": "number",
        "price": "number",
        "original_price": "number",
        "discount_rate": "number"
      }
    ],
    "first_purchase": "boolean — 첫 구매 여부",
    "community_inflow": "boolean — 커뮤니티 경유 여부",
    "shipping_country": "string — ISO 3166-1 alpha-2",
    "shipping_method": "string"
  }
}
```

---

## 7. 이벤트 목록 — 회원 라이프사이클

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `signup_start` | 회원가입 시작 | 회원가입 폼 진입 | `signup_method`: `"email"` \| `"google"` \| `"kakao"` \| `"apple"` |
| `signup_complete` | 회원가입 완료 | 가입 완료 | `signup_method`, `referral_code`: string \| null |
| `login_complete` | 로그인 완료 | 로그인 성공 | `login_method`: `"email"` \| `"google"` \| `"kakao"` \| `"apple"` |
| `logout` | 로그아웃 | 로그아웃 실행 | — |
| `profile_update` | 프로필 수정 | 프로필 저장 | `updated_fields`: array (예: `["name", "phone", "pet_info"]`) |
| `pet_profile_create` | 반려견 프로필 생성 | 반려견 정보 저장 | `breed`, `weight_kg`, `size_category`: `"medium"` \| `"large"` \| `"xlarge"` |
| `account_delete` | 회원 탈퇴 | 탈퇴 완료 | `delete_reason`: string \| null |

---

## 8. 이벤트 목록 — 찜/위시리스트

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `wishlist_add` | 찜하기 | 찜 버튼 클릭 | `product_id`, `product_name`, `category`, `price`, `source_page`: `"list"` \| `"detail"` \| `"community"` |
| `wishlist_remove` | 찜 해제 | 찜 해제 클릭 | `product_id` |
| `wishlist_view` | 찜 목록 조회 | 찜 목록 페이지 진입 | `item_count` |

---

## 9. 이벤트 목록 — 리뷰/커뮤니티

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `review_create` | 리뷰 작성 완료 | 리뷰 제출 | `product_id`, `rating`, `has_photo`: boolean, `has_size_info`: boolean, `review_length`: number |
| `review_view` | 리뷰 상세 조회 | 개별 리뷰 클릭/확장 | `product_id`, `review_id`, `rating` |
| `review_helpful` | 리뷰 도움됨 | 도움됨 버튼 클릭 | `review_id`, `product_id` |
| `community_post_create` | 커뮤니티 게시물 작성 | 게시물 제출 | `post_type`: `"photo"` \| `"question"` \| `"tip"`, `has_product_tag`: boolean, `tagged_product_ids`: array |
| `community_post_view` | 커뮤니티 게시물 조회 | 게시물 상세 진입 | `post_id`, `post_type`, `has_product_tag`: boolean |
| `community_post_like` | 게시물 좋아요 | 좋아요 클릭 | `post_id` |
| `community_comment_create` | 댓글 작성 | 댓글 제출 | `post_id`, `comment_length`: number |
| `community_to_product` | 커뮤니티→상품 이동 | 게시물 내 상품 태그/링크 클릭 | `post_id`, `product_id`, `click_source`: `"tag"` \| `"link"` \| `"review"` |
| `community_feed_view` | 커뮤니티 피드 진입 | 피드 페이지 로드 | `feed_type`: `"all"` \| `"popular"` \| `"following"` |

---

## 10. 이벤트 목록 — 주문 후/기타

| 이벤트 | 설명 | 발화 시점 | 고유 속성 |
|--------|------|-----------|-----------|
| `order_detail_view` | 주문 상세 조회 | 주문 상세 페이지 진입 | `order_id`, `order_status` |
| `order_cancel_request` | 주문 취소 요청 | 취소 요청 제출 | `order_id`, `cancel_reason` |
| `refund_request` | 환불 요청 | 환불 요청 제출 | `order_id`, `refund_reason`, `refund_items`: array |
| `share` | 공유하기 | 공유 버튼 클릭 | `share_type`: `"product"` \| `"post"` \| `"review"`, `share_method`: `"link"` \| `"kakao"` \| `"twitter"` \| `"facebook"`, `content_id` |
| `newsletter_subscribe` | 뉴스레터 구독 | 이메일 구독 제출 | `subscribe_source`: `"footer"` \| `"popup"` \| `"checkout"` |
| `language_change` | 언어 변경 | 언어 셀렉터 변경 | `from_language`, `to_language` |
| `currency_change` | 통화 변경 | 통화 변경 | `from_currency`, `to_currency` |
| `error_view` | 에러 페이지 노출 | 에러 페이지 렌더링 | `error_type`: `"404"` \| `"500"` \| `"network"`, `error_page_url` |

---

## 11. `community_inflow` 판정 기준

커뮤니티가 구매 전환에 미치는 영향을 측정하기 위한 핵심 속성이다.

### 정의
`community_inflow = true`: 현재 세션에서 커뮤니티 게시물/리뷰를 경유하여 상품 상세에 도달한 경우

### 판정 로직

```
1. 사용자가 community_post_view 또는 community_to_product 이벤트를 발생시킴
2. 해당 세션 내에서 product_detail_view가 발생하면 community_inflow = true
3. 이후 add_to_cart, purchase까지 community_inflow = true 유지
4. 새 세션 시작 시 초기화
```

### 측정 목적
- 커뮤니티 → 상품 전환율
- 커뮤니티 경유 구매의 AOV(평균 주문금액) 비교
- 커뮤니티 투자 대비 매출 기여도 정량화

---

## 12. `first_purchase` 판정 기준

| 조건 | 값 |
|------|-----|
| 해당 `user_id`로 과거 `purchase` 이벤트가 0건 | `true` |
| 해당 `user_id`로 과거 `purchase` 이벤트가 1건 이상 | `false` |
| 비로그인(guest) 구매 | `false` (판정 불가) |

> 백엔드에서 주문 생성 시 서버사이드로 판정하여 프론트에 전달. 클라이언트 단독 판정 금지.

---

## 13. KPI 대시보드 정의

### 13-1. 핵심 비즈니스 KPI

| KPI | 정의 | 계산 | 주기 | 세분화 기준 |
|-----|------|------|------|-------------|
| **GMV** (총 거래액) | 총 결제 완료 금액 | SUM(`purchase.total`) | 일/주/월 | country, currency, category |
| **주문 수** | 결제 완료 주문 건수 | COUNT(`purchase`) | 일/주/월 | country, first_purchase |
| **AOV** (평균 주문금액) | 건당 평균 결제금액 | GMV / 주문 수 | 주/월 | country, community_inflow |
| **구매 전환율** | 방문자 대비 구매자 비율 | 구매 유저 / 전체 세션 유저 | 주/월 | country, device_type, utm_source |
| **신규 회원 수** | 가입 완료 수 | COUNT(`signup_complete`) | 일/주/월 | signup_method, country |
| **첫 구매 전환율** | 가입 후 첫 구매 비율 | first_purchase 유저 / signup 유저 | 주/월 | signup_method, country |
| **재구매율** | 2회 이상 구매 유저 비율 | 재구매 유저 / 전체 구매 유저 | 월 | country |

### 13-2. 퍼널 KPI

| KPI | 정의 | 계산 |
|-----|------|------|
| **Landing → Home 전환율** | 랜딩 → 홈 | home_view 세션 / landing_view 세션 |
| **Home → Product List 전환율** | 홈 → 상품 목록 | product_list_view 세션 / home_view 세션 |
| **Product List → Detail 전환율** | 목록 → 상세 | product_detail_view 세션 / product_list_view 세션 |
| **Detail → Cart 전환율** | 상세 → 장바구니 | add_to_cart 세션 / product_detail_view 세션 |
| **Cart → Checkout 전환율** | 장바구니 → 체크아웃 시작 | begin_checkout 세션 / cart_view 세션 |
| **Checkout → Purchase 전환율** | 체크아웃 → 구매 | purchase 세션 / begin_checkout 세션 |
| **전체 퍼널 전환율** | 랜딩 → 구매 | purchase 세션 / landing_view 세션 |
| **체크아웃 이탈 단계 분포** | 이탈 발생 단계별 비율 | abandon_step별 COUNT |

### 13-3. 마케팅/유입 KPI

| KPI | 정의 | 세분화 기준 |
|-----|------|-------------|
| **유입 채널별 세션** | 채널별 방문 수 | utm_source, utm_medium |
| **유입 채널별 전환율** | 채널별 구매 전환 | utm_source, utm_medium, utm_campaign |
| **유입 채널별 AOV** | 채널별 평균 주문금액 | utm_source |
| **쿠폰 사용률** | 구매 중 쿠폰 적용 비율 | coupon_code, coupon_type |
| **쿠폰별 매출 기여** | 쿠폰별 GMV 기여 | coupon_code |
| **포인트 사용률** | 구매 중 포인트 사용 비율 | — |
| **캠페인별 ROI** | 캠페인별 매출/비용 | utm_campaign |

### 13-4. 커뮤니티 KPI

| KPI | 정의 | 계산 |
|-----|------|------|
| **커뮤니티→상품 전환율** | 커뮤니티 경유 상세 진입 비율 | community_to_product / community_post_view |
| **커뮤니티 경유 구매율** | 커뮤니티 inflow 구매 비율 | community_inflow purchase / 전체 purchase |
| **커뮤니티 경유 AOV** | 커뮤니티 경유 구매의 평균 주문금액 | community_inflow AOV vs non-inflow AOV |
| **게시물 생성 수** | 일별 게시물 수 | COUNT(`community_post_create`) |
| **리뷰 작성률** | 구매 대비 리뷰 작성 비율 | review_create / purchase |
| **포토 리뷰 비율** | 전체 리뷰 중 포토 리뷰 | has_photo review / 전체 review |

### 13-5. 상품 KPI

| KPI | 정의 | 세분화 기준 |
|-----|------|-------------|
| **상품별 조회수** | 상품 상세 조회 수 | product_id, category |
| **상품별 장바구니 추가율** | 상세 조회 대비 장바구니 추가 | product_id |
| **상품별 구매 전환율** | 상세 조회 대비 구매 | product_id |
| **사이즈 가이드 조회율** | 상세 진입 대비 가이드 열기 비율 | product_id, guide_type |
| **찜 수** | 상품별 찜 수 | product_id |
| **카테고리별 GMV** | 카테고리별 매출 | category, subcategory |

### 13-6. 국가별 KPI (글로벌 운영)

| KPI | 세분화 기준 |
|-----|-------------|
| **국가별 GMV** | country |
| **국가별 전환율** | country |
| **국가별 AOV** | country, currency |
| **국가별 신규 가입** | country |
| **국가별 인기 카테고리** | country, category |
| **국가별 사이즈 분포** | country, size |
| **언어 변경 빈도** | from_language, to_language |

---

## 14. 이벤트 수집 아키텍처 (권장 방향)

```
[Browser]
  ├── 프론트엔드 이벤트 매니저 (글로벌 속성 자동 주입)
  │     ├── GA4 / Amplitude / Mixpanel (클라이언트 SDK)
  │     └── 서버 전송 (필요 시)
  │
[Server]
  ├── 서버사이드 이벤트 (purchase, signup_complete 등 신뢰성 필수 이벤트)
  │     ├── 이벤트 로그 테이블 (DB)
  │     └── 분석 툴 서버 API
  │
[Admin Dashboard]
  └── KPI 대시보드 (어드민 내 또는 별도 BI 툴)
```

### 클라이언트 vs 서버사이드 이벤트 구분

| 구분 | 이벤트 | 이유 |
|------|--------|------|
| **서버사이드 필수** | `purchase`, `signup_complete`, `coupon_apply`, `point_use`, `refund_request` | 결제/금액/포인트 관련 — 클라이언트 조작 방지, 정합성 보장 |
| **클라이언트 + 서버 이중** | `purchase` (클라이언트로 GA4 전송 + 서버로 정합성 보장) | 마케팅 픽셀과 내부 데이터 모두 필요 |
| **클라이언트만** | 나머지 모든 이벤트 | 사용자 행동 추적 목적, 서버 부하 최소화 |

---

## 15. 정책

| 항목 | 정책 |
|------|------|
| 이벤트 네이밍 | `snake_case`, 영어, `{object}_{action}` |
| 전역 속성 | 모든 이벤트에 자동 주입 (이벤트 매니저 레벨) |
| 금액 속성 | 항상 해당 통화 기준 숫자값. 통화는 `currency` 속성으로 분리 |
| 배열 속성 | `items` 배열은 최대 20개까지. 초과 시 상위 20개만 전송 |
| null 처리 | 값이 없으면 `null`. 빈 문자열(`""`) 사용 금지 |
| PII | 이름, 이메일, 전화번호, 주소 등 개인정보는 이벤트 속성에 포함 금지 |
| `first_purchase` | 서버사이드 판정만 허용 |
| `community_inflow` | 세션 단위, 클라이언트에서 세션 상태로 관리 |

---

## 16. 리스크

| 리스크 | 수준 | 대응 |
|--------|------|------|
| 이벤트 누락 (프론트 구현 시 빠뜨림) | 높 | 이벤트 체크리스트 + QA 항목으로 검증. Yuna에게 이벤트 구현 가이드 배분 |
| 이벤트 속성 불일치 (프론트↔서버 스키마 다름) | 중 | `packages/types`에 이벤트 타입 정의 공유 |
| GDPR 쿠키 동의 전 이벤트 발화 | 높 | 독일/EU 유저는 쿠키 동의 후에만 분석 이벤트 발화. 필수 이벤트(서버사이드)는 동의 불필요 |
| 분석 툴 미선정 | 중 | REQUEST_USER:analytics:GA4 vs Amplitude vs Mixpanel 중 선호하는 분석 툴 결정 필요 |
| 이벤트 볼륨 과다 시 비용 | 중 | MVP에서는 핵심 이벤트만 활성화, 2차에서 세부 이벤트 추가 |

---

## 17. 다음 작업

1. **REQUEST_USER:analytics** — 분석 툴 선정 (GA4 / Amplitude / Mixpanel)
2. **Lua** — 이 문서 기반으로 분석 툴별 구현 가이드 작성
3. **Yuna** — 프론트엔드 이벤트 매니저 모듈 설계 (글로벌 속성 자동 주입 + 이벤트 발화 헬퍼)
4. **Politis** — 서버사이드 필수 이벤트 스키마를 DB 이벤트 로그 테이블에 반영
5. **Politis** — `packages/types`에 이벤트 타입 정의 추가
6. **Vivian** — KPI 대시보드 UI를 어드민 대시보드에 반영

---

## 부록 A. MVP 이벤트 우선순위

MVP에서 반드시 구현해야 하는 이벤트 (★)와 2차에서 추가할 이벤트 (☆)를 구분한다.

### ★ MVP 필수 (27개)

**퍼널 핵심 (11개)**
`landing_view`, `home_view`, `collection_view`, `product_list_view`, `product_detail_view`, `add_to_cart`, `cart_view`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`

**회원 (3개)**
`signup_complete`, `login_complete`, `pet_profile_create`

**전환 보조 (7개)**
`size_guide_view`, `search_submit`, `search_result_view`, `wishlist_add`, `coupon_apply`, `point_use`, `review_create`

**커뮤니티 전환 (4개)**
`community_post_view`, `community_to_product`, `community_post_create`, `community_feed_view`

**이탈/에러 (2개)**
`checkout_abandon`, `error_view`

### ☆ 2차 추가 (나머지)

`product_list_item_click`, `search_result_click`, `filter_apply`, `sort_change`, `product_image_view`, `product_review_section_view`, `product_option_select`, `remove_from_cart`, `cart_quantity_change`, `coupon_apply_fail`, `signup_start`, `logout`, `profile_update`, `account_delete`, `wishlist_remove`, `wishlist_view`, `review_view`, `review_helpful`, `community_post_like`, `community_comment_create`, `order_detail_view`, `order_cancel_request`, `refund_request`, `share`, `newsletter_subscribe`, `language_change`, `currency_change`
