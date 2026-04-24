// ─── Hifi shared shell · iOS-like app chrome for both directions ──
// Renders the phone viewport. Top area, tab bar, status bar.

// Status bar & home indicator are rendered by IOSDevice itself — these are no-ops
// so existing screens don't need to be changed.
function StatusBar() { return null; }
function HomeIndicator() { return null; }

function TabBar({ t, active = 'home' }) {
  const items = [
    ['home',   'Shop', (f) => <path d="M3 10 L 12 3 L 21 10 L 21 20 L 14 20 L 14 14 L 10 14 L 10 20 L 3 20 Z" stroke={f} strokeWidth="1.3" fill="none" strokeLinejoin="round"/>],
    ['search', 'Search', (f) => <><circle cx="11" cy="11" r="6" stroke={f} strokeWidth="1.3" fill="none"/><path d="M16 16 L 20 20" stroke={f} strokeWidth="1.3" strokeLinecap="round"/></>],
    ['heart',  'Saved', (f) => <path d="M12 19 Q 3 13, 3 8 Q 3 4, 7 4 Q 10 4, 12 7 Q 14 4, 17 4 Q 21 4, 21 8 Q 21 13, 12 19 Z" stroke={f} strokeWidth="1.3" fill="none" strokeLinejoin="round"/>],
    ['bag',    'Bag', (f) => <><path d="M5 8 L 19 8 L 18 21 L 6 21 Z" stroke={f} strokeWidth="1.3" fill="none"/><path d="M9 8 V 6 Q 9 3, 12 3 Q 15 3, 15 6 V 8" stroke={f} strokeWidth="1.3" fill="none"/></>],
    ['me',     'Me', (f) => <><circle cx="12" cy="8" r="4" stroke={f} strokeWidth="1.3" fill="none"/><path d="M4 21 Q 4 14, 12 14 Q 20 14, 20 21" stroke={f} strokeWidth="1.3" fill="none" strokeLinecap="round"/></>],
  ];
  return (
    <div style={{ borderTop: `1px solid ${t.line}`, background: t.bg, padding: '10px 12px 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {items.map(([id, label, icon]) => {
          const is = active === id;
          const c = is ? t.ink : t.inkMute;
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <svg width="24" height="24" viewBox="0 0 24 24">{icon(c)}</svg>
              <div style={{ fontSize: 9, letterSpacing: '0.06em', color: c, fontWeight: 500 }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Phone({ t, children }) {
  return (
    <IOSDevice width={390} height={844} dark={t.mode === 'dark'}>
      <div className="mz mz-no-scroll" style={{
        width: '100%', height: '100%', background: t.bg, color: t.ink,
        fontFamily: t.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* spacer for IOSDevice's absolute status bar + dynamic island */}
        <div style={{ height: 60, flexShrink: 0 }}/>
        <div className="mz-scroll" style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
        {/* spacer for IOSDevice's home indicator */}
        <div style={{ height: 20, flexShrink: 0 }}/>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { StatusBar, HomeIndicator, TabBar, Phone });
