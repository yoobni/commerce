/**
 * Muzzle Design System — Direction B (Modern) + Burgundy accent
 * TypeScript token constants — exact hex values from the design guide.
 * CSS variables (--mz-*) are the runtime source of truth; these are for
 * build-time tooling, documentation, and non-CSS contexts.
 */

export const MZ_COLORS = {
  /* Light mode */
  bg: '#F7F6F3',
  bgDeep: '#EFEDE7',
  surface: '#FFFFFF',
  ink: '#0E0E0C',
  inkSoft: '#4D4D48',
  inkMute: '#8F8F88',
  line: 'rgba(14,14,12,0.08)',
  lineStrong: 'rgba(14,14,12,0.18)',

  /* Accent — Burgundy */
  accent: '#6B2020',
  accentSoft: '#F1E5E0',
  accentInk: '#4A1818',

  /* System */
  error: '#C0392B',
  success: '#27AE60',
  warning: '#D68910',
  info: '#2563EB',
} as const;

export const MZ_COLORS_DARK = {
  bg: '#0C0C0B',
  bgDeep: '#050504',
  surface: '#171715',
  ink: '#F5F4F0',
  inkSoft: '#B4B3AE',
  inkMute: '#757571',
  line: 'rgba(245,244,240,0.08)',
  lineStrong: 'rgba(245,244,240,0.18)',
} as const;

/** Accent options — only Burgundy is active */
export const MZ_ACCENT_OPTIONS = {
  burgundy: { base: '#6B2020', soft: '#F1E5E0', ink: '#4A1818', active: true },
  olive:    { base: '#4A5237', soft: '#E5E7D8', ink: '#2E3422', active: false },
  inkAccent:{ base: '#0E0E0C', soft: '#EFEDE7', ink: '#000000', active: false },
} as const;

/** Spacing scale — 4-base */
export const MZ_SPACING = {
  xs:  '4px',
  sm:  '8px',
  md:  '12px',
  lg:  '16px',
  xl:  '22px',
  '2xl': '32px',
  '3xl': '44px',
} as const;

/** Border-radius scale */
export const MZ_RADII = {
  sm:   '4px',
  md:   '10px',
  lg:   '16px',
  xl:   '22px',
  pill: '999px',
} as const;

/** Typography scale — per design guide */
export const MZ_TYPOGRAPHY = {
  displayXl: { font: 'serif', size: '48px', lineHeight: '50px', weight: 500, letterSpacing: '-0.035em' },
  displayL:  { font: 'serif', size: '32px', lineHeight: '36px', weight: 500, letterSpacing: '-0.025em' },
  title:     { font: 'serif', size: '24px', lineHeight: '29px', weight: 500, letterSpacing: '-0.02em' },
  product:   { font: 'serif', size: '15px', lineHeight: '20px', weight: 500, letterSpacing: '0' },
  body:      { font: 'sans',  size: '13px', lineHeight: '21px', weight: 400, letterSpacing: '0' },
  label:     { font: 'sans',  size: '12px', lineHeight: '17px', weight: 500, letterSpacing: '0' },
  eyebrow:   { font: 'sans',  size: '10px', lineHeight: '1',    weight: 600, letterSpacing: '+0.16em', textTransform: 'uppercase' },
  price:     { font: 'serif', size: '22px', lineHeight: '26px', weight: 600, letterSpacing: '0' },
  mono:      { font: 'mono',  size: '11px', lineHeight: '15px', weight: 400, letterSpacing: '0' },
} as const;

/** Button spec */
export const MZ_BUTTON = {
  heights: { sm: 40, md: 48, lg: 56 },
  paddingX: 20,
  radius: 10,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '+0.02em',
} as const;

/** Motion */
export const MZ_MOTION = {
  fast: '150ms ease',
  base: '250ms ease-out',
  slow: '400ms ease',
} as const;

/** Font stacks */
export const MZ_FONTS = {
  serif: "'Fraunces', 'Pretendard Variable', 'Noto Sans JP', Georgia, serif",
  sans:  "'Inter', 'Pretendard Variable', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif",
  mono:  "'JetBrains Mono', ui-monospace, 'Courier New', monospace",
} as const;

/** CSS variable names — use with var(MZ_CSS_VARS.bg) */
export const MZ_CSS_VARS = {
  bg:          '--mz-bg',
  bgDeep:      '--mz-bg-deep',
  surface:     '--mz-surface',
  ink:         '--mz-ink',
  inkSoft:     '--mz-ink-soft',
  inkMute:     '--mz-ink-mute',
  line:        '--mz-line',
  lineStrong:  '--mz-line-strong',
  accent:      '--mz-accent',
  accentSoft:  '--mz-accent-soft',
  accentInk:   '--mz-accent-ink',
  error:       '--mz-error',
  success:     '--mz-success',
  warning:     '--mz-warning',
} as const;

export type MzColorKey = keyof typeof MZ_COLORS;
export type MzSpacingKey = keyof typeof MZ_SPACING;
export type MzRadiusKey = keyof typeof MZ_RADII;
export type MzTypographyKey = keyof typeof MZ_TYPOGRAPHY;
