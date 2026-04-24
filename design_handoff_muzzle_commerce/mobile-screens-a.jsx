// Mobile screens — Part 1: Auth, Onboarding, Home, Category, Search
// Each screen is ~390×844 and rendered inside an iOS frame in the canvas.

// ─── SCREEN SHELL ─────────────────────────────────────────────
// Reused inner container with magazine masthead
function MagMasthead({ left = 'MUZZLE', right = 'N° 04', date = '04·26' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 20px 6px', borderBottom: `1px solid ${WIRE.rule}`,
      fontFamily: WIRE.serif, fontSize: 10, letterSpacing: '0.3em',
      textTransform: 'uppercase', color: WIRE.inkSoft,
    }}>
      <span>{left}</span>
      <span style={{ fontFamily: WIRE.serif, fontStyle: 'italic', letterSpacing: '0.08em' }}>{date}</span>
      <span>{right}</span>
    </div>
  );
}

function TopBar({ title, left = ICONS.back, right = ICONS.bag, center }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', height: 44,
    }}>
      <div style={{ width: 24, display: 'flex', color: WIRE.ink }}>{left}</div>
      <div style={{ fontFamily: WIRE.serif, fontSize: 16, letterSpacing: '0.02em' }}>{center || title}</div>
      <div style={{ width: 24, display: 'flex', justifyContent: 'flex-end', color: WIRE.ink }}>{right}</div>
    </div>
  );
}

function TabBar({ active = 'home' }) {
  const tabs = [
    ['home', ICONS.home, 'Shop'],
    ['search', ICONS.search, 'Search'],
    ['heart', ICONS.heart, 'Saved'],
    ['user', ICONS.user, 'Me'],
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 18px', borderTop: `1px solid ${WIRE.rule}`, background: WIRE.paper,
    }}>
      {tabs.map(([id, icon, label]) => (
        <div key={id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: active === id ? WIRE.ink : WIRE.inkSoft,
          opacity: active === id ? 1 : 0.5,
        }}>
          {icon}
          <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function MScreen({ children, noTab, mast = true, mastProps = {} }) {
  return (
    <div className="wire" style={{
      width: '100%', height: '100%', background: WIRE.paper,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {mast && <MagMasthead {...mastProps} />}
      <div className="wire-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
      {!noTab && <TabBar active={mastProps.tab} />}
    </div>
  );
}

// ─── 01 · SPLASH / LAUNCH ─────────────────────────────────────
function M01_Splash() {
  return (
    <div className="wire" style={{
      width: '100%', height: '100%', background: WIRE.ink, color: WIRE.paper,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ fontFamily: WIRE.serif, fontSize: 12, letterSpacing: '0.4em', opacity: 0.6 }}>
        EST · 2026
      </div>
      <div style={{ fontFamily: WIRE.serif, fontSize: 64, letterSpacing: '-0.03em', marginTop: 20, marginBottom: 8, fontStyle: 'italic' }}>
        Muzzle
      </div>
      <div style={{ fontFamily: WIRE.serif, fontSize: 13, letterSpacing: '0.06em', opacity: 0.75, textAlign: 'center', maxWidth: 240 }}>
        OUTFITTERS FOR<br/>
        THE LARGER HOUND
      </div>
      <div style={{ marginTop: 80, width: 40, height: 1, background: WIRE.paper, opacity: 0.3 }}/>
      <div style={{ fontFamily: WIRE.hand, fontSize: 13, opacity: 0.5, marginTop: 16 }}>
        loading the wardrobe…
      </div>
    </div>
  );
}

// ─── 02 · LOGIN ───────────────────────────────────────────────
function M02_Login() {
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <MagMasthead left="" right="SIGN IN" />
      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <Eyebrow>The Wardrobe · No 01</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 34, lineHeight: 1.05, marginTop: 8, letterSpacing: '-0.02em' }}>
          Welcome, <span style={{ fontStyle: 'italic', color: WIRE.accent }}>again.</span>
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 12, color: WIRE.inkSoft, marginTop: 10, lineHeight: 1.5, maxWidth: 280 }}>
          사이즈 이력, 포인트, 포토리뷰가 당신의 반려견 프로필과 함께 보관되어 있습니다.
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <Eyebrow>Email</Eyebrow>
            <div style={{ borderBottom: `1px solid ${WIRE.rule}`, padding: '10px 0', fontFamily: WIRE.serif, fontSize: 16 }}>
              hana@muzzle.co
            </div>
          </div>
          <div>
            <Eyebrow>Password</Eyebrow>
            <div style={{ borderBottom: `1px solid ${WIRE.rule}`, padding: '10px 0', fontFamily: WIRE.serif, fontSize: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span>· · · · · · · · ·</span>
              <span style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Show</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <WireBtn primary block size="lg">Continue</WireBtn>
        </div>

        <div style={{ margin: '28px 0 12px' }}><Rule label="or" /></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <WireBtn block>Continue with Apple</WireBtn>
          <WireBtn block ghost>Continue with Kakao</WireBtn>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontSize: 11, color: WIRE.inkSoft, paddingBottom: 8 }}>
          처음이신가요?  <span style={{ color: WIRE.ink, borderBottom: `1px solid ${WIRE.ink}`, paddingBottom: 1 }}>가입하고 반려견 등록</span>
        </div>
      </div>
    </div>
  );
}

// ─── 03 · ONBOARDING · Intro ─────────────────────────────────
function M03_OnbIntro() {
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paperDeep, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: WIRE.sans, fontSize: 10, letterSpacing: '0.24em', color: WIRE.inkSoft }}>STEP 1 · 4</span>
        <span style={{ fontFamily: WIRE.sans, fontSize: 10, letterSpacing: '0.24em', color: WIRE.inkSoft }}>SKIP</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 2, background: i === 1 ? WIRE.ink : WIRE.ruleSoft }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
        <Eyebrow>The Fitting Room · Chapter 01</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 10 }}>
          Let's meet<br/>
          <span style={{ fontStyle: 'italic', color: WIRE.accent }}>your hound.</span>
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 13, color: WIRE.inkSoft, marginTop: 14, lineHeight: 1.6, maxWidth: 300 }}>
          견종, 체형, 치수를 알려주시면 다음 시즌부터는 당신의 아이에게 꼭 맞는 룩만 보여드려요.
        </div>

        <div style={{ marginTop: 28, flex: 1, position: 'relative' }}>
          <ImgBox ratio="1" label="big-dog portrait" flat style={{ height: '100%' }}/>
          <StickyNote style={{ position: 'absolute', top: -10, right: -6, maxWidth: 120 }}>
            editorial hero shot<br/>— use real photo
          </StickyNote>
        </div>

        <div style={{ marginTop: 20 }}>
          <WireBtn primary block size="lg">Begin</WireBtn>
        </div>
      </div>
    </div>
  );
}

// ─── 04 · ONBOARDING · Breed ─────────────────────────────────
function M04_OnbBreed() {
  const breeds = [
    { name: 'Golden Retriever', size: 'L · 25–34kg', sel: true },
    { name: 'Labrador', size: 'L · 25–36kg' },
    { name: 'Malamute', size: 'XL · 32–43kg' },
    { name: 'Bernese Mtn Dog', size: 'XL · 35–50kg' },
    { name: 'Samoyed', size: 'L · 20–30kg' },
    { name: 'German Shepherd', size: 'L · 22–40kg' },
  ];
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <TopBar left={ICONS.back} right={<span style={{ fontSize: 10, letterSpacing: '0.2em', color: WIRE.inkSoft }}>SKIP</span>} center={<span style={{ fontSize: 10, letterSpacing: '0.24em', color: WIRE.inkSoft }}>STEP 2 · 4</span>}/>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 2, background: i <= 2 ? WIRE.ink : WIRE.ruleSoft }}/>)}
        </div>
      </div>
      <div style={{ padding: '24px 20px 14px' }}>
        <div style={{ fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          어떤 <span style={{ fontStyle: 'italic', color: WIRE.accent }}>견종</span>인가요?
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 12, color: WIRE.inkSoft, marginTop: 6 }}>
          견종별 실측 데이터로 사이즈를 추천해 드려요.
        </div>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ border: `1px solid ${WIRE.rule}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: WIRE.inkSoft }}>{ICONS.search}</span>
          <span style={{ fontSize: 12, color: WIRE.inkSoft }}>견종명 검색</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
        {breeds.map((b, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 0', borderBottom: `1px solid ${WIRE.ruleSoft}`,
          }}>
            <ImgBox w={44} h={44} flat style={{ borderRadius: '50%' }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 16 }}>{b.name}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>{b.size}</div>
            </div>
            <div style={{
              width: 20, height: 20, border: `1px solid ${WIRE.rule}`, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: b.sel ? WIRE.ink : 'transparent', color: WIRE.paper,
            }}>{b.sel && ICONS.tick}</div>
          </div>
        ))}
        <div style={{ padding: '16px 0', color: WIRE.inkSoft, fontSize: 12, fontFamily: WIRE.hand }}>
          믹스견이에요 →
        </div>
      </div>

      <div style={{ padding: '12px 20px 18px', borderTop: `1px solid ${WIRE.ruleSoft}` }}>
        <WireBtn primary block size="lg">Next</WireBtn>
      </div>
    </div>
  );
}

// ─── 05 · ONBOARDING · Body-type ──────────────────────────────
function M05_OnbBody() {
  const types = [
    { t: 'Sporty', d: '탄탄한 근육형', sel: true },
    { t: 'Sturdy', d: '듬직한 골격형' },
    { t: 'Slim',   d: '날렵한 라인형' },
    { t: 'Cloud',  d: '풍성한 장모형' },
  ];
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <TopBar left={ICONS.back} right={<span style={{ fontSize: 10, letterSpacing: '0.2em', color: WIRE.inkSoft }}>SKIP</span>} center={<span style={{ fontSize: 10, letterSpacing: '0.24em', color: WIRE.inkSoft }}>STEP 3 · 4</span>}/>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 2, background: i <= 3 ? WIRE.ink : WIRE.ruleSoft }}/>)}
        </div>
      </div>

      <div style={{ padding: '24px 20px 14px' }}>
        <div style={{ fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          우리 아이의 <span style={{ fontStyle: 'italic', color: WIRE.accent }}>체형</span>은?
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 12, color: WIRE.inkSoft, marginTop: 6 }}>
          같은 골든이라도 체형에 따라 핏이 달라져요.
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {types.map((t, i) => (
          <div key={i} style={{
            border: `1px solid ${t.sel ? WIRE.ink : WIRE.ruleSoft}`,
            background: t.sel ? WIRE.fill : 'transparent',
            padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
            position: 'relative',
          }}>
            <ImgBox ratio="1.1" label={t.t.toLowerCase()} flat/>
            <div style={{ fontFamily: WIRE.serif, fontSize: 15, fontStyle: t.sel ? 'italic' : 'normal' }}>{t.t}</div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.06em' }}>{t.d}</div>
            {t.sel && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: WIRE.ink, color: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.tick}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '18px 20px', fontFamily: WIRE.hand, color: WIRE.inkSoft, fontSize: 14 }}>
        잘 모르겠으면 → <span style={{ color: WIRE.accent }}>체형 진단 (3문항)</span>
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ padding: '12px 20px 18px', borderTop: `1px solid ${WIRE.ruleSoft}` }}>
        <WireBtn primary block size="lg">Next</WireBtn>
      </div>
    </div>
  );
}

// ─── 06 · ONBOARDING · Measurements ──────────────────────────
function M06_OnbMeasure() {
  const rows = [
    ['가슴둘레', '72', 'cm', '가장 넓은 부분'],
    ['목둘레',   '46', 'cm', '목걸이 자리'],
    ['등길이',   '68', 'cm', '목 밑 ~ 꼬리 전'],
    ['체중',     '28', 'kg', '최근 3개월'],
  ];
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <TopBar left={ICONS.back} right={<span style={{ fontSize: 10, letterSpacing: '0.2em', color: WIRE.inkSoft }}>SKIP</span>} center={<span style={{ fontSize: 10, letterSpacing: '0.24em', color: WIRE.inkSoft }}>STEP 4 · 4</span>}/>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 2, background: WIRE.ink }}/>)}
        </div>
      </div>

      <div style={{ padding: '24px 20px 14px' }}>
        <div style={{ fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <span style={{ fontStyle: 'italic', color: WIRE.accent }}>치수</span>를 재어볼까요?
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 12, color: WIRE.inkSoft, marginTop: 6 }}>
          건너뛰고 나중에 측정해도 좋아요. <span style={{ color: WIRE.ink, borderBottom: `1px solid ${WIRE.ink}` }}>측정 가이드 보기 →</span>
        </div>
      </div>

      <div style={{ padding: '0 20px', position: 'relative' }}>
        <ImgBox h={160} flat label="dog w/ measurement marks" />
        <StickyNote style={{ position: 'absolute', bottom: -8, left: 12 }} rotate={-2}>
          ↑ 일러스트에 측정 포인트 3곳 표시
        </StickyNote>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        {rows.map(([lbl, val, unit, hint], i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '14px 0',
            borderBottom: `1px solid ${WIRE.ruleSoft}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{lbl}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft }}>{hint}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 80, justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: WIRE.serif, fontSize: 22 }}>{val}</span>
              <span style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.1em' }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${WIRE.ruleSoft}`, display: 'flex', gap: 10 }}>
        <WireBtn>Later</WireBtn>
        <WireBtn primary block size="lg">완료 · 쇼핑 시작</WireBtn>
      </div>
    </div>
  );
}

// ─── 07 · HOME ────────────────────────────────────────────────
function M07_Home() {
  const curations = [
    { t: 'The Retriever Edit', s: '11 pieces' },
    { t: 'Northern Coats',     s: '8 pieces' },
    { t: 'First Rain',         s: '14 pieces' },
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }}>
      {/* hero */}
      <div style={{ position: 'relative', padding: 16 }}>
        <Eyebrow>Vol. 04 · Spring Issue</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>
          Coats for the<br/>
          <span style={{ fontStyle: 'italic', color: WIRE.accent }}>Long-legged.</span>
        </div>
        <div style={{ fontFamily: WIRE.sans, fontSize: 12, color: WIRE.inkSoft, marginTop: 10, maxWidth: 260 }}>
          골든, 리트리버, 말라뮤트 — 우리가 사랑하는 큰 친구들을 위한 2026 S/S 컬렉션.
        </div>
        <div style={{ marginTop: 14, position: 'relative' }}>
          <ImgBox ratio="4/5" label="editorial hero — golden in trench" flat/>
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: WIRE.paper, padding: '6px 10px',
            fontFamily: WIRE.serif, fontSize: 11, letterSpacing: '0.04em',
          }}>
            Shop the look  →
          </div>
        </div>
      </div>

      {/* breed picker chips */}
      <div style={{ padding: '6px 0 14px' }}>
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          <Eyebrow>Shop by breed</Eyebrow>
        </div>
        <div style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px' }}>
          {['Golden','Retriever','Malamute','Shepherd','Samoyed','Bernese'].map((b, i) => (
            <div key={i} style={{ flexShrink: 0, textAlign: 'center', width: 68 }}>
              <ImgBox w={68} h={68} flat style={{ borderRadius: '50%', border: i === 0 ? `1.5px solid ${WIRE.ink}` : undefined }}/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 11, marginTop: 6 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      <Rule style={{ margin: '4px 16px' }}/>

      {/* featured stories — curations */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow>The Edits</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 20, fontStyle: 'italic' }}>Curated by breed</div>
          </div>
          <span style={{ fontSize: 10, letterSpacing: '0.16em', color: WIRE.inkSoft }}>ALL →</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflow: 'auto', marginTop: 14 }}>
          {curations.map((c, i) => (
            <div key={i} style={{ flexShrink: 0, width: 170 }}>
              <ImgBox w={170} h={210} flat label={c.t.toLowerCase()}/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 14, marginTop: 8 }}>{c.t}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>{c.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* for your dog — personalized */}
      <div style={{ padding: 16, background: WIRE.paperDeep }}>
        <Eyebrow>For Hana · Golden · Sporty</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>
          Picked for your hound
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          {[1,2,3,4].map(i => (
            <div key={i}>
              <ImgBox ratio="1/1.2" flat label={`item ${i}`}/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 12, marginTop: 6 }}>Barbour Field Coat</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: WIRE.inkSoft }}>
                <span>L · in stock</span>
                <span style={{ color: WIRE.ink }}>₩ 148,000</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* editorial */}
      <div style={{ padding: 16 }}>
        <Eyebrow>The Journal</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 24, fontStyle: 'italic', letterSpacing: '-0.01em', marginTop: 6, lineHeight: 1.15 }}>
          How to measure a long-backed<br/>retriever — in 4 steps.
        </div>
        <div style={{ marginTop: 12 }}>
          <ImgBox ratio="16/10" flat label="journal hero"/>
        </div>
      </div>
    </MScreen>
  );
}

Object.assign(window, {
  MagMasthead, TopBar, TabBar, MScreen,
  M01_Splash, M02_Login, M03_OnbIntro, M04_OnbBreed,
  M05_OnbBody, M06_OnbMeasure, M07_Home,
});
