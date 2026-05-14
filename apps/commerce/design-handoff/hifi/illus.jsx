// ─── Muzzle hifi · illustrations + primitives ─────────────────
// All imagery is SVG-based illustration — no photography.
// Brand motif: minimal silhouette line drawings of large-breed dogs,
// sometimes paired with coat/harness flat shapes, sometimes full portrait blocks.

/* ------- dog silhouettes (line illustrations) ------- */
function IllusGolden({ stroke, fill, accent, w = '100%', h = '100%' }) {
  // Golden retriever portrait — minimal line
  return (
    <svg viewBox="0 0 200 260" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="260" fill={fill}/>
      {/* abstract coat shape behind */}
      <path d="M42 188 Q 52 150, 78 148 L 122 148 Q 148 150, 158 188 L 152 240 L 48 240 Z" fill={accent} opacity="0.18"/>
      {/* dog head */}
      <g fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 88 Q 50 76, 56 64 Q 58 56, 68 60"/> {/* left ear */}
        <path d="M140 88 Q 150 76, 144 64 Q 142 56, 132 60"/> {/* right ear */}
        <path d="M60 88 Q 54 120, 70 138 Q 86 150, 100 150 Q 114 150, 130 138 Q 146 120, 140 88 Q 128 74, 100 74 Q 72 74, 60 88 Z"/>
        <path d="M85 112 q 3 2 6 0" />
        <path d="M115 112 q -3 2 -6 0" />
        <path d="M100 128 q -4 2 -8 0" />
        <path d="M100 128 q 4 2 8 0" />
        <ellipse cx="100" cy="124" rx="3" ry="2" fill={stroke}/>
        {/* neck + body hint */}
        <path d="M80 148 Q 82 164, 74 180" />
        <path d="M120 148 Q 118 164, 126 180" />
      </g>
      {/* coat collar accent */}
      <path d="M68 172 Q 100 186, 132 172 L 128 180 Q 100 192, 72 180 Z" fill={accent} opacity="0.9"/>
    </svg>
  );
}

function IllusHound({ stroke, fill, accent, w = '100%', h = '100%' }) {
  // Running side-profile large dog
  return (
    <svg viewBox="0 0 280 200" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="200" fill={fill}/>
      <circle cx="220" cy="50" r="26" fill={accent} opacity="0.22"/>
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* body */}
        <path d="M58 118 Q 64 94, 100 92 L 190 92 Q 218 94, 230 116 Q 236 128, 228 138 L 212 140 Q 208 160, 196 164 Q 186 158, 188 140 L 112 140 Q 110 162, 98 166 Q 86 160, 90 140 L 72 138 Q 56 128, 58 118 Z"/>
        {/* head */}
        <path d="M230 116 Q 250 108, 262 92 Q 268 80, 258 74 Q 248 72, 244 82 Q 238 82, 232 92"/>
        {/* ear */}
        <path d="M246 84 Q 240 72, 232 74 L 230 96"/>
        {/* eye */}
        <circle cx="252" cy="90" r="1.4" fill={stroke}/>
        {/* tail */}
        <path d="M58 118 Q 42 104, 32 112 Q 28 118, 36 120"/>
      </g>
      {/* jacket band */}
      <path d="M98 96 Q 148 88, 196 96 L 196 128 Q 148 134, 98 128 Z" fill={accent} opacity="0.88"/>
      <path d="M98 108 L 196 108" stroke={fill} strokeWidth="0.6" opacity="0.4"/>
    </svg>
  );
}

function IllusPortrait({ stroke, fill, accent, w = '100%', h = '100%' }) {
  // Large dog sitting, facing forward — editorial portrait
  return (
    <svg viewBox="0 0 240 300" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width="240" height="300" fill={fill}/>
      <rect x="16" y="16" width="208" height="268" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.3"/>
      {/* head */}
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M74 96 Q 62 80, 70 64 Q 78 54, 92 62"/>
        <path d="M166 96 Q 178 80, 170 64 Q 162 54, 148 62"/>
        <path d="M72 100 Q 64 150, 90 176 Q 108 188, 120 188 Q 132 188, 150 176 Q 176 150, 168 100 Q 152 80, 120 80 Q 88 80, 72 100 Z"/>
        <ellipse cx="120" cy="154" rx="4" ry="2.5" fill={stroke}/>
        <path d="M100 130 q 3 2 6 0"/>
        <path d="M140 130 q -3 2 -6 0"/>
        {/* jaw line */}
        <path d="M108 166 Q 120 172, 132 166"/>
        {/* body/chest */}
        <path d="M84 184 Q 70 220, 72 284"/>
        <path d="M156 184 Q 170 220, 168 284"/>
        <path d="M72 284 L 168 284"/>
        <path d="M100 220 Q 120 226, 140 220"/>
      </g>
      {/* jacket shape */}
      <path d="M82 180 Q 120 196, 158 180 L 168 240 Q 120 254, 72 240 Z" fill={accent} opacity="0.92"/>
      {/* buttons */}
      <circle cx="120" cy="208" r="2" fill={fill} opacity="0.7"/>
      <circle cx="120" cy="224" r="2" fill={fill} opacity="0.7"/>
    </svg>
  );
}

function IllusFlat({ stroke, fill, accent, w = '100%', h = '100%', variant = 'trench' }) {
  // Flat product illustration — garment laid flat
  if (variant === 'trench') {
    return (
      <svg viewBox="0 0 240 280" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
        <rect width="240" height="280" fill={fill}/>
        <g fill={accent} stroke={stroke} strokeWidth="1">
          <path d="M60 70 L 90 50 L 120 60 L 150 50 L 180 70 L 200 90 L 200 240 L 40 240 L 40 90 Z"/>
          <path d="M40 90 L 60 70 L 60 150" fill="none"/>
          <path d="M200 90 L 180 70 L 180 150" fill="none"/>
          <line x1="120" y1="60" x2="120" y2="240" stroke={stroke} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5"/>
          {/* buttons */}
          <circle cx="105" cy="100" r="2" fill={fill}/>
          <circle cx="105" cy="130" r="2" fill={fill}/>
          <circle cx="105" cy="160" r="2" fill={fill}/>
          <circle cx="105" cy="190" r="2" fill={fill}/>
          {/* belt */}
          <rect x="40" y="170" width="160" height="10" fill={stroke} opacity="0.2"/>
        </g>
      </svg>
    );
  }
  // harness variant
  return (
    <svg viewBox="0 0 240 280" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width="240" height="280" fill={fill}/>
      <g fill={accent} stroke={stroke} strokeWidth="1">
        <path d="M70 70 L 170 70 L 180 110 L 210 130 L 200 200 L 160 210 L 120 190 L 80 210 L 40 200 L 30 130 L 60 110 Z"/>
        <circle cx="120" cy="130" r="16" fill={fill}/>
        <circle cx="120" cy="130" r="10" fill="none" stroke={stroke} strokeWidth="1"/>
      </g>
    </svg>
  );
}

function IllusScene({ stroke, fill, accent, w = '100%', h = '100%' }) {
  // Wide scene — dog walking in landscape. Hero-scale.
  return (
    <svg viewBox="0 0 600 400" width={w} height={h} style={{ display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill={fill}/>
      {/* sun */}
      <circle cx="480" cy="130" r="50" fill={accent} opacity="0.28"/>
      {/* horizon hill */}
      <path d="M0 290 Q 180 240, 340 280 Q 480 310, 600 275 L 600 400 L 0 400 Z" fill={accent} opacity="0.15"/>
      <path d="M0 320 Q 220 280, 420 310 Q 520 325, 600 310 L 600 400 L 0 400 Z" fill={accent} opacity="0.28"/>
      {/* dog walking */}
      <g stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(200,230)">
        <path d="M0 40 Q 6 10, 40 8 L 120 8 Q 148 10, 156 32 Q 160 44, 152 52 L 140 54 Q 136 74, 124 78 Q 114 72, 116 54 L 40 54 Q 38 76, 26 80 Q 14 74, 18 54 L 8 52 Q -4 44, 0 40 Z"/>
        <path d="M156 32 Q 174 24, 184 10 Q 190 0, 180 -4 Q 170 -6, 168 4 Q 162 4, 158 12"/>
        <path d="M172 4 Q 168 -8, 162 -6 L 158 14"/>
        <circle cx="178" cy="6" r="1.2" fill={stroke}/>
        <path d="M0 40 Q -14 30, -22 38"/>
      </g>
      {/* jacket */}
      <path d="M228 238 Q 278 230, 326 238 L 326 270 Q 278 276, 228 270 Z" fill={accent} opacity="0.95" transform="translate(0,0)"/>
      {/* walker legs (minimal) */}
      <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" transform="translate(150,200)">
        <circle cx="20" cy="0" r="6" fill={fill}/>
        <line x1="20" y1="6" x2="20" y2="50"/>
        <line x1="20" y1="22" x2="8" y2="38"/>
        <line x1="20" y1="22" x2="32" y2="38"/>
        <line x1="20" y1="50" x2="12" y2="80"/>
        <line x1="20" y1="50" x2="26" y2="80"/>
        {/* leash */}
        <path d="M28 36 Q 100 50, 200 38" stroke={accent} strokeWidth="1.2"/>
      </g>
    </svg>
  );
}

function IllusAvatar({ stroke, fill, accent, w = 32, h = 32, seed = 0 }) {
  // simple rounded dog avatar
  const hues = [[accent, fill], [stroke, accent], [accent, fill]];
  const [a, b] = hues[seed % 3];
  return (
    <svg viewBox="0 0 40 40" width={w} height={h} style={{ display: 'block', borderRadius: '50%' }}>
      <rect width="40" height="40" fill={b}/>
      <g>
        <ellipse cx="20" cy="22" rx="11" ry="10" fill={a} opacity="0.9"/>
        <path d="M10 16 Q 6 10, 12 8 L 14 16 Z" fill={a}/>
        <path d="M30 16 Q 34 10, 28 8 L 26 16 Z" fill={a}/>
        <circle cx="16" cy="22" r="1" fill={stroke}/>
        <circle cx="24" cy="22" r="1" fill={stroke}/>
        <ellipse cx="20" cy="26" rx="1.3" ry="0.9" fill={stroke}/>
      </g>
    </svg>
  );
}

/* ------- primitive UI components (theme-aware) ------- */
function Tag({ t, children, style, accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
      fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
      background: accent ? t.accentSoft : 'transparent',
      color: accent ? t.accentInk : t.inkSoft,
      border: accent ? 'none' : `1px solid ${t.lineStrong}`,
      borderRadius: 2, fontWeight: 500, ...style,
    }}>{children}</span>
  );
}

function Eyebrow({ t, children, style }) {
  return (
    <div style={{
      fontFamily: t.sans, fontSize: 10, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: t.inkMute, fontWeight: 500, ...style,
    }}>{children}</div>
  );
}

function Btn({ t, variant = 'primary', size = 'md', block, children, onClick, style }) {
  const pads = { sm: '9px 14px', md: '13px 20px', lg: '16px 26px' };
  const fontsz = { sm: 12, md: 13, lg: 14 };
  const styles = {
    primary: { background: t.ink, color: t.bg, border: 'none' },
    accent:  { background: t.accent, color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: t.ink, border: `1px solid ${t.lineStrong}` },
    quiet:   { background: 'transparent', color: t.ink, border: 'none' },
  };
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: t.sans, fontSize: fontsz[size], fontWeight: 500, letterSpacing: '0.02em',
      padding: pads[size], borderRadius: t.dir === 'B' ? t.r.md : t.r.sm,
      width: block ? '100%' : undefined, cursor: 'pointer',
      transition: 'opacity 0.15s, transform 0.15s',
      ...styles[variant], ...style,
    }}
    onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; }}
    onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
    >{children}</button>
  );
}

function Rule({ t, style }) {
  return <div style={{ height: 1, background: t.line, ...style }}/>;
}

function Chip({ t, active, children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 13px', borderRadius: 999, fontSize: 11, letterSpacing: '0.02em',
      border: `1px solid ${active ? t.ink : t.line}`,
      background: active ? t.ink : 'transparent',
      color: active ? t.bg : t.inkSoft,
      whiteSpace: 'nowrap', cursor: 'pointer',
      transition: 'all 0.15s',
      ...style,
    }}>{children}</button>
  );
}

// Product illustration picker (deterministic by seed)
function ProductIllus({ t, seed = 0, style, ratio }) {
  const illus = [
    () => <IllusFlat stroke={t.ink} fill={t.bgDeep} accent={t.accent} variant="trench"/>,
    () => <IllusPortrait stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>,
    () => <IllusGolden stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>,
    () => <IllusFlat stroke={t.ink} fill={t.bgDeep} accent={t.accent} variant="harness"/>,
    () => <IllusHound stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>,
    () => <IllusPortrait stroke={t.ink} fill={t.surface} accent={t.accent}/>,
  ];
  const Comp = illus[seed % illus.length];
  return (
    <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: ratio, ...style }}>
      <Comp/>
    </div>
  );
}

Object.assign(window, {
  IllusGolden, IllusHound, IllusPortrait, IllusFlat, IllusScene, IllusAvatar,
  Tag, Eyebrow, Btn, Rule, Chip, ProductIllus,
});
