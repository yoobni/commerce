// Wireframe primitives — magazine-editorial sketchy style
// Shared building blocks for all screens.

const WIRE = {
  ink: '#2a2420',
  inkSoft: '#5a5048',
  paper: '#f5f1e8',
  paperDeep: '#ebe5d6',
  accent: '#7a2e2e',      // burgundy
  accent2: '#c9a66b',     // muted gold
  rule: 'rgba(42,36,32,0.55)',
  ruleSoft: 'rgba(42,36,32,0.22)',
  fill: 'rgba(42,36,32,0.06)',
  fillStrong: 'rgba(42,36,32,0.12)',
  // fonts
  serif: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  sans:  '"Inter", -apple-system, sans-serif',
  hand:  '"Caveat", "Kalam", cursive',
};

// Inject google fonts + wireframe css once
if (typeof document !== 'undefined' && !document.getElementById('wire-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;500;600;700&family=Kalam:wght@300;400;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'wire-styles';
  s.textContent = `
    .wire * { box-sizing: border-box; }
    .wire { font-family: ${WIRE.sans}; color: ${WIRE.ink}; background: ${WIRE.paper}; font-size: 13px; line-height: 1.4; letter-spacing: 0.01em; }
    .wire-serif { font-family: ${WIRE.serif}; font-weight: 400; letter-spacing: -0.01em; }
    .wire-hand  { font-family: ${WIRE.hand};  font-weight: 500; color: ${WIRE.accent}; }
    .wire-rule  { border: 1px solid ${WIRE.rule}; }
    .wire-rule-soft { border: 1px solid ${WIRE.ruleSoft}; }
    .wire-dashed { border: 1px dashed ${WIRE.rule}; }
    .wire-xout { position: relative; background: ${WIRE.fill}; }
    .wire-xout::before, .wire-xout::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to bottom right, transparent 49.6%, ${WIRE.ruleSoft} 49.8%, ${WIRE.ruleSoft} 50.2%, transparent 50.4%);
    }
    .wire-xout::after { background: linear-gradient(to top right, transparent 49.6%, ${WIRE.ruleSoft} 49.8%, ${WIRE.ruleSoft} 50.2%, transparent 50.4%); }
    .wire-lines { background-image: repeating-linear-gradient(to bottom, ${WIRE.inkSoft} 0 1px, transparent 1px 6px); }
    .wire-scroll::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(s);
}

// ── Placeholder image box with X + optional caption
function ImgBox({ w, h, label, ratio, style = {}, flat = false }) {
  const wrap = {
    width: w || '100%',
    height: h || (ratio ? undefined : 120),
    aspectRatio: ratio,
    position: 'relative',
    background: flat ? WIRE.fillStrong : WIRE.fill,
    border: `1px solid ${WIRE.ruleSoft}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  };
  return (
    <div style={wrap}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke={WIRE.ruleSoft} strokeWidth="1" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke={WIRE.ruleSoft} strokeWidth="1" />
      </svg>
      {label && (
        <span style={{
          position: 'relative', fontFamily: WIRE.hand, fontSize: 14,
          color: WIRE.inkSoft, background: WIRE.paper, padding: '1px 6px',
        }}>{label}</span>
      )}
    </div>
  );
}

// Line of placeholder text — horizontal bar representing copy
function TextLine({ w = '100%', h = 7, style = {} }) {
  return <div style={{ width: w, height: h, background: WIRE.fillStrong, borderRadius: 1, ...style }} />;
}

function TextBlock({ lines = 3, width = '100%', gap = 6, lastW = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <TextLine key={i} w={i === lines - 1 ? lastW : '100%'} />
      ))}
    </div>
  );
}

// Hand-drawn annotation arrow between two points (on DesignCanvas coord space)
// Uses absolute positioning against a parent with position:relative.
function HandArrow({ from, to, curve = 40, label, color = WIRE.accent, style = {}, labelOffset = [0, -12] }) {
  // from, to: {x,y} in px, relative to parent
  const dx = to.x - from.x, dy = to.y - from.y;
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  // perpendicular offset for curve
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const cx = mx + nx * curve, cy = my + ny * curve;
  // bounding box
  const minX = Math.min(from.x, to.x, cx) - 20;
  const minY = Math.min(from.y, to.y, cy) - 20;
  const maxX = Math.max(from.x, to.x, cx) + 20;
  const maxY = Math.max(from.y, to.y, cy) + 20;
  const W = maxX - minX, H = maxY - minY;
  const path = `M ${from.x - minX} ${from.y - minY} Q ${cx - minX} ${cy - minY} ${to.x - minX} ${to.y - minY}`;
  // arrowhead angle
  const ang = Math.atan2(to.y - cy, to.x - cx);
  const ah1x = to.x - minX - 12 * Math.cos(ang - 0.35);
  const ah1y = to.y - minY - 12 * Math.sin(ang - 0.35);
  const ah2x = to.x - minX - 12 * Math.cos(ang + 0.35);
  const ah2y = to.y - minY - 12 * Math.sin(ang + 0.35);
  return (
    <div style={{
      position: 'absolute', left: minX, top: minY, width: W, height: H,
      pointerEvents: 'none', ...style,
    }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="0" strokeLinecap="round"
          style={{ filter: 'url(#wobble)' }}/>
        <path d={`M ${ah1x} ${ah1y} L ${to.x - minX} ${to.y - minY} L ${ah2x} ${ah2y}`}
          fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label && (
        <div style={{
          position: 'absolute',
          left: cx - minX + labelOffset[0], top: cy - minY + labelOffset[1],
          transform: 'translate(-50%, -50%)',
          fontFamily: WIRE.hand, fontSize: 16, fontWeight: 600,
          color, background: WIRE.paper, padding: '0 6px', whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}>{label}</div>
      )}
    </div>
  );
}

// Sticky note style annotation
function StickyNote({ children, style = {}, rotate = -1 }) {
  return (
    <div style={{
      fontFamily: WIRE.hand, fontSize: 15, color: '#5a4a2a',
      background: '#fdf1a8', padding: '8px 12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`, maxWidth: 180, lineHeight: 1.3,
      ...style,
    }}>{children}</div>
  );
}

// Small button placeholder
function WireBtn({ children, primary, ghost, block, style = {}, size = 'md' }) {
  const sizes = {
    sm: { p: '4px 10px', f: 11 },
    md: { p: '8px 14px', f: 12 },
    lg: { p: '12px 18px', f: 13 },
  }[size];
  const s = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: sizes.p, fontSize: sizes.f, fontFamily: WIRE.sans, fontWeight: 500,
    letterSpacing: '0.04em', textTransform: 'uppercase',
    border: `1px solid ${primary ? WIRE.ink : WIRE.rule}`,
    background: primary ? WIRE.ink : (ghost ? 'transparent' : WIRE.paper),
    color: primary ? WIRE.paper : WIRE.ink,
    borderRadius: 0, cursor: 'pointer',
    width: block ? '100%' : undefined,
    ...style,
  };
  return <div style={s}>{children}</div>;
}

// Section label (caps small)
function Eyebrow({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: WIRE.sans, fontSize: 9.5, fontWeight: 500,
      letterSpacing: '0.24em', textTransform: 'uppercase',
      color: WIRE.inkSoft, ...style,
    }}>{children}</div>
  );
}

// Screen title plate: number + title (magazine)
function ScreenPlate({ num, title, sub, side }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 14, gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{
          fontFamily: WIRE.serif, fontSize: 18, fontStyle: 'italic',
          color: WIRE.accent, letterSpacing: '-0.02em',
        }}>№ {num}</div>
        <div style={{
          fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em', color: WIRE.ink,
        }}>{title}</div>
        {sub && <div style={{ fontFamily: WIRE.hand, color: WIRE.inkSoft, fontSize: 16 }}>{sub}</div>}
      </div>
      {side && <div style={{ fontFamily: WIRE.hand, color: WIRE.inkSoft, fontSize: 14 }}>{side}</div>}
    </div>
  );
}

// Horizontal divider w/ optional label
function Rule({ label, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <div style={{ flex: 1, borderTop: `1px solid ${WIRE.rule}` }} />
      {label && <div style={{ fontFamily: WIRE.sans, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: WIRE.inkSoft }}>{label}</div>}
      {label && <div style={{ flex: 1, borderTop: `1px solid ${WIRE.rule}` }} />}
    </div>
  );
}

// Wrap a screen in a titled board (label above the iOS/browser frame)
function Board({ num, title, sub, note, children, w = 'auto' }) {
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, maxWidth: '100%' }}>
        <span style={{
          fontFamily: WIRE.serif, fontSize: 15, fontStyle: 'italic', color: WIRE.accent,
        }}>№ {num}</span>
        <span style={{ fontFamily: WIRE.serif, fontSize: 20, letterSpacing: '-0.01em' }}>{title}</span>
        {sub && <span style={{ fontFamily: WIRE.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: WIRE.inkSoft }}>{sub}</span>}
      </div>
      {children}
      {note && (
        <div style={{ fontFamily: WIRE.hand, color: WIRE.inkSoft, fontSize: 14, maxWidth: 380, lineHeight: 1.3 }}>
          ↳ {note}
        </div>
      )}
    </div>
  );
}

// Tiny icon lib (line icons in ink color)
const ICONS = {
  back:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bag:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 7h14l-1.2 12.5a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7zM9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  heart:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20S4 14 4 9a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5-8 11-8 11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  user:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 10l8-6 8 6v10H4V10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  menu:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  plus:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  minus:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  star:   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .8-5.2 4.8 1.6 7.2L12 18l-6.4 3.8 1.6-7.2L2 9.8 9 9l3-7z"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5 11-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chev:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  paw:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6" cy="10" rx="2" ry="2.5"/><ellipse cx="10" cy="6" rx="2" ry="2.5"/><ellipse cx="14" cy="6" rx="2" ry="2.5"/><ellipse cx="18" cy="10" rx="2" ry="2.5"/><path d="M12 11c-3.5 0-6 3-6 6a3 3 0 0 0 3 3c1 0 1.5-.5 3-.5s2 .5 3 .5a3 3 0 0 0 3-3c0-3-2.5-6-6-6z"/></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  close:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  tick:   <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5 11-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

Object.assign(window, {
  WIRE, ImgBox, TextLine, TextBlock, HandArrow, StickyNote,
  WireBtn, Eyebrow, ScreenPlate, Rule, Board, ICONS,
});
