# 코드베이스 갭 분석 및 Supabase 연동 전략

> 작성: Iseria (Planner) | 2026-04-14
> 상태: 팀 리뷰 대기

---

## 1. 현재 구현 상태 요약

| 영역            | 상태         | 상세                                                |
| --------------- | ------------ | --------------------------------------------------- |
| 타입 정의       | ✅ 완료      | 561줄, 40+ 인터페이스 (User~AuditLog)               |
| DB 스키마       | ✅ 완료      | 5개 마이그레이션, 20+ 테이블, ENUM 30+개            |
| RLS 정책        | ✅ 완료      | 전 테이블 RLS 적용, 405줄                           |
| Storage 버킷    | ✅ 완료      | products/reviews/avatars 3개 버킷 + 정책            |
| 인덱스          | ✅ 완료      | 80+ 줄, 복합/부분 인덱스 포함                       |
| 인증 (Commerce) | ✅ 기본 완료 | Email + Google OAuth, AuthProvider, 미들웨어 가드   |
| i18n            | ✅ 완료      | 4개 언어 (ko/en/ja/de), next-intl 설정 완료         |
| Mock API        | ⚠️ 부분      | products, categories, sizes만 구현                  |
| 공통 유틸리티   | ✅ 완료      | 204줄, 가격/날짜/다국어 포매팅                      |
| UI 컴포넌트     | ⚠️ 기본      | Button, Input, Badge, Modal, Toast, Skeleton 등 9개 |
| Analytics 설계  | ✅ 완료      | 228줄 이벤트 타입, 189줄 매니저, 프로바이더         |
| 커머스 페이지   | ❌ 최소      | Home(플레이스홀더), Login, Sign-up만                |
| 어드민 페이지   | ❌ 최소      | Login(플레이스홀더), Dashboard 셸만                 |

---

## 2. 미구현 항목 목록 (갭 분석)

### 2-A. 커머스 앱 — 미구현 페이지/기능

| #   | 항목                   | 우선순위 | 기술 난이도 | 비고                                    |
| --- | ---------------------- | -------- | ----------- | --------------------------------------- |
| C01 | 상품 목록 페이지 (PLP) | P0       | 중          | 필터/정렬/페이지네이션, SSR             |
| C02 | 상품 상세 페이지 (PDP) | P0       | 중          | 옵션 선택, 사이즈 가이드, 이미지 갤러리 |
| C03 | 카테고리 네비게이션    | P0       | 하          | 헤더/사이드바, 2depth 구조              |
| C04 | 장바구니               | P0       | 중          | CRUD, 수량 변경, 가격 계산, 게스트 카트 |
| C05 | 주문/결제 플로우       | P0       | 상          | 주소 입력, 쿠폰/포인트 적용, PG 연동    |
| C06 | 주문 내역/상세         | P1       | 중          | 상태 추적, 배송 조회                    |
| C07 | 마이페이지 (계정)      | P1       | 중          | 프로필 수정, 주소록, 비밀번호 변경      |
| C08 | 위시리스트             | P1       | 하          | 찜하기/해제, 목록                       |
| C09 | 검색                   | P1       | 중          | 텍스트 검색, 필터, 자동완성             |
| C10 | 리뷰 시스템            | P1       | 중          | 작성/조회, 사이즈 피드백, 이미지 업로드 |
| C11 | 커뮤니티 (게시판)      | P2       | 중          | 게시글 CRUD, 댓글, 좋아요               |
| C12 | 쿠폰 목록/적용         | P1       | 중          | 내 쿠폰함, 결제 시 적용                 |
| C13 | 포인트 내역            | P2       | 하          | 적립/사용 이력                          |
| C14 | 비밀번호 찾기          | P1       | 하          | Supabase auth 내장 기능 활용            |
| C15 | 글로벌 레이아웃        | P0       | 중          | 헤더, 푸터, 네비게이션, 장바구니 아이콘 |
| C16 | 사이즈 가이드 페이지   | P1       | 하          | 견종별 사이즈 테이블                    |

### 2-B. 어드민 앱 — 미구현 페이지/기능

| #   | 항목               | 우선순위 | 기술 난이도 | 비고                                       |
| --- | ------------------ | -------- | ----------- | ------------------------------------------ |
| A01 | 어드민 인증 시스템 | P0       | 중          | admins 테이블 기반 별도 인증, 세션 관리    |
| A02 | 대시보드 KPI       | P1       | 중          | 매출, 주문, 회원, 재고 요약                |
| A03 | 상품 관리 (CRUD)   | P0       | 상          | 다국어 입력, 이미지 업로드, 옵션/재고 관리 |
| A04 | 주문 관리          | P0       | 중          | 목록/상세/상태 변경, 취소/환불             |
| A05 | 회원 관리          | P1       | 중          | 목록/상세, 제재, 포인트 수동 지급          |
| A06 | 카테고리 관리      | P1       | 하          | CRUD, 정렬, 2depth 구조                    |
| A07 | 쿠폰 관리          | P1       | 중          | 생성/수정/발급, 사용 현황                  |
| A08 | 배송 관리          | P1       | 중          | 송장 입력, 상태 추적                       |
| A09 | 리뷰/신고 관리     | P2       | 중          | 승인/숨김, 신고 처리                       |
| A10 | 커뮤니티 관리      | P2       | 중          | 게시글/댓글 관리, 제재                     |
| A11 | 사이즈 관리        | P2       | 하          | CRUD                                       |
| A12 | 국가/배송 설정     | P2       | 하          | country_configs CRUD                       |

### 2-C. 데이터 레이어 — 미구현

| #   | 항목               | 우선순위 | 비고                                |
| --- | ------------------ | -------- | ----------------------------------- |
| D01 | Supabase 실제 연결 | P0       | Mock→Real 전환                      |
| D02 | Cart API           | P0       | 게스트/회원 카트 분리               |
| D03 | Order API          | P0       | 주문 생성, 상태 변경, 스냅샷        |
| D04 | Payment API        | P0       | PG 연동 (Toss/Stripe)               |
| D05 | Wishlist API       | P1       | 토글/목록                           |
| D06 | Review API         | P1       | CRUD + 이미지 업로드                |
| D07 | Community API      | P2       | 게시글/댓글/좋아요                  |
| D08 | Coupon API         | P1       | 발급/적용/검증                      |
| D09 | Point API          | P2       | 적립/사용/만료                      |
| D10 | Admin CRUD API     | P0       | service_role 기반 전체 도메인       |
| D11 | Search API         | P1       | Supabase full-text search 또는 외부 |

### 2-D. DB 스키마 — 누락 테이블 확인 결과 ✅ 완료 (Yuna, 2026-04-14)

| 테이블             | 타입에 정의됨 | DB에 존재 | 비고                              |
| ------------------ | ------------- | --------- | --------------------------------- |
| wishlists          | ✅            | ✅        | table #20                         |
| posts              | ✅            | ✅        | table #22, `board_type` ENUM 사용 |
| comments           | ✅            | ✅        | table #23                         |
| reviews            | ✅            | ✅        | table #21                         |
| likes              | ✅            | ✅        | table #24                         |
| reports            | ✅            | ✅        | table #25                         |
| sanctions          | ✅            | ✅        | table #26                         |
| shipments          | ✅            | ✅        | table #16                         |
| supply_orders      | ✅            | ✅        | table #17                         |
| point_transactions | ✅            | ✅        | table #19                         |
| audit_logs         | ✅            | ✅        | table #27                         |

**DDL 총 28개 테이블 전수 확인 완료. 누락 테이블 없음.**

### 2-E. 타입 vs DDL 불일치 수정 결과 ✅ 완료 (Yuna, 2026-04-14)

| 항목                      | 불일치 내용                                                                                | 수정                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `Post.category`           | `string` → DDL `board_type` ENUM                                                           | `board_type: BoardType` 타입 추가, 필드명 변경                                |
| `Post.product_tags`       | DDL 필드명은 `product_ids`                                                                 | `product_ids: UUID[]`로 수정                                                  |
| `Post.is_pinned`          | 타입에 누락                                                                                | `is_pinned: boolean` 추가                                                     |
| `Post.dog_breed`          | 타입에 누락                                                                                | `dog_breed: string \| null` 추가                                              |
| `Admin.role_id`           | DDL에 별도 roles 테이블 없음. `admin_role` ENUM 직접 사용                                  | `role: AdminRole`로 변경, `Role` 인터페이스 삭제, `AdminRole` 타입 추가       |
| `AdminStatus`             | `'DEACTIVATED'` 누락                                                                       | 유니언에 추가                                                                 |
| `OrderItemStatus`         | `'REFUND_REQUESTED'` 누락                                                                  | 유니언에 추가                                                                 |
| `AuditLog` 필드명         | `resource_type/id`, `before/after`, `ip_address: null`                                     | `target_type/id`, `before_value/after_value`, `ip_address: string` (NOT NULL) |
| `AuditLog` 누락 필드      | `user_agent`, `memo`                                                                       | 추가                                                                          |
| `CountryConfig` 필드명    | `country`, `locale`, `currency`, `shipping_fee` 등                                         | DDL 컬럼명 (`country_code`, `default_locale` 등)으로 전면 수정                |
| `CountryConfig` 누락 필드 | `id`, `shipping_available`, `tax_rate`, `tax_included`, `return_period_days`, `updated_at` | 추가                                                                          |

---

## 3. Supabase 연동 전략

### 3-1. 핵심 결정: Server Component 직접 쿼리 vs API Route

#### 추천: **하이브리드 전략**

| 작업 유형         | 방식                                              | 이유                                                             |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **읽기 (커머스)** | Server Component + `createServerClient` 직접 쿼리 | SSR/ISR 최적화, 중간 레이어 불필요, Next.js 15 캐싱 활용         |
| **쓰기 (커머스)** | Server Action (`'use server'`)                    | form 제출, 카트 변경 등 mutation에 최적, Progressive Enhancement |
| **실시간**        | Client Component + `createBrowserClient`          | 카트 수량 변경 같은 즉시 반영 필요 케이스                        |
| **어드민 전체**   | Server Action + `service_role` 클라이언트         | RLS 우회 필요, 관리자 권한으로 전체 데이터 접근                  |
| **결제/웹훅**     | API Route (`route.ts`)                            | 외부 PG사 콜백, 서버 간 통신                                     |

#### 이유

1. **API Route 레이어 최소화**: Next.js 15의 Server Component/Action이 서버 사이드 로직을 직접 처리하므로, 별도 REST API 레이어는 외부 연동(PG 웹훅, 3rd party)에만 사용
2. **성능**: Server Component에서 Supabase 직접 쿼리 → DB 왕복 1회, API Route 경유 시 2회
3. **타입 안전성**: Supabase 쿼리 결과를 `@commerce/types`로 직접 매핑, 중간 직렬화 불필요
4. **RLS 활용**: 커머스는 `anon`/`authenticated` 키로 RLS 기반 접근, 어드민은 `service_role`로 RLS 우회

### 3-2. 디렉토리 구조 제안

```
apps/commerce/src/
├── lib/
│   ├── supabase/
│   │   ├── server.ts          # (기존) SSR 클라이언트
│   │   ├── client.ts          # (기존) 브라우저 클라이언트
│   │   └── admin.ts           # service_role 클라이언트
│   ├── queries/               # ← NEW: 읽기 전용 쿼리 함수
│   │   ├── products.ts        # getProducts, getProductBySlug 등
│   │   ├── categories.ts
│   │   ├── sizes.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── index.ts
│   ├── actions/               # ← NEW: Server Actions (mutation)
│   │   ├── cart.ts            # addToCart, updateQuantity, removeItem
│   │   ├── order.ts           # createOrder, cancelOrder
│   │   ├── auth.ts            # updateProfile, changePassword
│   │   ├── review.ts          # createReview, deleteReview
│   │   ├── wishlist.ts        # toggleWishlist
│   │   └── index.ts
│   └── api/                   # (기존 mock → 삭제 예정)

apps/admin/src/
├── lib/
│   ├── supabase/
│   │   ├── server.ts          # ← NEW: service_role 전용
│   │   └── client.ts          # ← NEW: 필요시 브라우저용
│   ├── queries/               # ← NEW: 어드민 읽기 쿼리
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   ├── dashboard.ts       # KPI 집계 쿼리
│   │   └── index.ts
│   └── actions/               # ← NEW: 어드민 Server Actions
│       ├── products.ts        # CRUD
│       ├── orders.ts          # 상태 변경, 환불
│       ├── users.ts           # 제재, 포인트 지급
│       ├── coupons.ts
│       └── index.ts
```

### 3-3. Mock→Supabase 전환 절차

```
Phase 1: 인프라 준비
  ├── Supabase 프로젝트 생성 (로컬 or 클라우드)
  ├── supabase db push (마이그레이션 적용)
  ├── .env 실제 키 설정
  └── seed 데이터 삽입 (mock JSON → SQL INSERT)

Phase 2: queries/ 레이어 구축
  ├── lib/queries/products.ts 작성 (기존 lib/api/products.ts 시그니처 유지)
  ├── lib/queries/categories.ts
  ├── lib/queries/sizes.ts
  └── 페이지에서 import 경로만 변경 (api/ → queries/)

Phase 3: actions/ 레이어 구축
  ├── 카트 Server Actions
  ├── 인증 관련 Actions (프로필 수정 등)
  └── 위시리스트 Actions

Phase 4: Mock 코드 제거
  ├── lib/api/mock/ 디렉토리 삭제
  ├── data/*.json 삭제 (seed SQL로 대체)
  └── 의존성 정리
```

### 3-4. Supabase 클라이언트 사용 규칙

| 클라이언트                       | 용도                              | 파일 위치                | RLS    |
| -------------------------------- | --------------------------------- | ------------------------ | ------ |
| `createServerClient` (anon key)  | 커머스 Server Component 읽기      | `lib/supabase/server.ts` | 적용됨 |
| `createBrowserClient` (anon key) | 커머스 Client Component           | `lib/supabase/client.ts` | 적용됨 |
| `createClient` (service_role)    | 어드민 전용, PG 웹훅, 시스템 작업 | `lib/supabase/admin.ts`  | 우회   |

---

## 4. 리스크

| #   | 리스크                                           | 영향도 | 대응                                                        |
| --- | ------------------------------------------------ | ------ | ----------------------------------------------------------- |
| R01 | DB 테이블 누락 (타입 vs DDL 불일치)              | 높음   | DDL 전수 확인 후 누락 테이블 추가 마이그레이션              |
| R02 | PG 연동 복잡도 (Toss + Stripe 동시)              | 높음   | MVP에서 Toss만 → Stripe는 Phase 2                           |
| R03 | 게스트 카트→회원 카트 병합 로직                  | 중     | session_id 기반 병합 Server Action 설계 필요                |
| R04 | Supabase 풀텍스트 검색 성능                      | 중     | MVP는 ILIKE, 이후 pg_trgm 또는 외부 검색 엔진               |
| R05 | 이미지 최적화 (Next.js Image + Supabase Storage) | 중     | Supabase CDN URL + next/image loader 커스텀                 |
| R06 | 어드민 인증이 Supabase Auth가 아닌 별도 테이블   | 중     | admins 테이블 + JWT 직접 발급 vs Supabase Auth + role claim |

---

## 5. NEED_HELP / REQUEST_USER

- **NEED_HELP:developer:Yuna** — DDL 전수 확인 (2-D 테이블 누락 여부), queries/ 레이어 1차 구현 (products, categories, sizes)
- **NEED_HELP:developer:Politis** — 어드민 Supabase 클라이언트 설정, 어드민 인증 방식 구현
- **NEED_HELP:data:Lua** — Mock JSON → seed SQL 변환, 테스트용 샘플 데이터 확대
- **NEED_DISCUSSION:어드민 인증 방식** — admins 테이블 직접 인증 vs Supabase Auth + custom claims (R06)

---

## 6. 다음 작업 (순서)

1. ✅ DDL 전수 확인 → 28개 테이블 모두 존재, 누락 없음 (Yuna)
2. ✅ 타입 vs DDL 불일치 11건 수정 — `packages/types/src/index.ts` (Yuna)
3. ✅ `lib/queries/` 레이어 구축 (products / categories / sizes) (Yuna)
4. ☐ 어드민 인증 방식 확정 (NEED_DISCUSSION)
5. ☐ 커머스 글로벌 레이아웃 (헤더/푸터/네비게이션)
6. ☐ PLP(상품 목록) + PDP(상품 상세) 페이지
7. ☐ 장바구니 Server Actions + UI
8. ☐ Seed 데이터 준비 (Lua)

---

## 7. MVP vs Post-MVP 경계

### MVP (런칭 필수)

- 상품 목록/상세, 카테고리 네비, 사이즈 가이드
- 장바구니 (회원), 주문/결제 (Toss 단일 PG)
- 마이페이지 (프로필, 주소록, 주문 내역)
- 어드민: 인증, 상품 CRUD, 주문 관리
- 글로벌 레이아웃, 4개 언어 UI

### Post-MVP

- 게스트 카트, 카트 병합
- Stripe (해외 결제), Klarna
- 위시리스트, 리뷰, 커뮤니티
- 쿠폰/포인트, 검색
- 어드민: 대시보드 KPI, 쿠폰/회원/배송/신고 관리
- 분석 이벤트 실제 전송 (GA4/Amplitude)
