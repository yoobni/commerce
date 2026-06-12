# 회귀 테스트 케이스 — 2026-06-12 세션

브라우저 확장 Claude가 자동 검증 가능한 형식입니다. 각 TC는 **URL · 조작 · 기대 결과** 셋으로 구성되어 있고, DOM 텍스트나 Network 호출 수 같이 측정 가능한 시그널만 기대값으로 적었습니다.

**기준 환경**

- commerce: `http://localhost:4002`
- server: `http://localhost:4005`
- 로그인 계정: `demo@ravi.local` / `qwer1234` (또는 `ravi@ravi.com` 어드민용)

**관련 커밋**

| Hash | 내용 |
|---|---|
| `fcd5a7b` | P0 정책 페이지 6종 + 푸터 사업자정보 |
| `49e1e71` | P1 #38 material 다국어 (옵션 A) |
| `97c2faa` | P1 #39 wishlist N+1 → bulk endpoint |
| `500e5e8` | P1 #40 onboarding 페이지 + dead link 해소 |
| `6b0c801` | P2 #41 `/login`, `/signup` redirect alias |
| `3939363` | ProductCard 클릭 영역 + NEW 배지 hydration + tossPay |

---

## 1. 정책 / 약관 페이지 (`fcd5a7b`)

### TC-1.1 — 6개 정책 페이지 모두 200 응답

| URL | 기대 |
|---|---|
| `/ko/terms` | 200, `<h1>` 텍스트 "이용약관" |
| `/ko/privacy` | 200, `<h1>` 텍스트 "개인정보처리방침" |
| `/ko/company` | 200, `<h1>` 텍스트 "회사 정보" |
| `/ko/shipping` | 200, `<h1>` 텍스트 "배송 안내" |
| `/ko/refund` | 200, `<h1>` 텍스트 "교환 / 환불 정책" |
| `/ko/faq` | 200, `<h1>` 텍스트 "자주 묻는 질문" |

### TC-1.2 — 푸터에 정책 링크 6개 모두 노출

- **URL**: `/ko` (또는 임의 페이지)
- **검증**: 푸터 영역의 `<a>` 요소 중 다음 6개의 href가 모두 존재
  - `/ko/terms`
  - `/ko/privacy`
  - `/ko/company`
  - `/ko/shipping`
  - `/ko/refund`
  - `/ko/faq`

### TC-1.3 — 푸터에 사업자정보 placeholder 노출

- **URL**: `/ko`
- **검증**: 푸터에 다음 문자열 모두 포함
  - `주식회사 라비`
  - `사업자등록번호`
  - `통신판매업 신고`
  - `(준비 중)` — 사업자번호/대표자/주소/전화 등이 placeholder 상태이므로 4회 이상 등장

### TC-1.4 — `/company` 페이지에 회사정보 표 노출

- **URL**: `/ko/company`
- **검증**:
  - `<dt>상호</dt>` + `<dd>주식회사 라비</dd>` 인접 페어
  - `사업자등록번호`, `통신판매업 신고번호`, `사업장 주소`, `호스팅 제공자` 4개 `<dt>` 존재
  - `support@ravi.example` 텍스트 포함 (placeholder 이메일)

---

## 2. ProductCard 클릭 영역 + NEW hydration + tossPay (`3939363`)

### TC-2.1 — PLP 카드 meta 영역 클릭 시 detail 이동

- **URL**: `/ko/products`
- **조작**: 임의 카드의 가격(`<p>` ₩XX,XXX 텍스트) 클릭
- **기대**: `/ko/products/<slug>` 로 이동 (URL 변경)
- **실패 조건**: 같은 URL에 머무름 — 회귀

### TC-2.2 — 카드 하트 클릭은 navigation 되지 않음

- **URL**: `/ko/products` (**로그인 상태**)
- **조작**: 임의 카드의 하트 버튼(top-right circular) 클릭
- **기대**:
  - URL 변하지 않음
  - 하트 시각 상태가 즉시 토글 (optimistic UI)
  - Network 탭에 `POST /wishlist/me/toggle` 호출 발생 → 200

### TC-2.3 — 콘솔에 hydration mismatch 경고 0건

- **URL**: `/ko/products`, `/ko/search?q=cooling`
- **검증**: DevTools Console에 "Hydration" 또는 "mismatch" 키워드 포함 메시지 0건

### TC-2.4 — 결제 페이지 `tossPay` 메시지 키 정상 렌더

- **URL**: `/ko/checkout` (장바구니에 1건 담은 상태에서 결제 진입)
- **조작**: "결제수단" 섹션 펼치기
- **기대**:
  - `토스페이` 텍스트 노출 (라디오 라벨)
  - 콘솔에 `MISSING_MESSAGE: ... tossPay` 에러 0건
- **다국어 확인**: `/en/checkout` → "Toss Pay", `/ja/checkout` → "トスペイ", `/de/checkout` → "Toss Pay"

---

## 3. material 다국어 (`49e1e71`)

> **DB migration 적용된 상태 가정** (`material_ko/en/ja/de` 4 컬럼).

### TC-3.1 — PLP 카드에 material 노출 (ko)

- **URL**: `/ko/products`
- **검증**: 임의 상품 카드의 가격 위에 material 텍스트 (예: `PVA 쿨링 소재`, `폴리에스터 100%` 등) 노출

### TC-3.2 — material 다국어 fallback (ko → en/ja/de)

기존 데이터는 ko에만 입력됨. helper의 fallback으로 다른 locale에서도 ko 값 노출되어야 함.

- **URL**: `/en/products`, `/ja/products`, `/de/products`
- **검증**: 카드의 material 자리에 ko 한국어 텍스트가 그대로 노출 (영문/일문/독문 페이지지만 material은 ko fallback)
- **실패 조건**: material 영역이 빈 줄 → fallback 동작 안 함

### TC-3.3 — PDP 상세에 material spec row 노출

- **URL**: `/ko/products/large-dog-padded-coat` (또는 임의 상품)
- **검증**:
  - "About this piece" 영역에 `소재` 라벨 + `아우터: 폴리에스터 100% / 충전재: 폴리에스터 극세사` 형태 텍스트
  - 또는 같은 위치 `/en/products/large-dog-padded-coat` 에서 "Material" 라벨 + ko fallback 텍스트

### TC-3.4 — 어드민 상품 폼에 4 locale material 입력 가능 (4003)

- **URL**: `http://localhost:4003/products/<id>` (admin)
- **조작**: 언어 탭 전환 (ko → en → ja → de)
- **기대**: 각 탭마다 "소재 (KO)", "소재 (EN)" ... 4개 별도 input 표시. 한 탭에서 입력한 값이 다른 탭에 새지 않음.

---

## 4. wishlist N+1 → bulk endpoint (`97c2faa`)

### TC-4.1 — PLP 진입 시 wishlist 호출 1건 (bulk)

- **URL**: `/ko/products` (**로그인 상태**)
- **검증**: Network 탭에서
  - `GET /wishlist/me/products?ids=...` 호출 **정확히 1건**
  - `GET /wishlist/me/products/<id>` (single check) 호출 **0건**
- **실패 조건**: single check 호출이 2건 이상 — N+1 회귀

### TC-4.2 — 검색 / 홈 / PDP related 도 동일

- **URLs**: `/ko/search?q=cooling`, `/ko`, `/ko/products/<slug>`
- **검증**: 각 페이지 진입 후 bulk endpoint 1건만 호출

### TC-4.3 — 비로그인 사용자는 wishlist 호출 0건

- **URL**: `/ko/products` (로그아웃 상태)
- **검증**: Network 탭에 `/wishlist/me/products*` 호출 0건. 카드의 하트는 빈 상태로 표시.

### TC-4.4 — 계정 위시리스트 페이지 모든 카드 하트 채워짐

- **URL**: `/ko/account/wishlist` (로그인 + 위시리스트 있는 상태)
- **검증**: 모든 카드의 하트가 **빨간색 채워진** 상태로 첫 paint (initialIsWishlisted=true 효과)

---

## 5. Onboarding 페이지 (`500e5e8`)

> **DB migration 적용된 상태 가정** (`users.hound_profile` JSONB).

### TC-5.1 — 비로그인 진입 시 login으로 redirect

- **URL**: `/ko/onboarding` (로그아웃 상태)
- **기대**: 최종 URL `/ko/auth/login?next=/ko/onboarding`

### TC-5.2 — 로그인 진입 시 step 1 표시

- **URL**: `/ko/onboarding` (로그인 상태)
- **기대**:
  - "STEP 1 / 3" eyebrow
  - "어떤 친구의 옷을 고르고 계신가요?" 제목
  - 이름 / 견종 input 2개

### TC-5.3 — 3-step 진행 + 저장 → 홈으로 리다이렉트

- **URL**: `/ko/onboarding`
- **조작**:
  1. Step 1 — 이름 "테스트하나" 입력 → "계속" 클릭
  2. Step 2 — body type "Sporty" 선택 → "계속" 클릭
  3. Step 3 — weight slider 28kg 그대로 → "완료" 클릭
- **기대**:
  - `POST /account/me/hound-profile` 호출 → 200
  - body에 `{ name: "테스트하나", body_type: "Sporty", weight_kg: 28, size: "M" }` 포함
  - 최종 URL `/ko/` (홈으로 redirect)

### TC-5.4 — FitForHanaCard 영문 카피 제거

- **URL**: `/ko` (로그인 상태, hound_profile 미설정)
- **검증**: 홈의 Fit-for-Hana 카드에
  - `Set up your hound's profile →` 영문 **노출 안 됨**
  - `반려견 프로필 설정하기 →` 한국어 노출
- **다국어**: `/en` → `Set up your hound's profile →`, `/ja` → `愛犬プロフィールを設定する →`, `/de` → `Hundeprofil einrichten →`

### TC-5.5 — onboarding 카피의 i18n key 누락 0건

- **URL**: `/ko/onboarding`, `/en/onboarding`, `/ja/onboarding`, `/de/onboarding`
- **검증**: DevTools Console에 `MISSING_MESSAGE` 에러 0건

---

## 6. `/login`, `/signup` redirect alias (`6b0c801`)

### TC-6.1 — root-level alias 8건 모두 정상 redirect

브라우저 주소창에 입력 → 최종 URL.

| 입력 | 최종 URL 기대 |
|---|---|
| `/login` | `/ko/auth/login` |
| `/signup` | `/ko/auth/sign-up` |
| `/sign-up` | `/ko/auth/sign-up` |
| `/ko/login` | `/ko/auth/login` |
| `/ko/signup` | `/ko/auth/sign-up` |
| `/en/login` | `/en/auth/login` |
| `/ja/signup` | `/ja/auth/sign-up` |
| `/de/sign-up` | `/de/auth/sign-up` |

각 경우 최종 페이지가 **404가 아닌** 로그인/회원가입 폼 표시.

### TC-6.2 — query string 보존

- **URL**: `/ko/login?next=/ko/account`
- **기대**: 최종 URL `/ko/auth/login?next=/ko/account`

---

## 7. 주문 상세 회귀 (P2 #42, seed 데이터)

> seed 주문 1건: `order_number = ORD-2026-DEMO-0001`, status = `CONFIRMED` (검증 중 DELIVERED → CONFIRMED 로 전이됨)

### TC-7.1 — admin 주문 list / detail

- **URL**: `http://localhost:4003/orders` (admin)
- **검증**:
  - `ORD-2026-DEMO-0001` 행 노출
  - 클릭하여 상세 진입 시:
    - `라지 독 패딩 코트 · 브라운 · L · ×1` items 표시
    - 결제정보 `TOSS_PAYMENTS · CARD · PAID · ₩89,000`
    - admin memo 입력 가능

### TC-7.2 — commerce 내 주문 list / detail

- **URL**: `/ko/account/orders` (demo@ravi.local 로그인)
- **검증**:
  - `ORD-2026-DEMO-0001` 행 노출
  - 클릭하여 상세 페이지 진입 시 상품 1건 + 배송지 + 결제수단 표시

---

## 8. 종합 회귀 (이전 세션 cumulative)

이전 세션에 사용자가 보고했던 이슈가 회귀하지 않는지.

### TC-8.1 — wishlist toggle DB 반영 (`72fa13b` ~ `97eef3a`)

- **URL**: `/ko/products` (로그인 상태)
- **조작**: 임의 카드 하트 클릭 → `/ko/account/wishlist` 로 이동
- **기대**: 방금 토글한 상품이 위시리스트에 노출됨

### TC-8.2 — locale 더블 prefix 회귀 없음

- **URL**: `/ko/auth/login?next=/ko` 직접 진입
- **조작**: 로그인 완료
- **기대**: 최종 URL `/ko/` (홈). `/ko/ko` 같은 더블 prefix 0건.

### TC-8.3 — CSP / CORS / CORP fetch 차단 회귀 없음

- **URL**: `/ko/products`
- **검증**: DevTools Console에 다음 문자열 포함 에러 0건
  - `violates the document's Content Security Policy`
  - `Cross-Origin-Resource-Policy`
  - `Failed to fetch` (단, 4005 의도적 다운 시 제외)

---

## 자동 검증 시 우선순위

브라우저 Claude가 한 바퀴 돌릴 때 순서 추천:

1. **TC-6.1** (login alias 8건) — 가장 빠름, 첫 헬스체크
2. **TC-1.1, 1.2, 1.3** (정책 페이지 + 푸터) — 정적이라 빠름
3. **TC-2.4** (tossPay messages) — 결제 진입 단계로 다른 페이지 통과 검증 겸용
4. **TC-5.4** (FitForHanaCard 카피) — 홈에 노출되니 다른 시점에서 같이
5. **TC-4.1, 4.2, 4.3** (wishlist N+1) — Network 카운트라 시간 좀 걸림
6. **TC-3.1, 3.2, 3.3** (material 다국어) — DB migration 적용 확인 겸용
7. **TC-5.1, 5.2, 5.3** (onboarding) — persist 검증 (DB 후처리 필요)
8. **TC-7.1, 7.2** (주문 상세) — seed 데이터 의존
9. **TC-2.1, 2.2, 2.3** (ProductCard) — 클릭 거동 검증
10. **TC-8.x** (회귀) — 마지막에 한 바퀴

검증 실패 시 어느 TC 어떤 시그널이 차이났는지 명시해 주세요.
