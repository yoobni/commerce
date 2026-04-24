// ─── Muzzle hifi tokens ───────────────────────────────────────
// Two directions × light/dark × 3 accent colors.
// A = Editorial (warm paper, Instrument Serif italic accents, more magazine)
// B = Modern   (bone white, grotesk headings, disciplined grid)

const ACCENTS = {
  burgundy: { name: 'Burgundy', hex: '#6B2020', soft: '#E8D4D0', ink: '#3E0F0F' },
  olive:    { name: 'Olive',    hex: '#4A5237', soft: '#DDDFC8', ink: '#2B3120' },
  ink:      { name: 'Ink',      hex: '#17130F', soft: '#D8D3CB', ink: '#000' },
};

// Direction A — Editorial warm
const A = {
  key: 'A',
  name: 'Editorial',
  sub: 'warm paper · Instrument Serif',
  light: {
    bg: '#F3EFE7', bgDeep: '#EBE5D7', surface: '#FBF8F1',
    ink: '#1A1612', inkSoft: '#524840', inkMute: '#8C8176',
    line: 'rgba(26,22,18,0.09)', lineStrong: 'rgba(26,22,18,0.20)',
  },
  dark: {
    bg: '#15120E', bgDeep: '#0C0A08', surface: '#1E1A14',
    ink: '#F2EDE2', inkSoft: '#BDB5A7', inkMute: '#7C7468',
    line: 'rgba(242,237,226,0.09)', lineStrong: 'rgba(242,237,226,0.22)',
  },
  serif: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  sans:  '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  r: { sm: 3, md: 6, lg: 10, xl: 18, pill: 999 },
};

// Direction B — Modern crisp
const B = {
  key: 'B',
  name: 'Modern',
  sub: 'bone white · crisp grotesk',
  light: {
    bg: '#F7F6F3', bgDeep: '#EFEDE7', surface: '#FFFFFF',
    ink: '#0E0E0C', inkSoft: '#4D4D48', inkMute: '#8F8F88',
    line: 'rgba(14,14,12,0.08)', lineStrong: 'rgba(14,14,12,0.18)',
  },
  dark: {
    bg: '#0C0C0B', bgDeep: '#050504', surface: '#171715',
    ink: '#F5F4F0', inkSoft: '#B4B3AE', inkMute: '#757571',
    line: 'rgba(245,244,240,0.08)', lineStrong: 'rgba(245,244,240,0.18)',
  },
  serif: '"Fraunces", "Instrument Serif", Georgia, serif',
  sans:  '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  r: { sm: 4, md: 8, lg: 14, xl: 22, pill: 999 },
};

// Build full palette
function paletteFor(dir, mode, accentKey) {
  const base = dir[mode];
  const a = ACCENTS[accentKey];
  return { ...base, accent: a.hex, accentSoft: a.soft, accentInk: a.ink, mode, accentName: a.name, serif: dir.serif, sans: dir.sans, r: dir.r, dir: dir.key, dirName: dir.name };
}

// Inject fonts once
if (typeof document !== 'undefined' && !document.getElementById('mz-fonts')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'mz-fonts';
  link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'mz-base-css';
  s.textContent = `
    .mz * { box-sizing: border-box; }
    .mz { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    .mz button, .mz a { font: inherit; color: inherit; cursor: pointer; text-decoration: none; background: none; border: none; padding: 0; }
    .mz-scroll::-webkit-scrollbar { display: none; }
    .mz-scroll { scrollbar-width: none; }
    .mz-no-scroll::-webkit-scrollbar { display: none; }
    @keyframes mz-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ACCENTS, DIR_A: A, DIR_B: B, paletteFor });
