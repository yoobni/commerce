# 브랜드 톤 및 디자인 시스템 — Direction B (Modern) 확정

> 작성: Iseria (planner)
> 최종 수정: 2026-04-24
> 상태: **확정** — Direction B (Modern) + Burgundy accent 채택. 핸드오프 패키지(`design_handoff_muzzle_commerce/`) 기반.
> 참조: `design_handoff_muzzle_commerce/README.md`, `hifi/tokens.jsx`, `hifi/dir-b-ds.jsx`

---

## 1. 목표

대형견 의류 커머스의 **브랜드 정체성**을 시각 언어로 정의한다.
"반려동물 쇼핑몰"이 아니라 **"대형견 보호자를 위한 프리미엄 편집몰"**로 인식되어야 한다.
디자이너(Vivian)와 프론트엔드(Yuna)가 바로 작업 가능한 수준으로 원칙과 **구체 토큰값**을 확정한다.

### 1-1. 디자인 방향 결정

| 항목              | 결정                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| **Direction**     | **B · Modern** (bone white, Fraunces display + Inter body, disciplined grid) |
| **Accent**        | **Burgundy** (`#6B2020`) — 신호용, 장식 아님                                 |
| **한글 폰트**     | **Pretendard Variable** (fallback for Fraunces + Inter 한글 영역)            |
| **디자인 프레임** | Mobile-first, iOS 430×880 (iPhone 16 Pro logical)                            |

Direction A (Editorial)는 보관만 하고 빌드하지 않는다.

---

## 2. 포함 범위

- 브랜드 톤 키워드 및 성격 정의
- **확정 색상 토큰** (Light + Dark, 3가지 accent)
- **확정 타이포그래피 스케일** (폰트·크기·굵기·자간 전수)
- **확정 간격/반지름 스케일**
- 컴포넌트 스펙 (Button, Input, Chip, SizeSelector, ProductCard, **Fit-for-Hana**)
- 상태 패턴 (로딩, 스켈레톤, 빈 상태, 에러)
- 다국어 텍스트 길이 대응 규칙
- 모바일 우선 구조 기준
- 이미지 운용 원칙
- **화면별 레이아웃 스펙** (11개 화면)
- **모션/인터랙션 규칙**

## 3. 제외 범위

- 어드민 디자인 시스템 (별도 문서로 분리)
- 아이콘/일러스트레이션 실제 에셋 제작 (방향만 정의)
- 실제 코드 구현 (NEED_HELP:developer로 위임)

---

## 4. 브랜드 톤 정의

### 4-1. 핵심 키워드 (Brand Personality)

| 키워드       | 의미                 | 시각적 표현                                  |
| ------------ | -------------------- | -------------------------------------------- |
| **Clean**    | 군더더기 없는 깔끔함 | 최소한의 장식, 명확한 위계, 정돈된 그리드    |
| **Premium**  | 고급스러움, 신뢰     | 절제된 색상, 넉넉한 여백, 높은 이미지 품질   |
| **Calm**     | 차분하고 편안한      | 저채도 팔레트, 부드러운 전환, 과한 모션 배제 |
| **Spacious** | 여유로운 공간감      | 넓은 마진, 충분한 패딩, 밀도 낮은 레이아웃   |

### 4-2. 보조 키워드

| 키워드                  | 설명                                                       |
| ----------------------- | ---------------------------------------------------------- |
| **Trustworthy**         | 정보가 정확하고 구조가 예측 가능                           |
| **Warm but Restrained** | 따뜻하지만 과하지 않음. 귀여움이 아닌 존중의 따뜻함        |
| **Editorial**           | 잡지처럼 이미지와 텍스트의 조화. 나열이 아닌 편집          |
| **Modern Commerce**     | 최신 커머스 UX 관행을 따르되 트렌디함을 목적으로 하지 않음 |

### 4-3. 안티패턴 (하지 말아야 할 것)

| 금지                   | 이유                                                          |
| ---------------------- | ------------------------------------------------------------- |
| 귀엽고 동글동글한 톤   | 반려동물 = 귀여움이라는 클리셰. 대형견 보호자가 공감하지 않음 |
| 과한 애니메이션/파티클 | 체감 속도 저하 + 프리미엄 감도와 충돌                         |
| 화려한 그라디언트/네온 | 고급 감도와 반대                                              |
| 빽빽한 정보 밀도       | Spacious 원칙 위반                                            |
| 지나치게 서구형 미니멀 | 서비스 감도가 없어짐. 한국적 절제감 유지                      |
| 스톡 이미지 느낌       | 브랜드 신뢰 하락. 대형견이 주인공인 리얼 비주얼 필수          |
| 스프링/패럴럭스 모션   | Direction B 규칙: "Nothing playful, no springs, no parallax"  |

### 4-4. 브랜드 포지셔닝 비유

> **"무인양품(MUJI)의 절제 + Aesop의 소재감 + Mr Porter의 편집력"**을 대형견 세계에 적용한 것

- MUJI → 불필요한 것을 뺀 정돈된 구조
- Aesop → 소재와 텍스처가 주는 고급감
- Mr Porter → 이미지와 정보의 편집적 배치

---

## 5. 색상 체계 — 확정 토큰

### 5-1. 원칙

| 원칙              | 설명                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| 저채도 중심       | 채도가 높은 색은 극히 제한적 사용 (Fit 배지, 가격 강조, 활성 상태)                       |
| 뉴트럴 베이스     | Bone white (`#F7F6F3`) 배경, 순수 검정이 아닌 Ink (`#0E0E0C`)                            |
| **Accent = 신호** | accent는 장식이 아니라 신호. Fit-for-Hana 배지, 활성 칩, 히어로 가격, 완료 표시에만 사용 |
| 이미지가 컬러     | 제품/대형견 이미지가 페이지의 색감을 담당                                                |

### 5-2. Light 모드 (MVP 기본)

| CSS 변수           | 토큰명     | HEX                   | 용도                         |
| ------------------ | ---------- | --------------------- | ---------------------------- |
| `--mz-bg`          | bg         | `#F7F6F3`             | 페이지 배경                  |
| `--mz-bg-deep`     | bgDeep     | `#EFEDE7`             | 이미지/카드 백드롭           |
| `--mz-surface`     | surface    | `#FFFFFF`             | 입력, bg 위의 카드           |
| `--mz-ink`         | ink        | `#0E0E0C`             | Primary 텍스트, Primary 버튼 |
| `--mz-ink-soft`    | inkSoft    | `#4D4D48`             | 본문 산문                    |
| `--mz-ink-mute`    | inkMute    | `#8F8F88`             | 메타, 라벨                   |
| `--mz-line`        | line       | `rgba(14,14,12,0.08)` | 구분선                       |
| `--mz-line-strong` | lineStrong | `rgba(14,14,12,0.18)` | 입력 테두리, 칩 아웃라인     |

### 5-3. Dark 모드 (MVP 제외, 토큰만 정의)

| CSS 변수           | 토큰명     | HEX                      | 용도               |
| ------------------ | ---------- | ------------------------ | ------------------ |
| `--mz-bg`          | bg         | `#0C0C0B`                | 페이지 배경        |
| `--mz-bg-deep`     | bgDeep     | `#050504`                | 이미지/카드 백드롭 |
| `--mz-surface`     | surface    | `#171715`                | 입력, 카드         |
| `--mz-ink`         | ink        | `#F5F4F0`                | Primary 텍스트     |
| `--mz-ink-soft`    | inkSoft    | `#B4B3AE`                | 본문 산문          |
| `--mz-ink-mute`    | inkMute    | `#757571`                | 메타, 라벨         |
| `--mz-line`        | line       | `rgba(245,244,240,0.08)` | 구분선             |
| `--mz-line-strong` | lineStrong | `rgba(245,244,240,0.18)` | 입력 테두리        |

### 5-4. Accent 컬러 — 3가지 옵션 (하나만 선택, 혼합 금지)

| Accent       | HEX       | Soft      | Ink-on    | 현재 선택  |
| ------------ | --------- | --------- | --------- | ---------- |
| **Burgundy** | `#6B2020` | `#F1E5E0` | `#4A1818` | **✓ 채택** |
| Olive        | `#4A5237` | `#E5E7D8` | `#2E3422` | 보관       |
| Ink          | `#0E0E0C` | `#EFEDE7` | `#000`    | 보관       |

Accent CSS 변수:

- `--mz-accent`: `#6B2020`
- `--mz-accent-soft`: `#F1E5E0`
- `--mz-accent-ink`: `#4A1818`

### 5-5. 시스템 컬러 (기존 유지)

| 역할    | HEX       | 용도                          |
| ------- | --------- | ----------------------------- |
| Error   | `#c0392b` | 에러 메시지, 유효성 검사 실패 |
| Success | `#27ae60` | 완료, 성공 상태               |
| Warning | `#d68910` | 경고, 주의                    |

---

## 6. 타이포그래피 — 확정 스케일

### 6-1. 폰트 스택

| 역할                | 폰트                                          | 비고                                                     |
| ------------------- | --------------------------------------------- | -------------------------------------------------------- |
| **Display / Title** | `Fraunces` (opsz 9–144, wght 400–600, italic) | 히어로, 섹션 제목, 상품명, 가격                          |
| **Body / UI**       | `Inter` (wght 300–700)                        | 본문, 라벨, 버튼, 폼                                     |
| **한글 fallback**   | `Pretendard Variable`                         | Inter/Fraunces에서 한글이 빠질 때 동일 사이즈로 fallback |
| **일본어 fallback** | `Noto Sans JP`                                | 일본어 locale 전용 로딩                                  |
| **Mono**            | `JetBrains Mono` (400)                        | 코드, 타임스탬프, 스펙, 주문번호                         |

CSS font-family 선언:

```css
--font-serif: 'Fraunces', 'Pretendard Variable', 'Noto Sans JP', Georgia, serif;
--font-sans:
  'Inter', 'Pretendard Variable', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

> **중요**: Fraunces는 라틴 전용. 한글 히어로 텍스트는 Pretendard Variable로 자연스럽게 fall through. 한 문장 안에서 폰트가 섞이지 않도록 주의.

### 6-2. 타이포 스케일 (확정)

| Role           | Font           | Size / LH | Weight | Letter-spacing    | 용도                              |
| -------------- | -------------- | --------- | ------ | ----------------- | --------------------------------- |
| **Display XL** | Fraunces       | 48 / 50   | 500    | -0.035em          | 히어로 헤드라인. italic 단어 강조 |
| **Display L**  | Fraunces       | 32 / 36   | 500    | -0.025em          | 섹션/PDP 제목                     |
| **Title**      | Fraunces       | 24 / 29   | 500    | -0.02em           | 카드 제목, 모달 제목              |
| **Product**    | Fraunces       | 15 / 20   | 500    | 0                 | 상품 카드 이름                    |
| **Body**       | Inter          | 13 / 21   | 400    | 0                 | 본문 산문 (Korean + Latin)        |
| **Label**      | Inter          | 12 / 17   | 500    | 0                 | 마이크로 라벨                     |
| **Eyebrow**    | Inter          | 10        | 600    | +0.16em UPPERCASE | 섹션 킥커, 태그                   |
| **Price**      | Fraunces       | 22 / 26   | 600    | 0                 | 표시 가격                         |
| **Mono**       | JetBrains Mono | 11 / 15   | 400    | 0                 | 코드, 타임스탬프, 스펙            |

### 6-3. 다국어 타이포 고려 (기존 유지)

| 언어   | 특성                                  | 대응                                                    |
| ------ | ------------------------------------- | ------------------------------------------------------- |
| **ko** | 글자 폭 균일, 행간 넉넉해야 읽기 편함 | line-height 1.6~1.8. Pretendard Variable                |
| **en** | 글자 폭 변동, 대소문자 높이차         | line-height 1.5~1.6                                     |
| **ja** | 한자 포함 시 높이 큼                  | line-height 1.7~1.8. Noto Sans JP                       |
| **de** | 단어가 매우 길음 (합성어)             | 줄바꿈 규칙 필수, overflow 대비, word-break: break-word |

---

## 7. 간격 및 레이아웃 — 확정 스케일

### 7-1. 간격 체계 (4-base)

| 토큰  | px  | 용도 예시                        |
| ----- | --- | -------------------------------- |
| `xs`  | 4   | 아이콘-텍스트 간격               |
| `sm`  | 8   | 이미지-메타 갭, 칩 간 간격       |
| `md`  | 12  | 그리드 갭, 카드 내부 패딩        |
| `lg`  | 16  | 섹션 내 요소 간격                |
| `xl`  | 22  | 섹션 간 간격                     |
| `2xl` | 32  | 큰 섹션 구분                     |
| `3xl` | 44  | 히어로 아래 여백, 주요 영역 분리 |

### 7-2. 반지름 (Radii)

| 토큰   | px  | 용도                                              |
| ------ | --- | ------------------------------------------------- |
| `sm`   | 4   | 작은 요소, 태그                                   |
| `md`   | 10  | **상품 카드, 입력, 버튼, 히어로 이미지** (기본값) |
| `lg`   | 16  | 큰 카드, 모달                                     |
| `xl`   | 22  | 특수 컨테이너                                     |
| `pill` | 999 | Fit 배지, 칩, 필터                                |

> 주의: 기존 코드의 `md: 8`을 `md: 10`으로 변경 필요

### 7-3. 레이아웃 그리드 (기존 유지 + 핸드오프 보완)

| 항목        | 모바일 (< 768px)     | 태블릿 (768–1024px) | 데스크탑 (> 1024px)   |
| ----------- | -------------------- | ------------------- | --------------------- |
| 컬럼        | 4                    | 8                   | 12                    |
| 거터        | 16px                 | 24px                | 24–32px               |
| 마진        | 20px (핸드오프 확정) | 32px                | auto (max-width 제한) |
| 최대 너비   | 100%                 | 100%                | 1280px (콘텐츠 영역)  |
| 상품 그리드 | 2열, 12px gap        | 3열                 | 3–4열                 |

### 7-4. 핵심 레이아웃 원칙

1. **여백이 디자인이다** — 요소 사이에 충분한 공간이 있어야 고급스럽다
2. **정보 밀도는 낮게** — 한 화면에 너무 많은 정보를 넣지 않는다
3. **시선 흐름은 위→아래 (모바일), Z-패턴 (데스크탑)**
4. **섹션 구분은 여백으로** — 구분선(divider)은 `line` 토큰으로 최소 사용
5. **상품 이미지 비율**: 카드 `1:1`, 히어로/배너 자유 (핸드오프 기준 1:1 확정)

---

## 8. 모션 & 인터랙션 — 확정 규칙

| 상황          | 값                                                               | 비고                |
| ------------- | ---------------------------------------------------------------- | ------------------- |
| Hover / Press | 150ms ease, opacity 0.85 (primary 버튼) 또는 bgDeep shift (카드) |                     |
| 페이지 전환   | 250ms ease-out, fade + 8px rise                                  |                     |
| 캐럿 블링크   | 1s infinite (`@keyframes mz-blink`)                              | 입력 필드 포커스 시 |
| **금지**      | 스프링, 패럴럭스, 장식 애니메이션                                | "Nothing playful"   |

---

## 9. 컴포넌트 스펙 — 확정

### 9-1. Button

4가지 variant. Height: `sm 40 · md 48 · lg 56`. Padding-x: 20. Radius: 10. Inter 500, 13/14, letter-spacing +0.02em.

| Variant     | bg                                 | fg      | 용도                                            |
| ----------- | ---------------------------------- | ------- | ----------------------------------------------- |
| **Primary** | ink                                | bg      | 핵심 CTA. 뷰당 1개                              |
| **Accent**  | accent                             | white   | Fit/커밋 모먼트 ("Apply fit", "Track shipment") |
| **Ghost**   | transparent, border 1px lineStrong | ink     | 보조 액션                                       |
| **Quiet**   | text-only, no chrome               | inkMute | 3차 / 취소                                      |

> 기존 코드 매핑: `secondary` → Ghost, `danger` 유지 (시스템용), 기존 `ghost` → Quiet, 기존 `accent` → Accent(색상 변경)

### 9-2. Input

- Border: 1px `line`, focus: 1.5px `ink`
- Radius: 10. Padding: 14/16. Font: Inter 14/400
- **Floating label on focus/value**: 절대 위치 `top: -7px, left: 12px`, `bg: page bg`, padding 0/6, Inter 600/10, +0.14em uppercase
- 기존 Input 컴포넌트에 floating label 모드 추가 필요

### 9-3. Chip

- Unselected: `bg: surface, border: 1px line, radius: pill`, Inter 500/12, padding 7/14
- Selected: `bg: ink, fg: bg, border: ink`
- **Fit-for-Hana chip variant**: `bg: accentSoft, fg: accentInk` with ★ prefix

### 9-4. Size Selector

- 4-cell row, border 1.5px, radius 10
- 각 셀: 사이즈 + 재고 마이크로 텍스트 ("3 left" / "sold")
- Active: solid ink fill + ★ accent marker (Fit 프로필 매칭 시)
- Out-of-stock: opacity 0.35
- 재고 수 5 미만: 숫자 표시. 0: disable + "sold" 라벨

### 9-5. Product Card

- 이미지 블록: `bgDeep`, **1:1 ratio**, radius 10, relative
- Top-left: accent `★ FIT L` 배지 (pill, white text) — Fit 매칭 상품만
- Top-right: heart 아이콘 버튼, 28×28 circular surface-colored
- Meta under image: Fraunces 14/500 (name) · Inter 11/400/inkMute (color) · Inter 13/600 (price)
- Gap from image to meta: 8px

### 9-6. Fit-for-Hana Card (시그니처 컴포넌트) ★

**이 프로젝트의 핵심 차별화 컴포넌트. 가장 먼저 구현.**

- `bg: accentSoft, fg: accentInk, radius: md (10)`
- Layout: 40px circular hound avatar | flex-1 text stack | "Why →"
- Text: eyebrow `FIT FOR HANA` + Fraunces 15/500 "Recommended · size L"
- **출현 화면**: Home, PLP 헤더, PDP, Cart, Checkout, My page
- 온보딩 미완료 시: muted "Set up Hana's profile →" 프롬프트로 대체

### 9-7. Icons

- 24×24 그리드, 1.4 stroke, round caps, no fills (heart active 제외)
- 세트: back, close, search, heart, bag (accent 배지 for count)
- Tab bar: Home · Shop · Search · Saved · Me
- 라이브러리: Lucide 또는 Phosphor (1.4 stroke / round caps / 24-grid 스펙 유지)

---

## 10. Fit-for-Hana 시스템 — 핵심 UX

### 10-1. 개요

온보딩 단계에서 캡처한 **하운드 프로필**(견종 · 체중 · 체형 · 사이즈)이 모든 화면에 걸쳐 퍼시스턴트하게 표시되는 시스템.

### 10-2. 데이터

```
HoundProfile {
  name: string           // e.g. "Hana"
  breed: string          // e.g. "Golden Retriever"
  weight: number         // kg
  bodyType: 'Sporty' | 'Sturdy' | 'Slim' | 'Cloud'
  size: 'L' | 'XL' | 'XXL'
}
```

### 10-3. 화면별 표현

| 화면         | 표현                                                         |
| ------------ | ------------------------------------------------------------ |
| **Home**     | Fit-for-Hana 카드 바 (히어로 아래) + "Curated for Hana" 섹션 |
| **PLP**      | 필터 스트립에 Fit 칩 활성 + 상품 카드에 `★ FIT L` 배지       |
| **PDP**      | Fit 카드 풀 width + 사이즈 셀렉터에 ★ 마커                   |
| **Cart**     | Fit 배너 (프로필 재확인)                                     |
| **Checkout** | Fit 참조                                                     |
| **My page**  | 하운드 서머리 카드                                           |
| **Search**   | "TOP PICKS · FIT L" 필터된 상품                              |

### 10-4. 규칙

- Fit 매칭 안 되는 상품은 숨기지 않음. 배지만 부재
- 온보딩 스킵 가능. Fit 의존 모든 표면은 "Set up Hana's profile →" fallback
- `★ FIT L` 배지: pill, accent bg, white text, 9px/700/+0.08em

---

## 11. 화면 스펙 — 11개 화면 (Mobile-first, 430×880)

### 11-1. Login

- Muzzle wordmark top-left, serif "Welcome back." mid-page
- Email + Password (floating label on focus), Primary "Sign in" full-width 56px
- "Forgot password?" centered muted
- Divider "OR" → Apple/Google/Kakao ghost 56px
- "New to Muzzle? Create account" (underline on "Create account")

### 11-2. Onboarding · Hound Profile

- Step indicator "STEP 3/5" + 3px progress bar (60% ink fill)
- "Tell us about your hound." 32/500
- Body type: 2×2 grid cards (4:3 illustration, serif name + mute descriptor). Active: ink border + accent dot
- Weight slider: 2px track, 20px ink thumb with 4px bg ring, mono min/max labels
- Sticky Continue button

### 11-3. Home

- Top bar: wordmark left, search + bag icons right
- Hero: full-bleed portrait illustration + serif headline + eyebrow
- Fit-for-Hana card bar
- "Curated for Hana" horizontal scroll product cards (4장)
- "Shop by hound" 3-column breed tiles (circular avatars)
- "Journal" 2 editorial story cards
- Tab bar: Home · Shop · Search · Saved · Me

### 11-4. PLP · Outerwear

- Top bar: back, "Outerwear", filter icon with dot
- Sticky filter strip: Fit chip active → sort/color/price chips
- 2-column product grid, 12px gap, 20px side padding
- Bottom sheet filters

### 11-5. PDP · Field Trench

- Image carousel 1:1, page dots, heart top-right
- Title + price: Fraunces 24 (name) + 22/600 (price) + color swatch row
- Fit-for-Hana card full width
- Size selector with live stock
- Description prose + spec table (Mono)
- "4 reviews from Goldens like Hana" + photo reviews
- **Sticky bottom**: heart + "Add to bag · ₩148,000" primary

### 11-6. Cart

- Top bar: back, "Bag (3)"
- Fit-for-Hana banner
- Line items: 80×96 image | name+color+size+price | qty stepper + remove
- Gift message toggle
- Summary: subtotal, shipping (free > ₩100k), total (Price type)
- **Sticky bottom**: "Checkout" primary full-width

### 11-7. Checkout

- Top bar: back, "Checkout"
- 3-step progress: Address · Shipping · Payment
- Saved address card, shipping method radios, payment method (Kakao Pay / card / Naver Pay)
- Summary collapse
- **Sticky bottom**: "Place order · ₩148,000"

### 11-8. Search

- Cancel link + pill search input with caret
- "SUGGESTED" query list (magnifier + insert-up arrow)
- "TOP PICKS · FIT L" 2-column filtered products

### 11-9. Order Complete

- Accent-soft circle ✓ glyph
- "Order placed. Thank you, _Hana._" (italic name)
- Order number + dates in mono
- 4 items thumbnail stack + total
- Delivering-to block
- Ghost "View order" + Primary "Track shipment"

### 11-10. Tracking

- "Arriving Apr _27 – 29._" italic numerics
- Map strip: SVG simplified route (stubbed — 실제 구현 시 Mapbox/Naver static 400×160@2x)
- 5-step vertical timeline with accent dots. Current: accent-soft halo
- Carrier card: CJ Logistics + tracking number + "Copy"

### 11-11. My Page

- "Account" title + settings cog
- Avatar + name + member since
- Fit-for-Hana hound summary card
- 3-stat grid (Orders · Points · Coupons) serif numerals
- Sub-page list (Orders, Wishlist, Addresses, Payment, Size profile, Notifications, Care)
- Sign out

---

## 12. 상태 패턴 규칙 (기존 유지)

> 모든 비동기 데이터를 다루는 화면은 반드시 4가지 상태를 정의해야 한다.

### 12-1. 로딩 상태

| 규칙             | 설명                                           |
| ---------------- | ---------------------------------------------- |
| 전체 페이지 로딩 | 스켈레톤 UI (스피너 금지)                      |
| 부분 로딩        | 해당 영역만 스켈레톤                           |
| 버튼 로딩        | 버튼 내부에 spinner + disabled                 |
| 이미지 로딩      | `bgDeep` placeholder → blur-up → 원본          |
| 로딩 시간 기준   | 200ms 이내 → 표시 안 함. 200ms 이후 → 스켈레톤 |

### 12-2. 스켈레톤 UI

- 형태: 실제 콘텐츠 레이아웃 반영
- 색상: `bgDeep` 톤, pulse 애니메이션
- 전체 화면 스피너 절대 금지

### 12-3. 빈 상태

- 구성: 일러스트(선택) + 메시지 + CTA
- 톤: 따뜻하지만 절제된 어조
- Fit 미설정 시: "Set up Hana's profile →" 프롬프트

### 12-4. 에러 상태 (기존 유지)

인라인 에러 / 영역 에러 / 전체 에러 / 네트워크 에러 / 토스트 에러 — 기술 용어 노출 금지.

---

## 13. 다국어 텍스트 대응 규칙 (기존 유지)

| 언어 | 한국어 대비 길이     |
| ---- | -------------------- |
| ko   | 1.0x                 |
| en   | 1.2–1.5x             |
| ja   | 0.8–1.2x             |
| de   | 1.5–2.0x (가장 주의) |

핵심: 고정 너비 금지. 독일어 기준 레이아웃 깨짐 테스트 필수. 날짜/통화 locale 기반 포맷.

---

## 14. 모바일 우선 구조 기준

| 원칙              | 설명                                                          |
| ----------------- | ------------------------------------------------------------- |
| Mobile-first 설계 | 430px 기준 디자인 → 데스크탑 확장                             |
| 터치 최적화       | 모든 인터랙션 요소 최소 44×44px                               |
| 한 손 조작        | 주요 CTA 하단 배치. **Sticky CTA**: PDP/Cart에서 항상 visible |
| Tab bar           | Home · Shop · Search · Saved · Me (모바일 하단 고정)          |

### 브레이크포인트 (기존 유지)

| 이름    | 범위           |
| ------- | -------------- |
| mobile  | 0–767px (기본) |
| tablet  | 768–1023px     |
| desktop | 1024–1439px    |
| wide    | 1440px+        |

---

## 15. 이미지 운용 원칙 (기존 유지 + 보완)

| 원칙                      | 설명                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| 대형견이 주인공           | 착용컷 핵심. 상품만 단독 촬영은 보조                                                  |
| **상품 카드 이미지**: 1:1 | 핸드오프 확정 (기존 3:4에서 변경)                                                     |
| 히어로/배너: 자유 비율    | full-bleed portrait                                                                   |
| 커뮤니티: 1:1 또는 자유   |                                                                                       |
| 배경: 뉴트럴 `bgDeep`     | 상품 사진 배경색과 토큰 일치                                                          |
| 최적화                    | WebP/AVIF, srcset, LQIP blur-up, lazy loading                                         |
| **일러스트**              | SVG only, line + one accent fill. 초기 placeholder → 추후 커미션/에디토리얼 포토 교체 |

---

## 16. 정책

| 정책                   | 내용                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| 디자인 토큰 필수       | `--mz-*` CSS 변수로 관리. 하드코딩 금지                           |
| 상태 완결성 검수       | 로딩/스켈레톤/빈 상태/에러 포함하지 않으면 미완료                 |
| 독일어 레이아웃 테스트 | 다국어 UI 독일어 기준 QA 필수                                     |
| 모바일 우선 리뷰       | 디자인/개발 리뷰는 430px 모바일부터                               |
| 접근성 최소 기준       | WCAG 2.1 AA. 색상 대비 4.5:1. 키보드 네비게이션                   |
| Fit-for-Hana 최우선    | 모든 화면 구현 시 Fit 연동을 빠뜨리지 않음                        |
| 핸드오프 파일 = spec   | `design_handoff_muzzle_commerce/` 파일은 참조용. 직접 import 금지 |

---

## 17. 리스크

| 리스크                                                          | 수준 | 대응                                                      |
| --------------------------------------------------------------- | ---- | --------------------------------------------------------- |
| 독일어 텍스트 길이로 레이아웃 깨짐                              | 높   | 독일어 기준 QA 의무화                                     |
| 폰트 로딩 성능 (Fraunces + Inter + Pretendard + JetBrains Mono) | 중   | locale별 서브셋 로딩, font-display: swap, next/font 활용  |
| Fraunces → Pretendard 한글 fall-through 시 시각 불일치          | 중   | 히어로 한글 텍스트는 Pretendard Variable 전용 클래스 적용 |
| 대형견 이미지 확보                                              | 높   | 초기 AI 생성 + 실촬영 병행. SVG 일러스트 placeholder      |
| 1:1 → 기존 3:4 비율 전환                                        | 낮   | 이미지 업로드 시 crop 가이드라인 제공                     |

---

## 18. 다음 작업 (구현 우선순위)

핸드오프 README 권장 우선순위를 따른다:

| 순위  | 작업                                                                    | 담당      | 비고                                                |
| ----- | ----------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| **1** | 디자인 토큰 코드 반영 (`globals.css` + Tailwind theme + 폰트 설정)      | Developer | `hifi/tokens.jsx` → CSS 변수 변환                   |
| **2** | Fit-for-Hana primitive 컴포넌트                                         | Developer | 모든 화면에 출현 — 가장 먼저                        |
| **3** | Product Card + Size Selector                                            | Developer | 가장 재사용 빈도 높은 원자                          |
| **4** | Chip + Badge (Fit variant 포함)                                         | Developer | 필터/PLP 필수                                       |
| **5** | Button 리매핑 (Primary/Accent/Ghost/Quiet)                              | Developer | 기존 4-variant → 4-variant 교체                     |
| **6** | Input floating label 모드                                               | Developer | Login 화면 필수                                     |
| **7** | Happy path 화면 순서: Home → PLP → PDP → Cart → Checkout                | Developer | 핵심 구매 플로우                                    |
| **8** | 보조 화면: Login, Onboarding, Search, Order Complete, Tracking, My Page | Developer |                                                     |
| **9** | Tracking map stub                                                       | Developer | 마지막. Mapbox/Naver 연동 전까지 이미지 placeholder |

---

## 부록 A: 기존 코드 → Direction B 매핑 가이드

개발자가 바로 작업할 수 있도록, 현재 `globals.css` 토큰과 핸드오프 토큰의 1:1 매핑:

| 기존 CSS 변수            | 기존 값   | → 새 변수               | 새 값                          |
| ------------------------ | --------- | ----------------------- | ------------------------------ |
| `--color-bg`             | `#faf9f7` | `--mz-bg`               | `#F7F6F3`                      |
| `--color-surface`        | `#ffffff` | `--mz-surface`          | `#FFFFFF` (동일)               |
| `--color-text-primary`   | `#1a1a1a` | `--mz-ink`              | `#0E0E0C`                      |
| `--color-text-secondary` | `#6b6760` | `--mz-ink-soft`         | `#4D4D48`                      |
| `--color-text-tertiary`  | `#9e9b96` | `--mz-ink-mute`         | `#8F8F88`                      |
| `--color-brand-primary`  | `#3d3530` | `--mz-ink` (CTA = ink)  | `#0E0E0C`                      |
| `--color-brand-accent`   | `#c8a96e` | `--mz-accent`           | `#6B2020`                      |
| `--color-border`         | `#e8e5e0` | `--mz-line`             | `rgba(14,14,12,0.08)`          |
| `--color-border-subtle`  | `#f0ede8` | (삭제, bgDeep으로 대체) | `#EFEDE7`                      |
| `--color-cta`            | `#1a1a1a` | `--mz-ink`              | `#0E0E0C`                      |
| (없음)                   | —         | `--mz-bg-deep`          | `#EFEDE7`                      |
| (없음)                   | —         | `--mz-line-strong`      | `rgba(14,14,12,0.18)`          |
| (없음)                   | —         | `--mz-accent-soft`      | `#F1E5E0`                      |
| (없음)                   | —         | `--mz-accent-ink`       | `#4A1818`                      |
| `--font-display`         | Inter     | `--font-serif`          | Fraunces + Pretendard Variable |
| (없음)                   | —         | `--font-mono`           | JetBrains Mono                 |

### 폰트 로딩 변경 (`layout.tsx`)

기존: Inter만 로딩
변경: Inter + Fraunces + Pretendard Variable + JetBrains Mono (next/font/google 활용)

```
// next/font/google
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'] })
// next/font/local (Pretendard Variable는 CDN 또는 local)
```

## 부록 B: 어드민 디자인 방향 (요약, 기존 유지)

| 항목          | 커머스                                | 어드민                   |
| ------------- | ------------------------------------- | ------------------------ |
| 톤            | Premium, Calm                         | Functional, Efficient    |
| 정보 밀도     | 낮음 (Spacious)                       | 중~높음 (운영 효율 우선) |
| 색상          | Muzzle 토큰 (--mz-\*)                 | 뉴트럴 + 상태 컬러       |
| 타이포        | Fraunces + Inter 편집적 위계          | Inter 균일 가독성        |
| 컴포넌트 공유 | Button, Input, Modal, Toast 기본 공유 |
| 디자인 토큰   | 토큰 체계 공유, 값은 테마별 분리      |

## 부록 C: 대형견 특화 디자인 고려사항 (기존 유지)

| 항목          | 방향                                               |
| ------------- | -------------------------------------------------- |
| 사이즈 가이드 | 견종별 체형 데이터 기반 추천                       |
| 견종 선택 UI  | 대형견종(30+종) 빠른 선택, 실루엣 아이콘           |
| 착용컷 중심   | 다양한 견종·체형 착용 이미지                       |
| 사이즈 비교   | "같은 견종 보호자가 선택한 사이즈" 커뮤니티 데이터 |
| 핏 정보       | Sporty/Sturdy/Slim/Cloud 체형별 핏 차이            |
