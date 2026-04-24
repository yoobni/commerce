# Handoff · Muzzle (Large-breed Commerce)

## Overview
**Muzzle** is a premium e-commerce service for **large-breed dog apparel** (Golden Retriever, Shepherd, Husky, Lab, etc.). The product tries to feel more like a considered outerwear magazine than a typical pet-goods store — global-facing, editorial, confident.

The core UX differentiator is **Fit-for-Hana**: an onboarding-captured hound profile (breed · weight · body type · size) that persists across every surface — product recommendations, PLP, size selectors, cart, checkout, my page — as a soft "★ FIT L" badge and size highlight. This is the spine of the product. Build it early.

## About the design files
Everything in this bundle is a **design reference created in HTML/JSX**. They are prototypes that show the intended look, rhythm, and interaction — **not production code to copy wholesale**. The task is to **recreate these designs inside your actual codebase** using whatever framework, component library, and styling solution that codebase already uses. If the codebase is greenfield, pick the framework best suited to the product (we recommend React + Tailwind or a CSS-in-JS solution that can handle the fine typographic control here).

Do not import the JSX files directly — they use ad-hoc inline styles and window-scope globals because they were written to render inside a design canvas. Treat them as a spec, not a library.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radius, badge placement, and layout are all final and deliberate. Match them pixel-perfectly. The only places where fidelity drops:
- **Illustrations** — we use SVG line-art as placeholders for brand imagery. In production these should be replaced with commissioned illustration OR editorial photography shot in the same restrained palette. Slots and aspect ratios are final.
- **Copy** — product names, review text, etc. are lorem-with-flavor. Replace with real merch copy.
- **Icons** — a small custom set; swap in your icon library (Phosphor, Lucide, or custom) keeping the same 1.4 stroke / round caps / 24-grid spec.

## Directions — pick one before building
The handoff ships **two directions** side-by-side for the client to choose from. **Only build one** after the direction is locked.

### Direction A · Editorial
- **Mood**: Warm paper, Instrument Serif italic accents, magazine-like rhythm with intentional asymmetry.
- **Serif**: Instrument Serif (400 roman + italic for accents).
- **Background**: `#F3EFE7` (light) / `#15120E` (dark).
- **Signature**: italic word-swaps in display type ("Outfitters for the *larger* hound"), generous margins, serif-heavy product cards.

### Direction B · Modern (recommended default)
- **Mood**: Bone white, Fraunces display + Inter body, disciplined product grid, global e-commerce readable.
- **Serif**: Fraunces (500/600, with italic for moments).
- **Background**: `#F7F6F3` (light) / `#0C0C0B` (dark).
- **Signature**: tight product grid, italic-only-in-display accents, system-grade forms and lists.

The full design system (tokens, type scale, components, icons) has only been fleshed out for **Direction B** — see `hifi/dir-b-ds.jsx` and the reference artboard in the prototype for the handoff-ready version.

## Design Tokens (Direction B)

### Colors — Light

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#F7F6F3` | Page background |
| `bgDeep` | `#EFEDE7` | Image/card backdrop |
| `surface` | `#FFFFFF` | Inputs, cards on bg |
| `ink` | `#0E0E0C` | Primary text, primary button |
| `inkSoft` | `#4D4D48` | Body prose |
| `inkMute` | `#8F8F88` | Meta, labels |
| `line` | `rgba(14,14,12,0.08)` | Dividers |
| `lineStrong` | `rgba(14,14,12,0.18)` | Input borders, chip outline |

### Colors — Dark

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0C0C0B` | Page background |
| `bgDeep` | `#050504` | Image/card backdrop |
| `surface` | `#171715` | Inputs, cards |
| `ink` | `#F5F4F0` | Primary text |
| `inkSoft` | `#B4B3AE` | Body prose |
| `inkMute` | `#757571` | Meta, labels |
| `line` | `rgba(245,244,240,0.08)` | Dividers |
| `lineStrong` | `rgba(245,244,240,0.18)` | Input borders |

### Accents — one at a time (pick per brand, not mixed)

| Accent | Hex | Soft | Ink-on | Where |
|---|---|---|---|---|
| Burgundy | `#6B2020` | `#F1E5E0` | `#4A1818` | Fit badges, price highlights, active states |
| Olive | `#4A5237` | `#E5E7D8` | `#2E3422` | Same (alternate brand lean) |
| Ink | `#0E0E0C` | `#EFEDE7` | `#000` | Most conservative — accent ≈ ink |

**Rule**: accent is for signal, never decoration. Used for Fit-for-Hana badges, active chip state, price color in hero blocks, and step-complete indicators. It is never a background for large areas.

### Typography

| Role | Font | Size / LH | Weight | Letter-spacing | Notes |
|---|---|---|---|---|---|
| Display XL | Fraunces | 48 / 50 | 500 | -0.035em | Hero headlines; italic word-accents |
| Display L | Fraunces | 32 / 36 | 500 | -0.025em | Section/PDP titles |
| Title | Fraunces | 24 / 29 | 500 | -0.02em | Card titles, modal titles |
| Product | Fraunces | 15 / 20 | 500 | 0 | Product card names |
| Body | Inter | 13 / 21 | 400 | 0 | Body prose (Korean + Latin) |
| Label | Inter | 12 / 17 | 500 | 0 | Micro labels |
| Eyebrow | Inter | 10 | 600 | +0.16em UPPERCASE | Section kickers, tags |
| Price | Fraunces | 22 / 26 | 600 | 0 | Display price |
| Mono | JetBrains Mono | 11 / 15 | 400 | 0 | Codes, timestamps, specs |

Hangul uses Inter's Pretendard fallback at the same sizes — in production ship **Pretendard Variable** for Korean and let Fraunces fall through to it so hero Korean doesn't collapse into Inter.

### Spacing — 4-base scale
`xs 4 · sm 8 · md 12 · lg 16 · xl 22 · 2xl 32 · 3xl 44`

### Radii
`sm 4 · md 10 · lg 16 · xl 22 · pill ∞`

Product cards and inputs use `md (10)`. Buttons use `md (10)`. Fit-badge pills use `pill`. Hero imagery uses `md (10)`. No rounded modals.

### Motion
- Hover / press: 150ms ease, opacity 0.85 (primary buttons) or `bgDeep` shift (cards).
- Page transitions: 250ms ease-out fade + 8px rise.
- Caret blink: 1s infinite (`@keyframes mz-blink`).
- Nothing playful, no springs, no parallax.

## Components

### Button
Four variants. Heights: `sm 40 · md 48 · lg 56`. Padding x: 20. Radius: 10. Inter 500, 13/14, letter-spacing +0.02em.
- **Primary**: `bg: ink, fg: bg` — core CTA. One per view.
- **Accent**: `bg: accent, fg: white` — only for Fit/commit moments ("Apply fit", "Track shipment").
- **Ghost**: `bg: transparent, border: 1px lineStrong, fg: ink` — secondary action.
- **Quiet**: text-only, `fg: inkMute`, no chrome — tertiary / cancel.

### Input
- Border: 1px `line`, focus: 1.5px `ink`.
- Radius: 10. Padding: 14/16. Font: Inter 14/400.
- **Floating label on focus/value**: a small caps chip absolute-positioned at `top: -7px, left: 12px`, `bg: page bg`, padding 0/6, Inter 600/10 +0.14em uppercase. See Login screen.

### Chip
- Unselected: `bg: surface, border: 1px line, radius: pill`, Inter 500/12, padding 7/14.
- Selected: `bg: ink, fg: bg, border: ink`.
- Fit-for-Hana chip variant: `bg: accentSoft, fg: accentInk` with ★ prefix.

### Size selector
4-cell row, border 1.5px, radius 10. Each cell shows size + micro-stock-text ("3 left" / "sold").
- Active: solid ink fill with ★ accent marker if matches Fit profile.
- Out-of-stock: 0.35 opacity.
- See PDP artboard.

### Product card
- Image block: `bgDeep`, 1:1 ratio, radius 10, relative.
- Top-left: accent "★ FIT L" badge (pill, white text).
- Top-right: heart icon button, 28×28 circular surface-colored.
- Meta under image: Fraunces 14/500 (name) · Inter 11/400/`inkMute` (color) · Inter 13/600 (price).
- Gap from image to meta: 8px.

### Fit-for-Hana card (signature component)
- `bg: accentSoft, fg: accentInk, radius: md`
- Layout: 40px circular hound avatar | flex-1 text stack | "Why →"
- Text: eyebrow `FIT FOR HANA` + Fraunces 15/500 "Recommended · size L"
- Appears on Home, PLP header, PDP, Cart, Checkout, My page.

### Icons
24×24 grid, 1.4 stroke, round caps, no fills (except heart when active). Set: back, close, search, heart, bag (with accent badge for count), tab bar icons.

### Illustration
SVG only, line + one accent fill. Avatars for hound profile, flat product illustrations, hero portraits. In production: replace with commissioned illustration OR shot-in-one-session editorial photography (warm, simple backdrops, always one large dog + product; no humans unless shown from behind).

## Screens

All screens are **mobile-first (iOS)**, 430×880 design frame (iPhone 16 Pro logical).

### 1. Login (`B_Login`)
- Muzzle wordmark top-left, large serif "Welcome back." headline mid-page.
- Email + password inputs, password in focused state with floating label.
- Primary "Sign in" full-width, 56px.
- "Forgot password?" centered, muted.
- Divider "OR" at 36px margin.
- Three ghost buttons: Apple, Google, Kakao — full width, 56px.
- Bottom: "New to Muzzle? Create account" with underline on "Create account".

### 2. Onboarding · Hound profile (`B_Onboarding`)
- Step indicator "STEP 3 / 5" + progress bar (3px, 60% fill in ink).
- Headline "Tell us about your hound." 32/500.
- **Body type**: 2×2 grid of cards. Each card: 4:3 illustration, serif name + mute descriptor. Active card has ink border + filled accent dot after name.
- **Weight slider**: custom track 2px, 20px ink thumb with 4px bg ring, min/max labels in mono.
- Sticky Continue button at bottom.

### 3. Home (`B_Home`)
- Top bar: left wordmark, right search + bag icons.
- Hero: full-bleed portrait illustration behind serif headline, eyebrow above.
- Fit-for-Hana card bar below hero.
- "Curated for Hana" — horizontal scroll of 4 product cards.
- "Shop by hound" — 3-column breed tile grid with circular illustrated avatars.
- "Journal" block: 2 editorial-style story cards with eyebrow + serif title.
- Tab bar bottom: Home · Shop · Search · Saved · Me.

### 4. PLP · Outerwear (`B_PLP`)
- Top bar: back, title "Outerwear", filter icon with dot.
- Sticky filter strip with Fit-for-Hana chip active, then sort/color/price chips.
- 2-column product grid, 12px gap, 20px side padding.
- Each card as spec'd above.
- Bottom sheet filters accessible from icon.

### 5. PDP · Field Trench (`B_PDP`)
- Image carousel, 1:1, page dots, heart in top-right.
- Title + price block: Fraunces 24 (name) + 22/600 (price) + color swatch row.
- Fit-for-Hana card (full width).
- Size selector with live stock per size.
- Description prose + spec table (Mono).
- "4 reviews from Goldens like Hana" section with 2 sample photo reviews showing hound specs.
- Sticky bottom bar: heart + "Add to bag · ₩148,000" primary.

### 6. Cart (`B_Cart`)
- Top bar: back, "Bag (3)".
- Fit-for-Hana banner reaffirming profile.
- Line items: 80×96 image | name + color + size + price | qty stepper + remove.
- Gift message row (optional toggle).
- Summary block: subtotal, shipping (free > ₩100k), total (price type).
- Sticky bottom: "Checkout" primary full-width.

### 7. Checkout (`B_Checkout`)
- Top bar: back, "Checkout".
- 3-step progress: Address · Shipping · Payment.
- Saved address card, shipping method radios (standard / express), payment method (Kakao Pay / card / Naver Pay).
- Summary collapse.
- Sticky bottom: "Place order · ₩148,000".

### 8. Search (`B_Search`)
- Cancel link + pill search input with caret.
- "SUGGESTED" list of queries with magnifier + insert-up arrow.
- "TOP PICKS · FIT L" 2-column of filtered products.

### 9. Order complete (`B_OrderDone`)
- Top: accent-soft circle with ✓ glyph.
- Giant "Order placed. Thank you, *Hana.*" — italic on name.
- Order number + expected dates in mono/meta.
- Order summary card: 4 items thumbnail stack + total.
- Delivering-to block.
- Two CTAs: ghost "View order" + primary "Track shipment".

### 10. Tracking (`B_Tracking`)
- Top bar: back, "Tracking", "Help".
- "Arriving Apr *27 – 29.*" headline with italic numerics.
- Map strip: SVG simplified route (Porto → Seoul → Home) with accent dashed line, 3 pin states.
- Progress timeline: 5 vertical steps with ink/accent dots. Current step has accent-soft halo.
- Carrier card: CJ Logistics + tracking number, "Copy" action.

### 11. My page (`B_MyPage`)
- "Account" title + settings cog.
- Avatar + name + member since.
- Fit-for-Hana hound summary card.
- 3-stat grid (Orders · Points · Coupons) in surface cards with serif numerals.
- List of sub-pages (Orders, Wishlist, Addresses, Payment, Size profile, Notifications, Care).
- Sign out at bottom.

## Interactions & behavior

- **Fit persistence**: hound profile is the source of truth. On every product screen, the system highlights the matching size in the selector and shows the Fit badge on cards that stock that size. Product cards without matching stock are NOT hidden, but the badge is absent.
- **Size selector**: live stock ("3 left") must come from inventory API, not hard-coded. Below 5, show number. At 0, disable + "sold" label.
- **Heart**: optimistic toggle, persists to wishlist.
- **Sticky CTAs**: always visible on PDP/Cart; they detach from page flow on scroll.
- **Onboarding**: can be skipped, but every surface that relies on Fit falls back to a muted "Set up Hana's profile →" prompt.
- **Tracking map**: route is illustrative; don't attempt real map. In prod use a static map snapshot from Mapbox/Naver sized 400×160 at 2x.
- **Korean/English**: every string is externalised; copy switches cleanly between languages. Fraunces + Pretendard Variable together. Avoid mid-sentence font mixing.

## State & data

- **User**: profile, auth state
- **Hound profile**: breed, weight, body type (Sporty/Sturdy/Slim/Cloud), size L/XL/XXL
- **Catalog**: products, variants (size × color), stock per variant
- **Cart**: items, qty, gift message, computed totals
- **Orders**: list, line items, tracking
- **Wishlist**: product ids
- **UI**: search recent queries, filter selections per-session

## Files in this bundle

### Design references (do not import directly)
- `Muzzle Hifi.html` — main canvas; open in browser to browse all artboards
- `Muzzle Wireframes.html` — earlier lo-fi exploration (for reference only)
- `hifi/tokens.jsx` — **source of truth for color + font tokens**; port to your design tokens
- `hifi/dir-b.jsx` — Direction B 5 core screens (Home, PLP, PDP, Cart, Checkout)
- `hifi/dir-b-extra.jsx` — Login, Onboarding, Search, Order complete, Tracking, My page
- `hifi/dir-b-ds.jsx` — design system reference page (swatches, type scale, components laid out for handoff)
- `hifi/dir-a.jsx` — Direction A alternate (only needed if direction flips)
- `hifi/illus.jsx` — shared illustration + primitive components (Btn, Chip, ProductIllus, etc.)
- `hifi/shell.jsx` — Phone/TabBar/StatusBar wrappers

### Open this first
**`Muzzle Hifi.html`** — the canvas has a Tweaks toggle (top-right) for Light/Dark + accent swaps so you can preview every combination.

## Notes for implementation priority

1. **Set up tokens first** from `hifi/tokens.jsx` and the Design Tokens section above.
2. **Build the Fit-for-Hana primitive early** — it touches every screen.
3. **Product card + size selector** are the next most-reused atoms.
4. **Home → PLP → PDP → Cart → Checkout** is the happy path. Everything else can ship after.
5. **Tracking map is last** — stub it with an image until Mapbox is wired.
