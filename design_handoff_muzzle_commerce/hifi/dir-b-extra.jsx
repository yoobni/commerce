// ─── Direction B · Extra screens ────────────────────────────────
// Login · Onboarding · Search · Order complete · Tracking · My page

function B_Login({ t }) {
  return (
    <Phone t={t}>
      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ fontFamily: t.serif, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em' }}>Muzzle.</div>
        <div style={{ fontFamily: t.serif, fontSize: 38, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.05, marginTop: 80 }}>
          Welcome back.
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 10 }}>Outfitters for the larger hound.</div>

        <div style={{ marginTop: 40 }}>
          <div style={{ padding: '14px 16px', border: `1px solid ${t.line}`, borderRadius: t.r.md, background: t.surface, fontSize: 14, position: 'relative' }}>
            hana@muzzle.co
            <div style={{ position: 'absolute', top: -7, left: 12, background: t.bg, padding: '0 6px', fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>EMAIL</div>
          </div>
          <div style={{ padding: '14px 16px', border: `1.5px solid ${t.ink}`, borderRadius: t.r.md, background: t.surface, fontSize: 14, marginTop: 12, position: 'relative' }}>
            ••••••••
            <div style={{ position: 'absolute', top: -7, left: 12, background: t.bg, padding: '0 6px', fontSize: 10, letterSpacing: '0.14em', color: t.ink, fontWeight: 600 }}>PASSWORD</div>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: t.inkMute, fontWeight: 500 }}>Show</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Btn t={t} variant="primary" block size="lg">Sign in</Btn>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, fontSize: 12, color: t.inkMute, letterSpacing: '0.04em' }}>
          Forgot password?
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
          <div style={{ flex: 1, height: 1, background: t.line }}/>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: t.inkMute, fontWeight: 600 }}>OR</div>
          <div style={{ flex: 1, height: 1, background: t.line }}/>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn t={t} variant="ghost" block size="lg"> Continue with Apple</Btn>
          <Btn t={t} variant="ghost" block size="lg">Continue with Google</Btn>
          <Btn t={t} variant="ghost" block size="lg">Continue with Kakao</Btn>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: t.inkSoft }}>
          New to Muzzle? <span style={{ color: t.ink, fontWeight: 600, borderBottom: `1px solid ${t.ink}` }}>Create account</span>
        </div>
      </div>
    </Phone>
  );
}

function B_Onboarding({ t }) {
  return (
    <Phone t={t}>
      <div style={{ padding: '10px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', color: t.inkMute, fontWeight: 600 }}>STEP 3 / 5</div>
        <div style={{ fontSize: 12, color: t.inkMute }}>Skip</div>
      </div>
      <div style={{ margin: '12px 20px 0', height: 3, borderRadius: 2, background: t.line, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '60%', height: '100%', background: t.ink }}/>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ fontFamily: t.serif, fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Tell us about your hound.
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 10, lineHeight: 1.55 }}>
          체형에 맞는 핏을 추천해 드립니다.
        </div>
      </div>

      <div style={{ padding: '28px 20px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Body type</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
        {[
          ['Sporty', 'lean · long-legged', 0, true],
          ['Sturdy', 'broad chest · solid', 1],
          ['Slim', 'narrow · tall', 2],
          ['Cloud', 'fluffy · double coat', 3],
        ].map(([n, d, s, sel], i) => (
          <div key={i} style={{
            padding: 14, border: `1.5px solid ${sel ? t.ink : t.line}`, borderRadius: t.r.md,
            background: sel ? t.surface : 'transparent',
          }}>
            <div style={{ borderRadius: t.r.sm, overflow: 'hidden', aspectRatio: '4/3', background: t.bgDeep }}>
              <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} w="100%" h="100%" seed={s}/>
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 16, fontWeight: 500, marginTop: 10 }}>{n}{sel && <span style={{ color: t.accent, marginLeft: 6 }}>●</span>}</div>
            <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '28px 20px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Weight · 28 kg</div>
        <div style={{ marginTop: 18, height: 2, background: t.line, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '56%', background: t.ink }}/>
          <div style={{ position: 'absolute', left: '56%', top: -9, transform: 'translateX(-50%)', width: 20, height: 20, borderRadius: '50%', background: t.ink, boxShadow: `0 0 0 4px ${t.bg}` }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: t.inkMute, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>10kg</span><span>60kg</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, marginTop: 20 }}>
        <Btn t={t} variant="primary" block size="lg">Continue</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

function B_Search({ t }) {
  return (
    <Phone t={t}>
      <div style={{ padding: '8px 20px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Cancel</div>
        <div style={{ flex: 1, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r.md, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          {BI.search(t)}
          <span>trench</span>
          <span style={{ display: 'inline-block', width: 1, height: 14, background: t.ink }}/>
        </div>
      </div>

      <div style={{ padding: '10px 20px 8px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>SUGGESTED</div>
      </div>
      {['trench coat','trench · oat','trench rainwear','trench for golden'].map((q, i) => (
        <div key={i} style={{ padding: '14px 20px', borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {BI.search(t)}
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>{q}</div>
          </div>
          <div style={{ fontSize: 11, color: t.inkMute }}>↖</div>
        </div>
      ))}

      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>TOP PICKS · FIT L</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
        {[0,1].map(i => (
          <div key={i}>
            <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, position: 'relative' }}>
              <ProductIllus t={t} seed={i} ratio="1"/>
              <div style={{ position: 'absolute', top: 8, left: 8, background: t.accent, color: '#fff', fontSize: 9, padding: '3px 7px', letterSpacing: '0.08em', fontWeight: 700, borderRadius: 999 }}>★ FIT L</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500 }}>{['Field Trench','Wool Chore'][i]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>₩ {['148','196'][i]},000</div>
            </div>
          </div>
        ))}
      </div>
      <TabBar t={t} active="search"/>
    </Phone>
  );
}

function B_OrderDone({ t }) {
  return (
    <Phone t={t}>
      <div style={{ padding: '36px 24px 0', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: t.accentInk, fontSize: 26 }}>✓</div>
        <div style={{ fontFamily: t.serif, fontSize: 34, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 24, lineHeight: 1.1 }}>
          Order placed.<br/>Thank you, <span style={{ fontStyle: 'italic' }}>Hana.</span>
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 14, lineHeight: 1.55 }}>
          Order #MZ-29418 · Expected Apr 27 – 29
        </div>
      </div>

      <div style={{ padding: '32px 20px 0' }}>
        <div style={{ padding: 16, borderRadius: t.r.md, background: t.surface, border: `1px solid ${t.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${t.line}` }}>
            <div style={{ fontFamily: t.serif, fontSize: 16, fontWeight: 500 }}>4 items for Hana</div>
            <div style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 600 }}>₩316,800</div>
          </div>
          <div style={{ paddingTop: 12, display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 44, height: 54, borderRadius: t.r.sm, overflow: 'hidden', background: t.bgDeep }}>
                <ProductIllus t={t} seed={i} ratio="auto" style={{ height: '100%' }}/>
              </div>
            ))}
            <div style={{ width: 44, height: 54, borderRadius: t.r.sm, background: t.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: t.inkMute }}>+1</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>DELIVERING TO</div>
        <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, marginTop: 6 }}>Hana Kim · 자택</div>
        <div style={{ fontSize: 12, color: t.inkMute, marginTop: 4, lineHeight: 1.5 }}>서울 성동구 왕십리로 222, 2층 · 04777</div>
      </div>

      <div style={{ padding: '28px 20px 14px', display: 'flex', gap: 10 }}>
        <Btn t={t} variant="ghost" block>View order</Btn>
        <Btn t={t} variant="primary" block>Track shipment</Btn>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 20px 16px', fontSize: 12, color: t.inkMute }}>Keep shopping →</div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

function B_Tracking({ t }) {
  const steps = [
    ['Order placed', 'Apr 24 · 14:32', true],
    ['Packed in Porto', 'Apr 25 · 09:10', true],
    ['In transit · Seoul', 'Apr 26 · estimated', true, true],
    ['Out for delivery', 'Apr 27 – 29', false],
    ['Delivered', '—', false],
  ];
  return (
    <Phone t={t}>
      <BTopBar t={t} left={BI.back(t)} title="Tracking" right={<span style={{ fontSize: 12, fontWeight: 500, color: t.inkSoft }}>Help</span>}/>

      <div style={{ padding: '4px 20px 14px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>ORDER #MZ-29418</div>
        <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.15 }}>
          Arriving Apr <span style={{ fontStyle: 'italic' }}>27 – 29.</span>
        </div>
      </div>

      {/* Map strip */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, height: 160, position: 'relative' }}>
          <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="160" fill={t.bgDeep}/>
            <path d="M0 100 Q 80 60, 160 100 Q 240 140, 400 80" stroke={t.accent} strokeWidth="2" fill="none" strokeDasharray="4 4"/>
            <circle cx="40" cy="95" r="5" fill={t.ink}/>
            <circle cx="220" cy="115" r="6" fill={t.accent} stroke={t.bg} strokeWidth="3"/>
            <circle cx="360" cy="86" r="5" fill="none" stroke={t.inkMute} strokeWidth="1.5" strokeDasharray="2 2"/>
            <text x="36" y="130" fontSize="9" fill={t.ink} fontWeight="600">PORTO</text>
            <text x="216" y="140" fontSize="9" fill={t.accentInk} fontWeight="700">SEOUL</text>
            <text x="350" y="106" fontSize="9" fill={t.inkMute} fontWeight="600">HOME</text>
          </svg>
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Progress</div>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', top: 6, bottom: 6, left: 6, width: 1, background: t.line }}/>
          {steps.map(([n, d, done, current], i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: i === steps.length - 1 ? 0 : 22 }}>
              <div style={{
                position: 'absolute', left: -23, top: 2,
                width: current ? 14 : 10, height: current ? 14 : 10, borderRadius: '50%',
                background: done ? (current ? t.accent : t.ink) : t.bg,
                border: done ? 'none' : `1.5px solid ${t.lineStrong}`,
                boxShadow: current ? `0 0 0 4px ${t.accentSoft}` : 'none',
              }}/>
              <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: current ? 600 : 500, color: done ? t.ink : t.inkMute }}>{n}</div>
              <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ padding: 14, borderRadius: t.r.md, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: t.r.sm, background: t.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.serif, fontSize: 20 }}>CJ</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500 }}>CJ Logistics</div>
            <div style={{ fontSize: 11, color: t.inkMute, marginTop: 1, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>1Z-994-ABC-0029418</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Copy</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, marginTop: 22 }}>
        <Btn t={t} variant="ghost" block>Contact support</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

function B_MyPage({ t }) {
  return (
    <Phone t={t}>
      <div style={{ padding: '8px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: t.serif, fontSize: 20, fontWeight: 500 }}>Account</div>
        <div style={{ fontSize: 12, color: t.inkMute }}>⚙</div>
      </div>

      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', background: t.bgDeep }}>
          <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} w={60} h={60}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>Hana Kim</div>
          <div style={{ fontSize: 12, color: t.inkMute }}>hana@muzzle.co · Member since 2024</div>
        </div>
      </div>

      {/* Hound profile */}
      <div style={{ margin: '0 20px', padding: 14, borderRadius: t.r.md, background: t.accentSoft, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', background: t.bg }}>
          <IllusAvatar stroke={t.ink} fill={t.bg} accent={t.accent} w={46} h={46} seed={1}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.accentInk, fontWeight: 700 }}>YOUR HOUND</div>
          <div style={{ fontFamily: t.serif, fontSize: 16, fontWeight: 500, color: t.accentInk, marginTop: 2 }}>Hana · Golden · 28kg · Sporty · L</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: t.accentInk }}>Edit</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '18px 20px 6px' }}>
        {[['8','Orders'],['2,400','Points'],['3','Coupons']].map(([v, l], i) => (
          <div key={i} style={{ padding: '14px 10px', borderRadius: t.r.md, background: t.surface, border: `1px solid ${t.line}`, textAlign: 'center' }}>
            <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 600 }}>{v}</div>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.08em', marginTop: 2 }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        {[
          ['Orders', '8 · last Apr 24'],
          ['Wishlist', '14 pieces'],
          ['Addresses', '2 saved'],
          ['Payment methods', 'Visa · · · 4412'],
          ['Size & fit profile', 'Hana · L'],
          ['Notifications', 'email · push'],
          ['Customer care', '24/7'],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderTop: `1px solid ${t.line}` }}>
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>{k}</div>
            <div style={{ fontSize: 12, color: t.inkMute }}>{v} ›</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '22px 20px', textAlign: 'center', fontSize: 12, color: t.inkMute, letterSpacing: '0.14em' }}>
        SIGN OUT
      </div>

      <TabBar t={t} active="me"/>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

Object.assign(window, { B_Login, B_Onboarding, B_Search, B_OrderDone, B_Tracking, B_MyPage });
