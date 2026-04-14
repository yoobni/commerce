# 전체 도메인 모델 설계

> 작성: Iseria (planner)
> 최종 수정: 2026-04-13
> 상태: 1차 확정 — 팀 리뷰 후 반영

---

## 1. 목표

커머스·커뮤니티·어드민을 **하나의 정책 시스템**으로 연결하는 도메인 모델을 정의한다.
각 엔티티의 필드, 상태 전이, 권한 모델, 도메인 간 연결 관계를 명시하여 백엔드(Politis)가 바로 구현 가능한 수준으로 제공한다.

## 2. 포함 범위

- 회원(User), 주소(Address)
- 상품(Product), 옵션(ProductOption), 사이즈(Size), 카테고리(Category)
- 장바구니(Cart/CartItem)
- 주문(Order/OrderItem), 결제(Payment)
- 쿠폰(Coupon/CouponIssuance), 포인트(Point/PointTransaction)
- 배송(Shipment), 발주(SupplyOrder)
- 커뮤니티(Post/Comment), 신고(Report), 제재(Sanction)
- 관리자(Admin), 권한(Role/Permission)
- 감사 로그(AuditLog), 이벤트 로그(EventLog)
- 찜(Wishlist), 리뷰(Review)
- 국가/통화/배송 설정(CountryConfig)

## 3. 제외 범위 (MVP 이후)

- 정기구독(Subscription)
- 멤버십 등급제
- 포인트몰
- 1:1 채팅/메시지
- 판매자(Seller) 다중화 — MVP는 자사 단일 판매자
- 세금 자동계산 엔진 연동
- 편의점 결제(konbini)

---

## 4. 엔티티 정의

### 4.1 회원 (User)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | string | 고유, 로그인 식별자 |
| password_hash | string | Supabase Auth 위임 |
| name | string | 표시 이름 |
| phone | string? | 선택 |
| locale | enum | ko, en, ja, de |
| country | enum | KR, US, JP, DE |
| currency | enum | KRW, USD, JPY, EUR |
| profile_image_url | string? | |
| marketing_agreed | boolean | 마케팅 수신 동의 |
| status | enum | 아래 상태값 |
| provider | enum | email, google, apple, kakao |
| last_login_at | timestamp? | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp? | soft delete |

**상태 전이:**

```
ACTIVE ──→ SUSPENDED (관리자 제재)
  │              │
  │              └──→ ACTIVE (제재 해제)
  │
  └──→ WITHDRAWN (본인 탈퇴)
         │
         └──→ [30일 후 개인정보 파기]
```

| 상태 | 설명 |
|------|------|
| ACTIVE | 정상 |
| SUSPENDED | 정지 (제재) |
| WITHDRAWN | 탈퇴 (soft delete, 30일 보관 후 파기) |

---

### 4.2 주소 (Address)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| label | string? | "집", "회사" 등 |
| recipient_name | string | 수령인 |
| phone | string | |
| country | enum | KR, US, JP, DE |
| postal_code | string | |
| state_province | string? | 주/도 (미국 필수) |
| city | string | |
| address_line1 | string | |
| address_line2 | string? | |
| is_default | boolean | |
| created_at | timestamp | |

---

### 4.3 카테고리 (Category)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| parent_id | UUID? | FK → Category (2depth까지) |
| slug | string | URL용, 고유 |
| name_ko | string | |
| name_en | string | |
| name_ja | string | |
| name_de | string | |
| sort_order | int | 정렬 순서 |
| is_active | boolean | |
| created_at | timestamp | |

> MVP 카테고리 예시: 아우터 / 상의 / 하의 / 올인원 / 레인코트 / 액세서리

---

### 4.4 상품 (Product)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| category_id | UUID | FK → Category |
| slug | string | URL용, 고유 |
| name_ko | string | |
| name_en | string | |
| name_ja | string | |
| name_de | string | |
| description_ko | text | |
| description_en | text | |
| description_ja | text | |
| description_de | text | |
| base_price_krw | int | 기준가 (원화) |
| base_price_usd | decimal | |
| base_price_jpy | int | |
| base_price_eur | decimal | |
| material | string? | 소재 |
| care_instruction | string? | 세탁 방법 |
| weight_g | int? | 상품 무게 |
| thumbnail_url | string | 대표 이미지 |
| images | jsonb | 이미지 URL 배열 |
| status | enum | 아래 상태값 |
| is_featured | boolean | 추천 상품 여부 |
| view_count | int | 조회수 |
| review_count | int | 리뷰수 (캐시) |
| review_avg_rating | decimal | 평균 평점 (캐시) |
| published_at | timestamp? | 공개 시점 |
| created_at | timestamp | |
| updated_at | timestamp | |

**상태 전이:**

```
DRAFT ──→ ACTIVE ──→ SOLD_OUT
  │          │           │
  │          │           └──→ ACTIVE (재입고)
  │          │
  │          └──→ HIDDEN (일시 비공개)
  │                  │
  │                  └──→ ACTIVE
  │
  └──→ DISCONTINUED (영구 단종)
```

| 상태 | 설명 |
|------|------|
| DRAFT | 작성 중, 고객 비공개 |
| ACTIVE | 판매 중 |
| SOLD_OUT | 품절 (전 옵션 재고 0) |
| HIDDEN | 일시 비공개 (관리자) |
| DISCONTINUED | 단종 (영구) |

---

### 4.5 상품 옵션 (ProductOption)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| product_id | UUID | FK → Product |
| size_id | UUID | FK → Size |
| color | string | 색상명 |
| color_hex | string? | 색상코드 |
| sku | string | 재고관리코드, 고유 |
| additional_price_krw | int | 추가금 (기본 0) |
| additional_price_usd | decimal | |
| additional_price_jpy | int | |
| additional_price_eur | decimal | |
| stock | int | 현재 재고 |
| low_stock_threshold | int | 재고 부족 알림 기준 (기본 5) |
| is_active | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

> 상품 최종 가격 = Product.base_price + ProductOption.additional_price

---

### 4.6 사이즈 (Size)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| label | string | S, M, L, XL, 2XL, 3XL |
| chest_cm_min | int | 가슴둘레 최소 |
| chest_cm_max | int | 가슴둘레 최대 |
| back_length_cm_min | int | 등길이 최소 |
| back_length_cm_max | int | 등길이 최대 |
| neck_cm_min | int | 목둘레 최소 |
| neck_cm_max | int | 목둘레 최대 |
| weight_kg_min | decimal | 체중 최소 |
| weight_kg_max | decimal | 체중 최대 |
| breed_examples | jsonb | 대표 견종 예시 ["골든리트리버", "래브라도"] |
| sort_order | int | |
| created_at | timestamp | |

> 대형견 특화: 사이즈 가이드가 구매 전환의 핵심. 견종별 추천 사이즈 매핑 필수.

---

### 4.7 장바구니 (Cart / CartItem)

**Cart**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID? | FK → User (비회원은 null, 세션 기반) |
| session_id | string? | 비회원 장바구니 식별 |
| currency | enum | |
| created_at | timestamp | |
| updated_at | timestamp | |

**CartItem**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| cart_id | UUID | FK → Cart |
| product_option_id | UUID | FK → ProductOption |
| quantity | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

> 비회원 → 로그인 시 세션 장바구니를 회원 장바구니에 병합.

---

### 4.8 주문 (Order / OrderItem)

**Order**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| order_number | string | 고유 주문번호 (표시용, 예: RV-20260413-XXXX) |
| user_id | UUID | FK → User |
| address_id | UUID | FK → Address (스냅샷 저장) |
| shipping_address_snapshot | jsonb | 주문 시점 배송지 스냅샷 |
| currency | enum | 주문 시점 통화 |
| subtotal | decimal | 상품 합계 |
| shipping_fee | decimal | 배송비 |
| discount_amount | decimal | 할인 합계 (쿠폰+포인트) |
| tax_amount | decimal | 세금 |
| total_amount | decimal | 최종 결제금액 |
| coupon_issuance_id | UUID? | FK → CouponIssuance |
| point_used | int | 사용 포인트 |
| status | enum | 아래 상태값 |
| memo | text? | 배송 메모 |
| admin_memo | text? | 관리자 내부 메모 |
| ordered_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

**OrderItem**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| order_id | UUID | FK → Order |
| product_option_id | UUID | FK → ProductOption |
| product_snapshot | jsonb | 주문 시점 상품 정보 스냅샷 |
| quantity | int | |
| unit_price | decimal | 단가 (주문 시점) |
| total_price | decimal | 수량 × 단가 |
| status | enum | 개별 아이템 상태 |
| created_at | timestamp | |

**주문 상태 전이:**

```
PENDING_PAYMENT ──→ PAID ──→ PREPARING ──→ SHIPPED ──→ DELIVERED ──→ CONFIRMED
       │               │          │             │            │
       │               │          │             │            └──→ RETURN_REQUESTED ──→ RETURNED
       │               │          │             │
       │               │          │             └──→ DELIVERY_FAILED
       │               │          │
       │               │          └──→ CANCELLED (관리자/사용자, 발송 전)
       │               │
       │               └──→ REFUND_REQUESTED ──→ REFUNDED
       │
       └──→ CANCELLED (미결제 취소, 30분 타임아웃)
```

| 상태 | 설명 | 트리거 |
|------|------|--------|
| PENDING_PAYMENT | 결제 대기 | 주문 생성 |
| PAID | 결제 완료 | 결제 성공 webhook |
| PREPARING | 상품 준비 중 | 관리자 확인 |
| SHIPPED | 발송 완료 | 운송장 입력 |
| DELIVERED | 배송 완료 | 배송사 webhook / 관리자 수동 |
| CONFIRMED | 구매 확정 | 사용자 확정 또는 배송 완료 7일 후 자동 |
| RETURN_REQUESTED | 반품 요청 | 사용자 요청 (배송 완료 후 7~14일 이내) |
| RETURNED | 반품 완료 | 관리자 확인 후 환불 처리 |
| REFUND_REQUESTED | 환불 요청 | 사용자 요청 (발송 전) |
| REFUNDED | 환불 완료 | 관리자 승인 + 결제 취소 |
| CANCELLED | 주문 취소 | 미결제 타임아웃 / 사용자 취소 / 관리자 취소 |
| DELIVERY_FAILED | 배송 실패 | 배송사 반송 |

> 정책: 구매 확정 시 포인트 적립. 반품은 국가별 법적 기간 준수 (한국 7일, 독일 14일).

---

### 4.9 결제 (Payment)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| order_id | UUID | FK → Order |
| payment_key | string | PG사 결제 키 |
| method | enum | CARD, KAKAO_PAY, NAVER_PAY, TOSS_PAY, STRIPE, KLARNA |
| provider | enum | STRIPE, TOSS_PAYMENTS |
| currency | enum | |
| amount | decimal | 결제 금액 |
| status | enum | 아래 상태값 |
| paid_at | timestamp? | |
| failed_at | timestamp? | |
| cancelled_at | timestamp? | |
| refund_amount | decimal? | 환불 금액 |
| refunded_at | timestamp? | |
| pg_response | jsonb | PG 응답 원본 저장 |
| created_at | timestamp | |
| updated_at | timestamp | |

**결제 상태:**

```
PENDING ──→ PAID ──→ PARTIALLY_REFUNDED
   │                    │
   │                    └──→ FULLY_REFUNDED
   │
   └──→ FAILED
   │
   └──→ CANCELLED
```

| 상태 | 설명 |
|------|------|
| PENDING | 결제 진행 중 |
| PAID | 결제 완료 |
| FAILED | 결제 실패 |
| CANCELLED | 결제 취소 |
| PARTIALLY_REFUNDED | 부분 환불 |
| FULLY_REFUNDED | 전액 환불 |

---

### 4.10 쿠폰 (Coupon / CouponIssuance)

**Coupon (쿠폰 정책)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| code | string | 쿠폰 코드 (고유) |
| name_ko | string | |
| name_en | string | |
| name_ja | string | |
| name_de | string | |
| type | enum | FIXED_AMOUNT, PERCENTAGE |
| discount_value | decimal | 할인값 (금액 또는 %) |
| max_discount_amount | decimal? | 최대 할인 상한 (% 쿠폰용) |
| min_order_amount | decimal? | 최소 주문금액 조건 |
| currency | enum? | FIXED_AMOUNT 쿠폰 시 통화 지정 |
| applicable_category_ids | jsonb? | 적용 가능 카테고리 (null=전체) |
| applicable_product_ids | jsonb? | 적용 가능 상품 (null=전체) |
| max_issuance_count | int? | 최대 발급 수 (null=무제한) |
| max_use_per_user | int | 1인당 사용 횟수 (기본 1) |
| is_combinable | boolean | 다른 쿠폰과 중복 사용 가능 여부 (MVP: false) |
| status | enum | ACTIVE, PAUSED, EXPIRED, DEPLETED |
| starts_at | timestamp | 유효 시작 |
| expires_at | timestamp | 유효 종료 |
| created_by | UUID | FK → Admin |
| created_at | timestamp | |
| updated_at | timestamp | |

**CouponIssuance (쿠폰 발급 내역)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| coupon_id | UUID | FK → Coupon |
| user_id | UUID | FK → User |
| status | enum | ISSUED, USED, EXPIRED, REVOKED |
| used_at | timestamp? | 사용 시점 |
| used_order_id | UUID? | FK → Order |
| issued_at | timestamp | |
| expires_at | timestamp | 개별 만료일 |

**쿠폰 정책:**

| 정책 | MVP 기준 |
|------|----------|
| 중복 사용 | 불가 — 주문당 쿠폰 1개 |
| 포인트+쿠폰 동시 사용 | 허용 |
| 발급 방식 | 관리자 수동 발급 / 코드 입력 / 자동 발급(가입 축하 등) |
| 만료 | 개별 만료일 기준, 배치로 만료 처리 |
| 환불 시 | 미사용 처리로 복원 |

---

### 4.11 포인트 (Point / PointTransaction)

**Point (사용자 포인트 잔액)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User, UNIQUE |
| balance | int | 현재 잔액 |
| total_earned | int | 총 적립 |
| total_used | int | 총 사용 |
| total_expired | int | 총 만료 |
| updated_at | timestamp | |

**PointTransaction (포인트 이력)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| type | enum | EARN, USE, EXPIRE, CANCEL_EARN, CANCEL_USE, ADMIN_GRANT, ADMIN_DEDUCT |
| amount | int | 변동량 (양수) |
| balance_after | int | 변동 후 잔액 |
| reason | string | 사유 |
| reference_type | enum? | ORDER, REVIEW, SIGNUP, ADMIN, EVENT |
| reference_id | UUID? | 관련 주문/리뷰 등 ID |
| expires_at | timestamp? | 만료일 (적립 건) |
| created_by | UUID? | 관리자 지급/차감 시 |
| created_at | timestamp | |

**포인트 정책:**

| 정책 | MVP 기준 |
|------|----------|
| 적립률 | 구매 확정 시 결제금액의 1% |
| 적립 단위 | 원 단위 (해외: 해당 통화 최소 단위) |
| 만료 | 적립일로부터 12개월 |
| 최소 사용 | 1,000P 이상 보유 시 사용 가능 |
| 최대 사용 | 주문금액의 최대 30% |
| 환불 시 | 사용 포인트 복원 + 적립 포인트 회수 |
| 관리자 | 수동 지급/차감 가능 (사유 필수) |
| 만료 배치 | 매일 00:00 만료 대상 처리 |

---

### 4.12 배송 (Shipment)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| order_id | UUID | FK → Order |
| carrier | enum | CJ, HANJIN, LOGEN, EMS, DHL, FEDEX, UPS, USPS, YAMATO, SAGAWA |
| tracking_number | string | 운송장 번호 |
| country | enum | 배송 대상 국가 |
| status | enum | 아래 상태값 |
| shipped_at | timestamp? | 발송일 |
| delivered_at | timestamp? | 배달 완료일 |
| estimated_delivery_at | timestamp? | 예상 배달일 |
| return_tracking_number | string? | 반품 운송장 |
| created_at | timestamp | |
| updated_at | timestamp | |

**배송 상태:**

```
PENDING ──→ PICKED_UP ──→ IN_TRANSIT ──→ OUT_FOR_DELIVERY ──→ DELIVERED
                                │                                  │
                                └──→ CUSTOMS_HELD                  └──→ RETURNED
                                        │
                                        └──→ IN_TRANSIT
```

| 상태 | 설명 |
|------|------|
| PENDING | 발송 대기 |
| PICKED_UP | 수거 완료 |
| IN_TRANSIT | 배송 중 |
| CUSTOMS_HELD | 통관 중 (국제배송) |
| OUT_FOR_DELIVERY | 배달 중 |
| DELIVERED | 배달 완료 |
| RETURNED | 반송 |

---

### 4.13 발주 (SupplyOrder)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| supply_order_number | string | 발주번호 |
| product_option_id | UUID | FK → ProductOption |
| quantity | int | 발주 수량 |
| unit_cost | decimal | 단가 |
| total_cost | decimal | |
| status | enum | REQUESTED, CONFIRMED, SHIPPED, RECEIVED, CANCELLED |
| supplier_name | string | 공급처 |
| expected_at | timestamp? | 입고 예정일 |
| received_at | timestamp? | 실제 입고일 |
| memo | text? | |
| created_by | UUID | FK → Admin |
| created_at | timestamp | |
| updated_at | timestamp | |

**발주 상태:**

```
REQUESTED ──→ CONFIRMED ──→ SHIPPED ──→ RECEIVED
     │
     └──→ CANCELLED
```

---

### 4.14 찜 (Wishlist)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| product_id | UUID | FK → Product |
| created_at | timestamp | |

> UNIQUE(user_id, product_id)

---

### 4.15 리뷰 (Review)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| product_id | UUID | FK → Product |
| order_item_id | UUID | FK → OrderItem |
| rating | int | 1~5 |
| content | text | |
| images | jsonb? | 이미지 URL 배열 (최대 5장) |
| dog_weight_kg | decimal? | 착용견 체중 |
| dog_breed | string? | 착용견 견종 |
| purchased_size | string | 구매 사이즈 |
| size_feedback | enum | SMALL, PERFECT, LARGE |
| is_photo_review | boolean | 사진 포함 여부 |
| is_best | boolean | 베스트 리뷰 선정 (관리자) |
| status | enum | ACTIVE, HIDDEN, DELETED |
| point_rewarded | boolean | 포인트 지급 완료 여부 |
| created_at | timestamp | |
| updated_at | timestamp | |

> 대형견 특화: `dog_weight_kg`, `dog_breed`, `size_feedback`는 다른 보호자의 사이즈 선택을 돕는 핵심 데이터.

**리뷰 정책:**

| 정책 | MVP 기준 |
|------|----------|
| 작성 조건 | 구매 확정 후 작성 가능 |
| 수정 | 1회 수정 가능 |
| 삭제 | 본인 삭제 가능 (soft delete) |
| 포인트 | 텍스트 리뷰 100P, 사진 리뷰 300P |
| 베스트 선정 | 관리자 수동 |

---

### 4.16 커뮤니티 게시물 (Post)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| board_type | enum | DAILY, STYLE, TIP, QUESTION |
| title | string | |
| content | text | |
| images | jsonb? | 이미지 URL 배열 (최대 10장) |
| product_ids | jsonb? | 태그된 상품 ID 배열 |
| dog_breed | string? | |
| like_count | int | 좋아요 수 (캐시) |
| comment_count | int | 댓글 수 (캐시) |
| view_count | int | 조회수 |
| is_pinned | boolean | 고정글 (관리자) |
| status | enum | ACTIVE, HIDDEN, DELETED |
| created_at | timestamp | |
| updated_at | timestamp | |

**게시판 유형:**

| 유형 | 설명 | 커머스 연결 |
|------|------|-------------|
| DAILY | 일상 공유 | 착용 사진 → 상품 태그 |
| STYLE | 착용 스타일 | 상품 태그 필수 |
| TIP | 사이즈·핏 팁 | 사이즈 가이드 보조 |
| QUESTION | 질문 | 구매 전 문의 |

> 정책: 커뮤니티는 커머스를 보조하는 구조. 상품 태그를 통해 게시물 → 상품 상세 전환을 유도.

---

### 4.17 댓글 (Comment)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| post_id | UUID | FK → Post |
| user_id | UUID | FK → User |
| parent_id | UUID? | FK → Comment (대댓글, 1depth) |
| content | text | |
| like_count | int | |
| status | enum | ACTIVE, HIDDEN, DELETED |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 4.18 좋아요 (Like)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| target_type | enum | POST, COMMENT |
| target_id | UUID | |
| created_at | timestamp | |

> UNIQUE(user_id, target_type, target_id)

---

### 4.19 신고 (Report)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| reporter_id | UUID | FK → User |
| target_type | enum | POST, COMMENT, REVIEW, USER |
| target_id | UUID | |
| reason | enum | SPAM, ABUSE, INAPPROPRIATE, FRAUD, OTHER |
| detail | text? | 상세 사유 |
| status | enum | PENDING, REVIEWED, RESOLVED, DISMISSED |
| reviewed_by | UUID? | FK → Admin |
| reviewed_at | timestamp? | |
| action_taken | enum? | NONE, WARNING, CONTENT_HIDDEN, USER_SUSPENDED |
| admin_memo | text? | |
| created_at | timestamp | |

**신고 상태:**

```
PENDING ──→ REVIEWED ──→ RESOLVED (조치 완료)
                │
                └──→ DISMISSED (기각)
```

---

### 4.20 제재 (Sanction)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| type | enum | WARNING, SUSPEND_7D, SUSPEND_30D, PERMANENT_BAN |
| reason | string | |
| report_id | UUID? | FK → Report |
| starts_at | timestamp | |
| ends_at | timestamp? | null이면 영구 |
| is_active | boolean | |
| created_by | UUID | FK → Admin |
| created_at | timestamp | |

**제재 정책:**

| 단계 | 조건 | 조치 |
|------|------|------|
| 1차 | 경고 누적 1회 | WARNING (경고) |
| 2차 | 경고 누적 2회 | SUSPEND_7D (7일 정지) |
| 3차 | 경고 누적 3회 | SUSPEND_30D (30일 정지) |
| 4차 | 반복 위반 | PERMANENT_BAN (영구 정지) |

---

### 4.21 관리자 (Admin)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | string | 고유 |
| password_hash | string | |
| name | string | |
| role | enum | SUPER_ADMIN, ADMIN, OPERATOR, CS, VIEWER |
| status | enum | ACTIVE, SUSPENDED, DEACTIVATED |
| last_login_at | timestamp? | |
| created_at | timestamp | |
| updated_at | timestamp | |

> 관리자와 회원은 별도 테이블. 어드민은 Supabase Auth와 분리하여 별도 인증 관리.

---

### 4.22 권한 모델 (Role-Based Access Control)

**역할 정의:**

| 역할 | 설명 |
|------|------|
| SUPER_ADMIN | 모든 권한. 관리자 계정 관리, 시스템 설정 |
| ADMIN | 상품·주문·쿠폰·포인트·커뮤니티·신고·배송 전체 관리 |
| OPERATOR | 상품·주문·배송 관리 (쿠폰/포인트/관리자 관리 제외) |
| CS | 주문 조회·메모, 신고 처리, 회원 조회 (수정 제외) |
| VIEWER | 읽기 전용. 대시보드·조회만 가능 |

**권한 매트릭스:**

| 기능 | SUPER_ADMIN | ADMIN | OPERATOR | CS | VIEWER |
|------|:-----------:|:-----:|:--------:|:--:|:------:|
| 대시보드 조회 | O | O | O | O | O |
| 상품 CRUD | O | O | O | - | - |
| 재고 관리 | O | O | O | - | - |
| 주문 조회 | O | O | O | O | O |
| 주문 상태 변경 | O | O | O | - | - |
| 주문 메모 작성 | O | O | O | O | - |
| 배송/운송장 관리 | O | O | O | - | - |
| 발주 관리 | O | O | O | - | - |
| 쿠폰 관리 | O | O | - | - | - |
| 포인트 지급/차감 | O | O | - | - | - |
| 회원 조회 | O | O | O | O | O |
| 회원 제재 | O | O | - | - | - |
| 커뮤니티 관리 | O | O | O | O | - |
| 신고 처리 | O | O | - | O | - |
| 관리자 계정 관리 | O | - | - | - | - |
| 시스템 설정 | O | - | - | - | - |
| 감사 로그 조회 | O | O | - | - | - |
| CSV 다운로드 | O | O | O | - | - |

---

### 4.23 감사 로그 (AuditLog)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| admin_id | UUID | FK → Admin |
| action | string | 액션명 (예: ORDER_STATUS_CHANGE, POINT_GRANT, USER_SUSPEND) |
| target_type | string | 대상 엔티티 (User, Order, Product 등) |
| target_id | UUID | 대상 ID |
| before_value | jsonb? | 변경 전 값 |
| after_value | jsonb? | 변경 후 값 |
| ip_address | string | |
| user_agent | string | |
| memo | text? | |
| created_at | timestamp | |

> 정책: 관리자의 **모든 쓰기 액션**을 기록. 조회는 기록하지 않음. 90일 보관, 이후 아카이브.

---

### 4.24 이벤트 로그 (EventLog)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| event_name | string | 이벤트명 (예: product_detail_view, add_to_cart, purchase) |
| user_id | UUID? | FK → User (비회원은 null) |
| session_id | string? | |
| properties | jsonb | 이벤트 속성 |
| context | jsonb | 공통 컨텍스트 (locale, country, currency, device, source, medium, campaign) |
| created_at | timestamp | |

> 분석팀(Lua)의 이벤트 스키마와 연동. 서버 사이드 이벤트만 기록. 클라이언트 이벤트는 별도 분석 툴로 전송.

---

### 4.25 국가 설정 (CountryConfig)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| country_code | enum | KR, US, JP, DE |
| default_locale | enum | ko, en, ja, de |
| default_currency | enum | KRW, USD, JPY, EUR |
| shipping_available | boolean | |
| free_shipping_threshold | decimal? | 무료배송 기준금액 |
| base_shipping_fee | decimal | 기본 배송비 |
| estimated_delivery_days_min | int | 최소 배송일 |
| estimated_delivery_days_max | int | 최대 배송일 |
| tax_rate | decimal | 세율 |
| tax_included | boolean | 세금 포함가 여부 |
| return_period_days | int | 반품 가능 기간 |
| is_active | boolean | |
| updated_at | timestamp | |

---

## 5. 도메인 간 연결 관계 (ER 요약)

```
User ──1:N──→ Address
User ──1:N──→ Order
User ──1:1──→ Point
User ──1:N──→ PointTransaction
User ──1:N──→ CouponIssuance
User ──1:N──→ Wishlist
User ──1:N──→ Review
User ──1:N──→ Post
User ──1:N──→ Comment
User ──1:N──→ Report (reporter)
User ──1:N──→ Sanction
User ──1:1──→ Cart

Cart ──1:N──→ CartItem
CartItem ──N:1──→ ProductOption

Category ──1:N──→ Product (self-referencing parent)
Product ──1:N──→ ProductOption
ProductOption ──N:1──→ Size
Product ──1:N──→ Review
Product ──1:N──→ Wishlist

Order ──1:N──→ OrderItem
Order ──1:1──→ Payment
Order ──1:1──→ Shipment
Order ──N:1──→ CouponIssuance
OrderItem ──N:1──→ ProductOption

Coupon ──1:N──→ CouponIssuance
CouponIssuance ──N:1──→ User

Shipment ──N:1──→ Order

Post ──1:N──→ Comment
Comment ──0:N──→ Comment (parent, 1depth)

Report ──N:1──→ Admin (reviewer)
Sanction ──N:1──→ Admin (creator)

Admin ──1:N──→ AuditLog
Admin ──1:N──→ SupplyOrder

SupplyOrder ──N:1──→ ProductOption
```

---

## 6. 핵심 배치 작업

| 배치 | 주기 | 설명 |
|------|------|------|
| 포인트 만료 처리 | 매일 00:00 | expires_at 지난 포인트 EXPIRE 처리 |
| 쿠폰 만료 처리 | 매일 00:00 | expires_at 지난 미사용 쿠폰 EXPIRED 처리 |
| 구매 자동 확정 | 매일 00:00 | DELIVERED + 7일 경과 → CONFIRMED + 포인트 적립 |
| 미결제 주문 취소 | 30분 간격 | PENDING_PAYMENT + 30분 경과 → CANCELLED |
| 재고 부족 알림 | 매일 09:00 | stock ≤ low_stock_threshold → 관리자 알림 |
| 제재 만료 처리 | 매일 00:00 | ends_at 지난 제재 비활성화 + 회원 상태 복원 |
| 탈퇴 회원 정보 파기 | 매일 00:00 | WITHDRAWN + 30일 경과 → 개인정보 파기 |

---

## 7. 리스크

| 리스크 | 수준 | 대응 |
|--------|------|------|
| 다국어 가격 관리 복잡도 | 중 | 통화별 가격 필드 분리, 환율 자동 변환은 MVP 이후 |
| 재고 동시성 | 높 | 결제 시점에 재고 차감 + DB 레벨 락 필수 |
| 주문/결제 상태 불일치 | 높 | PG webhook 기반 상태 동기화 + 수동 보정 도구 |
| 국가별 반품 정책 차이 | 중 | CountryConfig에 return_period_days로 분리 |
| 포인트/쿠폰 환불 복원 로직 | 중 | 트랜잭션 단위 처리, 이력 테이블로 추적 가능 |
| 감사 로그 데이터 증가 | 낮 | 90일 보관 후 아카이브, 파티셔닝 고려 |

---

## 8. 다음 작업

1. **Politis (백엔드)** — 이 문서 기반으로 Supabase 스키마 정의 및 마이그레이션 작성
2. **Iseria (기획)** — 국가별 배송 정책 상세 문서 작성
3. **Iseria (기획)** — 결제 플로우 상세 문서 작성 (Stripe + 한국 간편결제)
4. **Lua (분석)** — EventLog 이벤트 스키마와 본 모델의 정합성 확인
5. **Vivian (디자인)** — 사이즈 가이드 UX 설계 시 Size + Review.size_feedback 데이터 활용 구조 참고
