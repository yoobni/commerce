# 와이어프레임 — 커머스 (apps/commerce)

> 작성: Iseria (planner)
> 최종 수정: 2026-04-28
> 상태: 1차 확정 — 디자인(Vivian) / 프론트엔드(Yuna) 즉시 착수 가능 수준
> 브랜드명: **Muzzle** (핸드오프 패키지 기준)
> 프레임: Mobile-first **430×880** (iPhone 16 Pro logical), 데스크톱 변주는 보조

---

## 1. 목표

대형견 보호자가 "사이즈 신뢰 → 빠른 결정 → 구매 → 공유"를 한 흐름으로 경험할 수 있도록, 7개 핵심 화면(메인 / 상품목록 / 상품상세 / 장바구니 / 결제 / 마이페이지 / 커뮤니티)의 **레이아웃·영역·상태·이벤트 매핑**을 와이어 단위로 확정한다.

이 문서를 보고 디자이너는 시안을, 프론트엔드는 컴포넌트 트리/라우팅/상태 설계를 바로 시작할 수 있어야 한다.

설계 원칙:
- **Fit-for-Hana 우선** — 모든 핵심 화면에서 하운드 프로필(체형/사이즈) 컨텍스트가 살아있어야 한다.
- **여백·낮은 정보 밀도** — Spacious / Calm 톤(`design-system-direction.md` 4-1) 위반 금지.
- **Sticky CTA·한 손 조작** — 모바일에서 핵심 액션은 항상 화면 하단 visible.
- **빈 상태/에러/로딩/스켈레톤 4가지 상태**가 모든 화면에 존재해야 미완료 아님.

---

## 2. 포함 범위

- 7개 화면의 와이어(영역, ASCII 다이어그램, 컴포넌트 매핑)
- 화면별 라우팅, 진입/이탈 흐름
- 화면별 상태(로딩/빈/에러/성공) 매핑
- 화면별 분석 이벤트 매핑 (`analytics-kpi-event-schema.md` 연결)
- 모바일 / 데스크톱 차이 명시
- MVP 범위 / 이후 단계 분리

## 3. 제외 범위

- 시각 디자인 결정(색·타이포·이미지 — `design-system-direction.md` 단일 출처)
- 어드민 화면 와이어(별도 문서)
- 인증·온보딩·검색·주문완료·트래킹 화면(이미 `design-system-direction.md` 11-1, 11-2, 11-8, 11-9, 11-10에 스펙 존재 — 본 문서에서 중복 작성 안 함, 흐름 연결만 명시)
- 실제 코드 구현(NEED_HELP:developer로 위임)

---

## 4. 정보 구조 (IA) 한 장 요약

```
[Top tab bar]   wordmark · search · bag(N)
[Bottom tab]    Home · Shop · Search · Saved · Me
[Routes]
  /                         Home (메인)
  /shop                     Shop landing → category list
  /shop/[category]          PLP (상품목록)
  /products/[slug]          PDP (상품상세)
  /cart                     Cart (장바구니)
  /checkout                 Checkout (결제)
  /checkout/complete        주문완료 (별도 스펙)
  /me                       My page (마이페이지)
  /me/orders                주문 내역
  /me/orders/[id]           주문 상세 + 트래킹
  /community                커뮤니티 피드
  /community/[id]           커뮤니티 게시글 상세
  /community/new            게시글 작성 (인증 필요)
```

진입 동선의 우선순위:
1. Home → PLP → PDP → Cart → Checkout (핵심 구매 플로우)
2. Home → Community → PDP (콘텐츠→구매)
3. Me → 주문상세 → 리뷰 작성 → Community 노출 (재구매·공유)

---

## 5. 공통 영역 — 모든 화면 공유

### 5-1. Top App Bar (모바일)

```
┌──────────────────────────────────────────────┐
│  [≡ 또는 ← back]   MUZZLE       [🔍] [🛍 N]  │  56px high
└──────────────────────────────────────────────┘
```

- 좌측: 루트 화면이면 햄버거(또는 카테고리), 하위 화면이면 back
- 중앙: 워드마크 또는 화면 타이틀
- 우측: search, bag(미결제 카운트 배지 — accent)
- Sticky, 스크롤 시 그림자 없이 line border만

### 5-2. Bottom Tab Bar (모바일)

```
┌──────────────────────────────────────────────┐
│   ⌂      🏷       🔍       ♡       ◯        │  56px + safe area
│  Home   Shop   Search   Saved    Me          │
└──────────────────────────────────────────────┘
```

- 5탭. 활성 탭은 ink, 비활성 inkMute
- Saved = 위시리스트
- 데스크톱에서는 숨기고, 상단 nav가 대체

### 5-3. 데스크톱 nav (≥1024px)

```
[wordmark]   Shop ▾   Community   Journal           [search] [♡] [🛍] [Me]
```

- 카테고리 메가메뉴(hover): Outerwear / Harness / Beds / Care / Sale
- 폭 1280 max-width, 측면 auto margin

### 5-4. 글로벌 상태

- 비로그인: 우상단 "Sign in" 텍스트 링크 (Quiet 버튼)
- 통화/언어: 푸터에 selector. URL 경로의 locale prefix(`/ko`, `/en`, `/ja`, `/de`)와 동기화
- Fit 미설정: 상단 얇은 prompt strip "Set up Hana's profile →" (dismissible, 세션 단위)

---

## 6. 화면 1 — 메인 (Home, `/`)

### 6-1. 목적

- 첫 방문자에게 브랜드 톤 전달 + 사이즈 신뢰 메시지
- 재방문자에게 Hana 맞춤 추천(Curated for Hana)
- 커뮤니티/저널로의 동선 제공

### 6-2. 모바일 와이어

```
┌────────────────────────────────────────┐
│  [Top App Bar]                          │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │     HERO (full-bleed portrait)     │ │  4:5 비율
│ │                                    │ │  serif headline + eyebrow
│ │   Built for big dogs.              │ │  CTA "Shop Outerwear"
│ │                                    │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ ★ FIT FOR HANA · Recommended size L  →│  Fit card (accentSoft)
├────────────────────────────────────────┤
│ Curated for Hana                       │  section heading (serif 22)
│ ┌────┐┌────┐┌────┐┌────┐               │  horizontal scroll
│ │ P1 ││ P2 ││ P3 ││ P4 │               │  product card 1:1
│ └────┘└────┘└────┘└────┘               │  4장 + "View all →"
├────────────────────────────────────────┤
│ Shop by hound                          │
│ ┌──┐  ┌──┐  ┌──┐                      │  3-col 원형 breed tile
│ │GR│  │LR│  │GS│                      │  Golden / Lab / Shepherd...
│ └──┘  └──┘  └──┘                      │
├────────────────────────────────────────┤
│ Journal                                │  editorial cards 2장
│ ┌──────────────────┐                   │  "How we size · Field guide"
│ │  cover img       │                   │
│ │  title · 3 min   │                   │
│ └──────────────────┘                   │
├────────────────────────────────────────┤
│ Community spotlight                    │  ★ 추가
│ ┌────┐┌────┐┌────┐                    │  최근 게시글 3장
│ └────┘└────┘└────┘                    │
├────────────────────────────────────────┤
│ [Footer: locale/currency/policy/SNS]   │
├────────────────────────────────────────┤
│  [Bottom Tab Bar]                      │
└────────────────────────────────────────┘
```

### 6-3. 영역 명세

| 영역 | 내용 | 컴포넌트 | MVP |
|------|------|----------|-----|
| Hero | 시즌 캠페인 1슬라이드(자동슬라이드 X) | `HeroBanner` | ✓ |
| Fit card bar | 하운드 프로필 요약·"Why →" | `FitForHanaCard` | ✓ |
| Curated for Hana | Fit 매칭 상품 4 + view-all | `ProductCardScroll` | ✓ |
| Shop by hound | 견종 진입(필터 사전 적용) | `BreedTile` | ✓ |
| Journal | 콘텐츠 2장 | `StoryCard` | △(시드 2장만) |
| Community spotlight | 최근 인기 게시글 3 | `PostCardCompact` | ✓ |
| Footer | locale/currency/legal/SNS | `Footer` | ✓ |

### 6-4. 상태 매핑

- 로딩: 히어로/카드/그리드 모두 스켈레톤. 200ms 미만 즉시 로드는 표시 안 함
- Fit 미설정: Fit card bar가 "Set up Hana's profile →" muted prompt로 대체
- 빈 데이터(시드 부족): Curated 섹션은 "최근 입고" 폴백 노출
- 에러: 섹션 단위 inline error("새로고침" 버튼)

### 6-5. 분석 이벤트

| 이벤트 | 트리거 | 비고 |
|--------|--------|------|
| `home_viewed` | 페이지 진입 | locale, has_fit_profile |
| `hero_clicked` | 히어로 CTA | campaign_id |
| `fit_card_opened` | Fit 카드 "Why →" | from=home |
| `product_clicked` | 상품 카드 탭 | section=curated_for_hana |
| `breed_tile_clicked` | breed tile | breed_code |
| `journal_clicked` | story card |  |
| `community_post_clicked` | spotlight post | post_id |

### 6-6. 데스크톱 변주

- 히어로: full-bleed 16:9, headline 좌측 정렬
- Curated for Hana: scroll 대신 4-col grid
- Shop by hound: 6-col
- Bottom tab bar 제거, 상단 nav 사용

---

## 7. 화면 2 — 상품목록 (PLP, `/shop/[category]`)

### 7-1. 목적

- 카테고리 내에서 **Fit 매칭** 상품을 빠르게 식별
- 필터/정렬로 의사결정 시간 단축
- 무한스크롤로 끊김 없이 탐색

### 7-2. 모바일 와이어

```
┌────────────────────────────────────────┐
│ [← back]  Outerwear      [⚲ filter●]   │
├────────────────────────────────────────┤
│ Sticky filter strip (horizontal scroll)│
│ [★ FIT L] [Sort ▾] [Color] [Price] [+] │
├────────────────────────────────────────┤
│ "24 results · for Hana (L)"            │  result meta
├────────────────────────────────────────┤
│ ┌────────────┐  ┌────────────┐         │  2-col grid, 12px gap
│ │   image    │  │   image    │         │  1:1
│ │  ★ FIT L   │  │            │         │  배지(매칭만)
│ │       ♡    │  │       ♡    │         │
│ ├────────────┤  ├────────────┤         │
│ │ Field Trench│  │ Storm Coat │         │
│ │ Forest      │  │ Charcoal   │         │
│ │ ₩148,000    │  │ ₩128,000   │         │
│ └────────────┘  └────────────┘         │
│ ┌────────────┐  ┌────────────┐         │
│ │            │  │            │         │
│ │  ...       │  │  ...       │         │
│                                         │
│ [무한스크롤 + sentinel]                 │
├────────────────────────────────────────┤
│  [Bottom Tab Bar]                      │
└────────────────────────────────────────┘
```

필터 BottomSheet (filter 아이콘 탭 시):
```
┌────────────────────────────────────────┐
│  Filters                          ✕    │
├────────────────────────────────────────┤
│ Fit                                    │
│ [● Show only my size (L)]              │  toggle
│                                        │
│ Size      [S][M][L][XL][XXL]           │
│ Color     [chips...]                   │
│ Price     [slider 0 ─── 300k]          │
│ Material  [Wool][Down][Tech]           │
│ Breed     [Golden][Lab][Husky]...      │
│ Rating    [4★+]                        │
├────────────────────────────────────────┤
│  Reset            [Apply (24)]         │  sticky bottom
└────────────────────────────────────────┘
```

### 7-3. 영역 명세

| 영역 | 컴포넌트 | 동작 | MVP |
|------|----------|------|-----|
| 카테고리 헤더 | `PageHeader` | back + title + filter badge(●=활성 필터 존재) | ✓ |
| Sort | `SortChip` | 추천/신상/인기/낮은가/높은가/평점 | ✓ |
| Filter strip | `FilterChipRow` | Fit·Color·Price 칩 항상 노출 | ✓ |
| Result meta | `ResultMeta` | "{n} results · for Hana ({size})" | ✓ |
| Product grid | `ProductCard` (1:1) | Fit 배지, heart, name/color/price | ✓ |
| 무한스크롤 | `IntersectionObserver` | 마지막 행 진입 시 next page fetch | ✓ |
| 필터 시트 | `FilterSheet` | 모달 + sticky Apply | ✓ |
| 빈 상태 | `EmptyState` | "조건에 맞는 상품이 없어요. 필터 초기화" | ✓ |

### 7-4. 정렬·필터 정책

- 기본 정렬: **Fit 매칭 상품 우선 → 신상 → 인기**
- "Show only my size" 토글: Fit 미매칭 상품 숨김. 비로그인/Fit 미설정 시 toggle disable + tooltip
- 필터 적용 결과 0건: 빈 상태 + "Fit 토글 끄기" suggestion

### 7-5. 상태 매핑

- 로딩: grid 스켈레톤 6장
- 추가 로딩(무한스크롤): 그리드 하단 2장 스켈레톤만
- 빈: 일러스트 + 메시지 + "필터 초기화" Ghost 버튼
- 에러: 영역 에러 + retry

### 7-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `category_viewed` | category_code, applied_filters, sort |
| `filter_applied` | filter_key, value, total_filters_count |
| `fit_only_toggled` | enabled (true/false) |
| `product_clicked` | product_id, position, section=plp |
| `product_list_paginated` | page, total_loaded |

### 7-7. 데스크톱 변주

- 좌측 sticky 필터 사이드바(280px) + 우측 3~4-col grid
- 정렬은 우상단 dropdown
- 무한스크롤 대신 "Load more" + 페이지네이션 fallback(SEO)

---

## 8. 화면 3 — 상품상세 (PDP, `/products/[slug]`)

### 8-1. 목적

- 사이즈 신뢰 확보 → 옵션 결정 → 장바구니/구매
- Fit 매칭 표시 + 같은 견종/체형 리뷰 우선 노출

### 8-2. 모바일 와이어

```
┌────────────────────────────────────────┐
│ [← back]                      [♡] [🛍] │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │     Image carousel (1:1)           │ │  swipe
│ │     ● ○ ○ ○                        │ │  page dots
│ │                                    │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ Field Trench                           │  Fraunces 24
│ ₩148,000        ⭐ 4.8 (37)            │  price + rating
│ [forest] [black] [sand]                │  color swatch row
├────────────────────────────────────────┤
│ ★ FIT FOR HANA · Recommended size L →  │  Fit card full
├────────────────────────────────────────┤
│ Size                                   │
│ [S][M][L★][XL][XXL]                    │  Size selector
│ "3 left"           [Size guide →]      │  재고 마이크로 + 가이드 링크
├────────────────────────────────────────┤
│ Description                            │
│ Long prose ...                         │
│                                        │
│ Spec table (mono)                      │
│ ┌──────────────┬─────────────┐         │
│ │ Chest        │ 78–84 cm    │         │
│ │ Back length  │ 60 cm       │         │
│ │ Material     │ Recycled... │         │
│ └──────────────┴─────────────┘         │
├────────────────────────────────────────┤
│ Size guide (가슴둘레/등길이)             │  expandable section
│ [표 + 측정 일러스트]                    │
├────────────────────────────────────────┤
│ Reviews · 37                           │
│ "4 reviews from Goldens like Hana"     │  same-breed filter chip
│ ┌────────────────────────────────────┐ │
│ │ ⭐⭐⭐⭐⭐  김** · Golden · 32kg · L │ │
│ │ "사이즈 정확. 등길이가..."         │ │
│ │ [photo grid]                       │ │
│ └────────────────────────────────────┘ │
│ [View all reviews →]                   │
├────────────────────────────────────────┤
│ You may also like                      │  related
│ [horizontal scroll]                    │
├────────────────────────────────────────┤
│ Q&A (n)                                │  expandable
├────────────────────────────────────────┤
│  ...                                   │
├────────────────────────────────────────┤
│ STICKY BOTTOM                          │
│ [♡] [Add to bag · ₩148,000]            │  Primary full
└────────────────────────────────────────┘
```

### 8-3. 영역 명세

| 영역 | 컴포넌트 | 비고 | MVP |
|------|----------|------|-----|
| 이미지 캐러셀 | `ProductGallery` | swipe + dots, 핀치줌 v2 | ✓ |
| 타이틀/가격/별점 | `ProductHeader` | 가격 strikethrough(세일) 지원 | ✓ |
| Color swatches | `ColorSwatchRow` | 클릭 시 갤러리 동기화, URL 쿼리 | ✓ |
| Fit card | `FitForHanaCard` | 추천 사이즈 표시 | ✓ |
| Size selector | `SizeSelector` | 재고/품절 표시, ★ 매칭 마커 | ✓ |
| Description | `RichTextBlock` | Markdown 렌더 | ✓ |
| Spec table | `SpecTable` | 가슴둘레/등길이 cm 의무 | ✓ |
| Size guide | `SizeGuideAccordion` | 견종별 핏 가이드 | ✓ |
| Reviews | `ReviewSection` | 같은 견종 우선, 사진 우선 | ✓ |
| Related | `ProductCardScroll` | "함께 본 / 같은 핏" | △ |
| Q&A | `QnAAccordion` | MVP는 read-only | △ (작성 v2) |
| Sticky CTA | `BuyBar` | heart + Add to bag | ✓ |

### 8-4. 상호작용·정책

- 옵션(컬러·사이즈) 미선택 시 Add to bag 탭 → 시트로 옵션 선택 강제
- 재고 0인 사이즈는 disable + "sold". 5 미만은 "n left" 마이크로 텍스트
- Fit 미설정 시 Fit 카드 → "Set up Hana's profile →" 변형
- "View all reviews" → 리뷰 모달 (필터: 평점·사진만·같은 견종·같은 체형)
- URL: `/products/field-trench?color=forest&size=L` — 공유 시 옵션 보존

### 8-5. 상태 매핑

- 로딩: 갤러리·헤더·옵션·리뷰 영역별 스켈레톤
- 품절(전 사이즈 0): CTA "Add to bag" → "Notify me" Accent 버튼으로 교체
- 단종: 404 처리, 대체 추천 노출
- 비로그인 + heart 탭: 로그인 모달

### 8-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `product_viewed` | product_id, price, fit_match (true/false), source_section |
| `image_swiped` | index |
| `option_selected` | option_type (color/size), value |
| `size_guide_opened` |  |
| `add_to_cart` | product_id, option_id, qty, price |
| `wishlist_added` / `wishlist_removed` | product_id |
| `review_filter_applied` | filter (same_breed/photo/rating) |
| `notify_me_subscribed` | product_id, option_id |

### 8-7. 데스크톱 변주

- 2-col: 좌측 갤러리 sticky(60vh), 우측 정보·구매 영역(40%)
- Sticky bottom CTA 제거, 우측 영역 내 inline CTA
- Description/Spec/Reviews는 탭 전환 또는 anchor scroll

---

## 9. 화면 4 — 장바구니 (Cart, `/cart`)

### 9-1. 목적

- 옵션 재확인 + 수량/삭제 + 무료배송 임계 시각화
- 비로그인 게스트 카트 → 로그인 시 병합

### 9-2. 모바일 와이어

```
┌────────────────────────────────────────┐
│ [← back]   Bag (3)                     │
├────────────────────────────────────────┤
│ ★ FIT FOR HANA banner (compact)        │  프로필 재확인 링크
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ [img 80x96] Field Trench           │ │
│ │             Forest · L             │ │
│ │             ₩148,000               │ │
│ │             [- 1 +]   [✕]          │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ [img]       Storm Coat             │ │
│ │             Charcoal · XL          │ │
│ │             ₩128,000               │ │
│ │             [- 2 +]   [✕]          │ │
│ │             "1 left in stock"      │ │  재고 경고
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ⚠ 품절: Outdoor Harness            │ │
│ │   "이 상품은 품절되었어요."        │ │
│ │   [Remove]   [View similar]        │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ ☐ Gift message                         │  toggle
│   (열리면 textarea 200자)              │
├────────────────────────────────────────┤
│ [Promo code]               [Apply]     │  쿠폰 v2면 △
├────────────────────────────────────────┤
│ Subtotal             ₩404,000          │
│ Shipping             FREE (>₩100k)     │
│ ────────────────────────────           │
│ Total                ₩404,000          │  Price type
│                                        │
│ Free shipping 도달 — 게이지 100%       │  progress bar
├────────────────────────────────────────┤
│ STICKY BOTTOM                          │
│ [Checkout · ₩404,000]                  │  Primary full
└────────────────────────────────────────┘
```

### 9-3. 영역 명세

| 영역 | 컴포넌트 | 비고 | MVP |
|------|----------|------|-----|
| Top bar | `PageHeader` | 카운트 노출 | ✓ |
| Fit banner | `FitForHanaBanner` | 사이즈 재확인 동기 | ✓ |
| Line item | `CartLineItem` | 80×96 image, qty stepper, 삭제 | ✓ |
| 품절/가격변동 알림 | `CartItemAlert` | 결제 진입 차단 사유 표시 | ✓ |
| 선물 메시지 | `GiftMessageToggle` | 200자, 결제 시 영수증 출력 | △ |
| 프로모 코드 | `PromoInput` | MVP△, 쿠폰 v2 | △ |
| Summary | `CartSummary` | 무료배송 임계 게이지 포함 | ✓ |
| Sticky CTA | `CheckoutBar` | 총액 표기, 차단 시 disable | ✓ |
| 빈 카트 | `EmptyCart` | "Bag is empty." + Shop CTA | ✓ |

### 9-4. 정책

- 옵션 변경(컬러/사이즈)은 line item에서 직접 X — Edit 시트로 전환(재고 충돌 방지)
- 수량 stepper: 0이면 삭제 confirm 모달
- 게스트 카트는 localStorage(만료 30일). 로그인 시 서버 카트와 **수량 합산** 병합, 동일 옵션 충돌은 합산
- 결제 차단 조건: 품절 라인 존재 / 가격 변동 미확인 / 재고 부족
- 무료배송 임계: KR ₩100,000 / EN·DE·JA 시장별 정책(`shipping-tracking-plan.md` 참조)

### 9-5. 상태 매핑

- 로딩: 라인 스켈레톤 3개
- 빈: "Bag is empty." 일러스트 + "Browse Outerwear" Primary
- 품절/가격변동: line별 inline 알림 + 상단 toast "1 item changed"
- 네트워크 에러: 영역 에러 + retry

### 9-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `cart_viewed` | items_count, subtotal, currency |
| `cart_item_qty_changed` | product_id, option_id, prev, next |
| `cart_item_removed` | product_id, option_id |
| `cart_alert_shown` | type=oos/price_change |
| `promo_applied` / `promo_failed` | code, reason |
| `checkout_started` | subtotal, shipping, total |

### 9-7. 데스크톱 변주

- 2-col: 좌측 라인 리스트(2/3), 우측 sticky summary(1/3) + Checkout 버튼
- Sticky bottom 제거

---

## 10. 화면 5 — 결제 (Checkout, `/checkout`)

### 10-1. 목적

- 3단계로 분리된 의사결정 부하 → 실패율 최소화
- 다국어/통화/배송권 자동 매칭

### 10-2. 모바일 와이어 (단일 페이지 + Step accordion)

```
┌────────────────────────────────────────┐
│ [← back]   Checkout                    │
├────────────────────────────────────────┤
│ Step indicator                         │
│ ●─────●─────○                          │
│ Address  Shipping  Payment             │
├────────────────────────────────────────┤
│ ▼ 1. Address                           │  expanded
│ ┌────────────────────────────────────┐ │
│ │ ◉ 김** · 서울 마포구 ...            │ │  기본 주소 카드
│ │   010-1234-5678                    │ │
│ │   [Edit]                           │ │
│ └────────────────────────────────────┘ │
│ ○ Add new address  [+]                 │
│                                        │
│ [Country: KR ▾]  (해외는 추가 필드)    │
├────────────────────────────────────────┤
│ ▶ 2. Shipping                          │  collapsed
├────────────────────────────────────────┤
│ ▶ 3. Payment                           │
├────────────────────────────────────────┤
│ ▼ Summary                              │  collapsible
│ Field Trench · Forest · L · 1   ₩148k  │
│ Storm Coat · Charcoal · XL · 2  ₩256k  │
│ Subtotal               ₩404,000        │
│ Shipping               FREE            │
│ Discount               -               │
│ ────────────────                       │
│ Total                  ₩404,000        │
├────────────────────────────────────────┤
│ STICKY BOTTOM                          │
│ [Place order · ₩404,000]               │  Primary, disabled if invalid
│ "주문 시 약관에 동의한 것으로 간주됩니다"│  미세 텍스트
└────────────────────────────────────────┘
```

Step 2 (Shipping) 펼침:
```
Shipping method
( ) Standard · 2-4 days · FREE
( ) Express · 1 day · ₩5,000
[ ] Save as default
```

Step 3 (Payment) 펼침:
```
Payment method
( ) Card        — Toss Payments
( ) Kakao Pay
( ) Naver Pay
( ) Toss Pay
[ ] Save card for next time (PCI 안전 토큰화)

Billing same as shipping  ☑

Agreements
☑ 약관 (필수)  [view]
☑ 개인정보 수집 (필수)  [view]
☐ 마케팅 수신 (선택)
```

### 10-3. 영역 명세

| 영역 | 컴포넌트 | 비고 | MVP |
|------|----------|------|-----|
| Step indicator | `StepProgress` | 3단계 + 현재 ink fill | ✓ |
| Address picker | `AddressPicker` | 기본/추가/신규 모달 | ✓ |
| Shipping method | `ShippingRadioGroup` | 방식·요금·예상일 | ✓ |
| Payment method | `PaymentRadioGroup` | Toss SDK 연동 | ✓ |
| Agreements | `AgreementGroup` | 필수 체크 미동의 시 disable | ✓ |
| Summary collapse | `OrderSummary` | 펼치면 라인 + 총액 | ✓ |
| Sticky CTA | `PlaceOrderBar` | 검증 통과 시 enable | ✓ |

### 10-4. 정책

- **결제는 Toss Payments(KR) 단일** — `service-requirements.md` 3절. 해외 결제(Stripe)는 v2
- 게스트 결제 허용(이메일 + 휴대전화 필수). 결제 성공 후 가입 prompt
- 통화: 표시는 locale 기반, **결제는 KRW 단일** (해외는 환산 표시 + 안내)
- 약관 미체크 / 주소 미선택 / 결제수단 미선택 → CTA disabled
- 결제 실패 시 inline error + 재시도 (PG 응답 코드 매핑 — 사용자 친화 메시지로 변환)
- 결제 진행 중에는 화면 잠금 + spinner overlay (이중 결제 방지)

### 10-5. 상태 매핑

- 로딩(주소·금액 fetching): step별 스켈레톤
- 결제 처리 중: 전체 잠금 overlay
- 실패: 인라인 에러 + 안내 + 재시도. 카트로 복귀 가능
- 성공: `/checkout/complete?orderId=...`로 replace (back 시 재결제 방지)
- 재고 충돌 발생: "장바구니로 돌아가서 확인해주세요" 모달 + 카트로 이동

### 10-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `checkout_step_viewed` | step (address/shipping/payment) |
| `address_selected` | address_id, country |
| `shipping_method_selected` | method, price |
| `payment_method_selected` | method |
| `payment_attempted` | total, currency, method |
| `payment_failed` | error_code, error_user_message |
| `purchase` | order_id, total, items, currency, coupon |

### 10-7. 데스크톱 변주

- 2-col: 좌측 단계 폼(2/3), 우측 sticky summary(1/3) + Place order
- 단계는 펼친 상태 유지(accordion 비활성). Sticky CTA 우측 내 위치
- 결제창은 PG 모달(중앙 800px)

---

## 11. 화면 6 — 마이페이지 (My, `/me`)

### 11-1. 목적

- 주문 추적·재구매·하운드 프로필 관리·리뷰 작성을 한 곳에서

### 11-2. 모바일 와이어

```
┌────────────────────────────────────────┐
│ Account                          [⚙]   │
├────────────────────────────────────────┤
│  ◯ Avatar                              │
│  김** · Member since 2025.11           │
├────────────────────────────────────────┤
│ ★ FIT FOR HANA — hound summary         │
│ Hana · Golden Retriever · 32kg · L     │
│ [Edit profile →]                       │
├────────────────────────────────────────┤
│ ┌──────┬──────┬──────┐                 │
│ │  3   │ 1,200│   2  │                 │  serif numerals
│ │Orders│Points│Coupons                 │
│ └──────┴──────┴──────┘                 │
├────────────────────────────────────────┤
│ Orders                            →    │
│ Wishlist                          →    │
│ Addresses                         →    │
│ Payment methods                   →    │
│ Size profile                      →    │
│ Notifications                     →    │
│ Care (FAQ / Contact)              →    │
├────────────────────────────────────────┤
│ Language · ko    Currency · KRW        │
├────────────────────────────────────────┤
│ Sign out                               │  Quiet
├────────────────────────────────────────┤
│  [Bottom Tab Bar]                      │
└────────────────────────────────────────┘
```

서브 페이지 — `/me/orders` 와이어:
```
┌────────────────────────────────────────┐
│ [← back]   Orders                      │
├────────────────────────────────────────┤
│ [All][Preparing][Shipping][Delivered]  │  status tab
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 2026.04.12 · #ORD-20260412-0001    │ │
│ │ ◷ Shipping · 도착 예정 4.27–29     │ │
│ │ ┌──┐┌──┐┌──┐  Field Trench 외 2    │ │
│ │ ₩404,000   [Track]  [View]         │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 2026.03.30 · #ORD-...              │ │
│ │ ✓ Delivered                         │ │
│ │ [Write review (2)]                  │ │  미작성 카운트 prompt
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

서브 — `/me/orders/[id]` 와이어 (요약):
- 주문 정보 / 배송 트래킹(`design-system-direction.md` 11-10 사용) / 라인 / 결제 / 환불 신청 버튼 / 리뷰 작성 CTA

### 11-3. 영역 명세

| 영역 | 컴포넌트 | MVP |
|------|----------|-----|
| 프로필 헤더 | `AccountHeader` | ✓ |
| Hound summary | `HoundSummaryCard` | ✓ |
| Stat grid | `StatGrid` | ✓ |
| Sub-page list | `NavList` | ✓ |
| Locale/currency | `LocaleSwitch` | ✓ |
| Sign out | `QuietButton` | ✓ |
| Orders list | `OrderCard` (status tab) | ✓ |
| Order detail | `OrderDetail` + `TrackingTimeline` | ✓ |
| Wishlist | `ProductGrid` (저장된 상품) | ✓ |
| Addresses CRUD | `AddressList` + 모달 | ✓ |
| Payment methods | `CardList` (토큰화 카드) | △ |
| Size profile (Hound) | onboarding 재사용 | ✓ |
| Notifications | `PrefSwitches` | △ |
| Care | FAQ/Contact 정적 페이지 | ✓ |

### 11-4. 정책

- 비로그인 진입 시 `/login?redirect=/me`로 가드
- "Orders" 탭은 상태 필터 + 페이지네이션. 환불 요청은 `DELIVERED`/`CONFIRMED` 상태만 노출
- 리뷰 작성 가능 카운트(미작성 주문건)를 Stat 또는 prompt에 노출
- 회원 탈퇴: `/me` 하위 별도 페이지에서만 가능. 30일 유예(`service-requirements.md` 5-1)

### 11-5. 상태 매핑

- 로딩: 헤더/Hound/Stat/리스트 스켈레톤
- Orders 빈: "아직 주문이 없어요" + Shop CTA
- Wishlist 빈: "♡ 눌러 보관해 둔 상품이 없어요"

### 11-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `account_viewed` |  |
| `order_list_viewed` | tab |
| `order_detail_viewed` | order_id, status |
| `track_shipment_clicked` | order_id |
| `refund_requested` | order_id, reason |
| `review_started` | order_id, line_id |
| `wishlist_viewed` | items_count |
| `hound_profile_updated` | fields_changed |

### 11-7. 데스크톱 변주

- 좌측 sticky nav(서브 페이지 리스트), 우측 컨텐츠 영역
- Stat grid는 프로필 헤더 옆에 inline

---

## 12. 화면 7 — 커뮤니티 (Community, `/community`)

### 12-1. 목적

- 보호자 간의 사이즈/사용 후기 공유 → **상품 태깅으로 PDP 진입**
- 신고/제재로 어뷰징 방어
- KPI: 커뮤니티→PDP 클릭률 / 게시글당 평균 상품 태그

### 12-2. 모바일 와이어 — 피드 `/community`

```
┌────────────────────────────────────────┐
│ Community                       [+ New]│  비로그인은 New disabled
├────────────────────────────────────────┤
│ [All][Sizing][Walk][Care][Q&A]         │  카테고리 탭
├────────────────────────────────────────┤
│ Sort: [Latest ▾]   [for Hana ★]        │  Fit-related toggle
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ ◯ 김** · Golden 32kg · 2h          │ │  author + breed/weight
│ │ "겨울 산책 후기"                   │ │  title (Fraunces 18)
│ │ [photo grid 1:1 · up to 4]         │ │
│ │ "Field Trench L 사이즈 정확..."    │ │  body 3줄 truncate
│ │ 🏷 Field Trench · Storm Coat       │ │  product chip (PDP 링크)
│ │ ♡ 24   💬 5   ⌗ Sizing             │ │  meta
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ...                                │ │
│ └────────────────────────────────────┘ │
│  [무한스크롤]                           │
├────────────────────────────────────────┤
│  [Bottom Tab Bar]                      │
└────────────────────────────────────────┘
```

게시글 상세 — `/community/[id]`:
```
┌────────────────────────────────────────┐
│ [← back]                  [⋮ more]     │  more = 신고/공유/(작성자: 수정/삭제)
├────────────────────────────────────────┤
│ ◯ 김** · Golden 32kg                   │
│ 2026.04.27 · Sizing                    │
├────────────────────────────────────────┤
│ Title (Fraunces 22)                    │
│                                        │
│ [photo carousel 1:1]                   │
│                                        │
│ Body prose ...                         │
│                                        │
│ Tagged products                        │
│ ┌──────────────────────────────────┐   │  PDP-link card
│ │ [img] Field Trench · ₩148,000  → │   │
│ └──────────────────────────────────┘   │
├────────────────────────────────────────┤
│ ♡ 24    Save                           │  reactions
├────────────────────────────────────────┤
│ Comments · 5                           │
│ ┌──────────────────────────────────┐   │
│ │ ◯ 박** · 2h                      │   │
│ │ "사이즈 도움됐어요"              │   │
│ │ ♡ 2  Reply                       │   │
│ └──────────────────────────────────┘   │
│ ...                                    │
├────────────────────────────────────────┤
│ STICKY BOTTOM (입력)                   │
│ [Write a comment...]   [Send]          │
└────────────────────────────────────────┘
```

게시글 작성 — `/community/new`:
```
┌────────────────────────────────────────┐
│ [✕ cancel]   New post     [Publish]    │  Primary disabled until valid
├────────────────────────────────────────┤
│ Category  [Sizing ▾]                   │
│ Title (max 60자)                       │
│ ┌────────────────────────────────────┐ │
│ │  textarea (placeholder)             │ │
│ │                                     │ │
│ └────────────────────────────────────┘ │
│ [+ Add photos]   (max 6, 5MB ea)       │
│ [🏷 Tag products] → 검색 모달           │  자기 구매상품 우선 + 검색
│ [photo grid]                           │
│ [tagged product chips]                 │
├────────────────────────────────────────┤
│ ☐ 본 게시글에 동의 (커뮤니티 가이드)    │
└────────────────────────────────────────┘
```

### 12-3. 영역 명세

| 영역 | 컴포넌트 | 비고 | MVP |
|------|----------|------|-----|
| 카테고리 탭 | `CategoryTabs` | All/Sizing/Walk/Care/Q&A | ✓ |
| Sort + Fit toggle | `SortBar` | Latest/Popular/Most-saved | ✓ |
| Post card | `PostCard` | author / title / photo / body 3줄 / product chips / meta | ✓ |
| Post detail | `PostDetail` | carousel + tagged products + reactions | ✓ |
| Comments | `CommentList` + `CommentInput` | 1단 reply | ✓ |
| New post | `PostComposer` | category / title / body / photos / product tag | ✓ |
| Report | `ReportSheet` | 사유 5종 + 자유 입력 | ✓ |
| 작성자 메뉴 | `OwnerMoreMenu` | 수정/삭제 | ✓ |

### 12-4. 정책

- 작성·댓글·좋아요·신고는 **로그인 필수**
- 사진: 최대 6장, 1장당 5MB, WebP/AVIF 자동 변환(서버)
- 상품 태깅: PDP 링크 + product chip 노출 (분석상 핵심 KPI 신호)
- 신고: 동일 게시글에 대한 동일 사용자 중복 신고 차단
- 신고 3건 누적 → 자동 `HIDDEN` + 어드민 검토 큐 (`service-requirements.md` 4-3)
- 차단된 사용자(`SUSPENDED`)는 작성·댓글·좋아요 모두 disable
- 비로그인 사용자도 피드/상세는 read 가능(SEO·유입 우선)

### 12-5. 상태 매핑

- 로딩: 카드 스켈레톤 3
- 빈: "첫 번째 글을 남겨주세요" + (로그인) New post CTA
- 비공개(`HIDDEN`): 상세 진입 시 "현재 비공개된 게시글입니다"
- 삭제(`DELETED`): 404
- 댓글 빈: "첫 번째 댓글을 남겨주세요"

### 12-6. 분석 이벤트

| 이벤트 | 속성 |
|--------|------|
| `community_feed_viewed` | tab, sort, fit_filtered |
| `post_clicked` | post_id, position, source=feed |
| `post_viewed` | post_id, has_product_tag, tag_count |
| `post_product_chip_clicked` | post_id, product_id |  // 핵심 전환 신호
| `post_liked` / `post_unliked` | post_id |
| `post_saved` / `post_unsaved` | post_id |
| `comment_added` | post_id, length |
| `post_reported` | post_id, reason |
| `post_published` | post_id, photos_count, tagged_products_count |
| `post_edited` / `post_deleted` | post_id |

### 12-7. 데스크톱 변주

- 피드: 2-col 그리드 (Pinterest 스타일은 X — 동일 높이 카드 정렬)
- 상세: 2-col(이미지 좌, 본문/태그/댓글 우)
- New post: 단일 페이지 폼 + 우측 미리보기

---

## 13. 화면 간 흐름 (Flow Diagram)

```
[Home] ──→ [PLP] ──→ [PDP] ──→ [Cart] ──→ [Checkout] ──→ [Order Complete]
   │                  │           │
   │                  └─→ [Wishlist (Saved)]
   │
   ├─→ [Community feed] ──→ [Community detail] ──┐
   │                                              │
   └─→ [Search] ──→ [PDP]                         │
                                                  ▼
                                              [PDP] (product chip)
[Order Complete] ──→ [Tracking] ──→ [Order detail] ──→ [Review compose]
[Me] ──→ [Orders] / [Wishlist] / [Addresses] / [Hound profile]
```

---

## 14. 정책 (전 화면 공통)

| 정책 | 내용 |
|------|------|
| 인증 가드 | `/checkout`, `/me/*`, `/community/new`, 댓글/좋아요/신고는 로그인 필수. 비로그인 시 `?redirect=` 보존 후 `/login`으로 |
| 다국어 | 모든 텍스트 next-intl 키. 독일어 길이 1.5~2.0배 기준 레이아웃 QA |
| 통화 | locale 기반 표시. 결제는 KRW 고정 (MVP) |
| 분석 | 모든 핵심 액션은 `analytics-kpi-event-schema.md` 이벤트 발화 — 누락 시 미완료 |
| 상태 4종 | 로딩/스켈레톤·빈·에러·성공 모두 정의. 200ms 미만 즉시 로드는 표시 안 함 |
| 접근성 | WCAG 2.1 AA, 색대비 4.5:1, 키보드 내비 가능, focus-visible 필수 |
| Sticky CTA | 모바일 PDP/Cart/Checkout 항상 visible (safe-area 고려) |
| Fit-for-Hana | 7개 화면 중 메인/PLP/PDP/Cart/Checkout/My 6개에 표면화. 미설정 시 Set up prompt 폴백 |
| 어드민 연동 | 게시글 신고 자동 비공개, 환불 승인제, 모든 상태 변경은 AuditLog 대상 |

---

## 15. 상태값 (화면별 핵심)

- **상품**: 판매중 / 품절(전 옵션) / 단종 / 예약중(v2)
- **카트 라인**: 정상 / 품절 / 가격변동 / 재고부족
- **주문**: PENDING → PAID → PREPARING → SHIPPING → DELIVERED → CONFIRMED, 취소/환불 분기 (`service-requirements.md` 5-2)
- **배송**: READY → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED, 예외 RETURNED/LOST
- **게시글**: PUBLISHED ↔ HIDDEN → DELETED
- **회원**: ACTIVE / SUSPENDED / WITHDRAWN — 화면별 액션 가드

---

## 16. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Sticky CTA + iOS safe-area / 키보드 | CTA 가림 → 결제 실패율 ↑ | `env(safe-area-inset-bottom)` 적용, 키보드 열림 시 inline로 전환 |
| 무한스크롤 + 뒤로가기 시 위치 유실 | 탐색 피로도 ↑ | scroll restoration + 페이지 캐시(`router cache`), 세션 스토리지 fallback |
| Checkout 단계 이탈률 | 매출 직격 | step별 funnel 이벤트 + 단일 페이지 accordion으로 부담 최소화 |
| 게스트 카트 → 로그인 병합 충돌 | 재고/가격 불일치 | 합산 후 서버 검증, 충돌 라인은 알림 표시 |
| 커뮤니티 어뷰징 | 신뢰 하락 | 신고 3건 자동 비공개 + 작성자 제재 누적 |
| 상품 태깅 → PDP 링크 깨짐 | 전환 손실 | 게시글 발행 시 product 존재 검증, 단종 시 chip "품절" 표시 |
| Fit 매칭 결과 0건(PLP) | 페이지 무용 | "Fit 토글 끄기" suggestion + 인기상품 폴백 |
| 다국어(de) 길이 폭 | 레이아웃 깨짐 | 독일어 기준 QA 의무화, 고정폭 금지 |
| 결제 PG 실패 메시지 노출 | 사용자 혼란 | PG 응답 코드 → 사용자 친화 메시지 매핑 테이블 유지 |

---

## 17. 다음 작업

| # | 작업 | 담당 | 비고 |
|---|------|------|------|
| 1 | 와이어 검토 + 시안 1차(메인/PDP/Cart/Checkout 우선) | Vivian (designer) | `design-system-direction.md` 11-3~11-7 토큰 사용 |
| 2 | 컴포넌트 트리 / 라우팅 / 상태 설계 초안 | Yuna (developer) | `apps/commerce` 기준 |
| 3 | Fit-for-Hana primitive·ProductCard·SizeSelector 구현 | Yuna (developer) | 핸드오프 우선순위 1~3 |
| 4 | 화면별 분석 이벤트 매핑 테이블 → 코드 상수화 | Lua (analytics) | `analytics-kpi-event-schema.md` 단일 출처 |
| 5 | 커뮤니티 게시글/댓글/신고 API 스펙 확정 | Politis (backend) | NEED_HELP:developer로 위임 |
| 6 | 결제 PG 응답코드 → 사용자 메시지 매핑 표 | Iseria + Politis | 결제 실패 사용자 경험 보존 |
| 7 | 독일어 기준 레이아웃 QA 시나리오 | Iseria | 길이 1.5~2.0배 기준 |
| 8 | 어드민 와이어프레임 (별도 task) | Iseria | 본 문서와 정책 정합성 유지 |

---

## 부록 — 관련 문서

- 서비스 요구사항: `docs/service-requirements.md`
- 디자인 시스템 / 화면 스펙: `docs/design-system-direction.md` (특히 §11)
- 도메인 모델: `docs/domain-model.md`
- 분석 이벤트: `docs/analytics-kpi-event-schema.md`
- 배송 트래킹: `docs/shipping-tracking-plan.md`
- 시장 분석: `docs/market-analysis-large-dog-countries.md`
