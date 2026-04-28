# 구현 스펙: Direction B 디자인 토큰 + 핵심 컴포넌트

> 작성: Iseria (planner)
> 작성일: 2026-04-24
> 담당: Developer (Politis 또는 Yuna)
> 참조: `docs/design-system-direction.md`, `design_handoff_muzzle_commerce/README.md`
> 상태: 구현 대기

---

## 목표

핸드오프 패키지의 Direction B (Modern) 디자인 토큰을 실제 코드베이스에 반영한다.
기존 placeholder 토큰(`--color-*`)을 확정된 Muzzle 토큰(`--mz-*`)으로 교체한다.

---

## 작업 1: 디자인 토큰 교체 (`globals.css`)

### 변경 대상: `apps/commerce/src/app/globals.css`

**@theme 블록**: 기존 `--color-*` 변수를 `--mz-*`로 교체.

```css
@theme {
  /* Muzzle Direction B — Light */
  --color-mz-bg: #f7f6f3;
  --color-mz-bg-deep: #efede7;
  --color-mz-surface: #ffffff;
  --color-mz-ink: #0e0e0c;
  --color-mz-ink-soft: #4d4d48;
  --color-mz-ink-mute: #8f8f88;
  --color-mz-line: rgba(14, 14, 12, 0.08);
  --color-mz-line-strong: rgba(14, 14, 12, 0.18);

  /* Accent — Burgundy */
  --color-mz-accent: #6b2020;
  --color-mz-accent-soft: #f1e5e0;
  --color-mz-accent-ink: #4a1818;

  /* System (유지) */
  --color-error: #c0392b;
  --color-success: #27ae60;
  --color-warning: #d68910;

  /* Spacing — 4-base */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 22px;
  --spacing-2xl: 32px;
  --spacing-3xl: 44px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-pill: 999px;
}
```

**:root 블록**: 동일하게 교체. 기존 `--color-bg`, `--color-text-primary` 등은 하위 호환을 위해 새 변수를 가리키도록 alias 처리.

```css
:root {
  /* Font stacks */
  --font-serif: var(--font-fraunces), 'Pretendard Variable', Georgia, serif;
  --font-sans:
    var(--font-inter), 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;

  /* Backward compat aliases (기존 컴포넌트가 참조하는 변수) */
  --color-bg: var(--color-mz-bg);
  --color-surface: var(--color-mz-surface);
  --color-text-primary: var(--color-mz-ink);
  --color-text-secondary: var(--color-mz-ink-soft);
  --color-text-tertiary: var(--color-mz-ink-mute);
  --color-border: var(--color-mz-line);
  --color-border-subtle: var(--color-mz-bg-deep);
  --color-cta: var(--color-mz-ink);
  --color-brand-primary: var(--color-mz-ink);
  --color-brand-accent: var(--color-mz-accent);

  /* Motion */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease-out;

  /* Container */
  --container-max: 1280px;
  --container-padding: 20px;
}
```

---

## 작업 2: 폰트 로딩 (`layout.tsx`)

### 변경 대상: `apps/commerce/src/app/layout.tsx`

```tsx
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400'],
});

// body className에 3개 variable 모두 적용
// className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
```

**Pretendard Variable**: CDN에서 로딩 (next/font/local 또는 `<link>` in `<head>`).

```
https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css
```

---

## 작업 3: 기존 컴포넌트 리매핑

### Button.tsx

| 기존 variant | → 새 variant  | 변경 내용                                                       |
| ------------ | ------------- | --------------------------------------------------------------- |
| primary      | primary       | bg: `--mz-ink`, fg: `--mz-bg`                                   |
| secondary    | ghost         | bg: transparent, border: 1px `--mz-line-strong`, fg: `--mz-ink` |
| ghost        | quiet         | text-only, fg: `--mz-ink-mute`, no chrome                       |
| accent       | accent        | bg: `--mz-accent`, fg: white                                    |
| danger       | danger (유지) | 시스템용                                                        |

Height: sm 40 → md 48 → lg 56. Radius: 10. Font: Inter 500 13px, letter-spacing +0.02em.

### Input.tsx

- border: 1px `--mz-line` → focus: 1.5px `--mz-ink`
- Radius: 10px
- **추가**: `floatingLabel` prop → focus/value 시 floating label 렌더링

### Badge.tsx

**추가 variant**:

- `fit`: `bg: --mz-accent, fg: white, pill` → "★ FIT L"
- `fits`: `bg: --mz-accent-soft, fg: --mz-accent-ink, pill` → "✓ FITS"
- `new`: `bg: --mz-ink, fg: --mz-bg, pill` → "NEW"
- `season`: `bg: --mz-bg-deep, fg: --mz-ink, pill` → "SS26"

### 신규 컴포넌트

1. **Chip.tsx** — unselected/selected/fit variant
2. **SizeSelector.tsx** — 4-cell row, stock display, Fit marker
3. **FitForHanaCard.tsx** — 시그니처 컴포넌트 (최우선)
4. **ProductCard.tsx** — 1:1 이미지 + Fit 배지 + heart + meta
5. **TabBar.tsx** — 모바일 하단 네비게이션

---

## 작업 4: 기존 참조 전수 교체

`globals.css` 토큰 교체 후, 기존 `--color-*` 직접 참조하는 코드를 alias가 커버하므로 즉시 깨지지는 않음.
단, 점진적으로 `--mz-*` 직접 참조로 마이그레이션 권장.

---

## 검증 기준

1. `npx tsc --noEmit` 0 에러
2. 브라우저에서 각 토큰 색상이 핸드오프와 일치하는지 시각 확인
3. Fraunces 폰트가 히어로/제목에 정상 렌더링되는지 확인
4. Pretendard Variable이 한글 텍스트에 적용되는지 확인
5. Fit-for-Hana 카드가 accentSoft 배경에 올바르게 렌더링되는지 확인

---

## 참고 파일

- `design_handoff_muzzle_commerce/hifi/tokens.jsx` — 토큰 원본
- `design_handoff_muzzle_commerce/hifi/dir-b-ds.jsx` — 디자인 시스템 레퍼런스
- `design_handoff_muzzle_commerce/hifi/dir-b.jsx` — 5개 핵심 화면 (Home, PLP, PDP, Cart, Checkout)
- `design_handoff_muzzle_commerce/hifi/dir-b-extra.jsx` — 6개 보조 화면
- `design_handoff_muzzle_commerce/Muzzle Hifi.html` — 브라우저에서 열어 전체 확인 가능
