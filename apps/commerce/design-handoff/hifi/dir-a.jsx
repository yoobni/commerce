// ─── Direction A · Editorial warm — 5 core screens ────────────
// Home / PLP / PDP / Cart / Checkout
// Instrument Serif for magazine italic accents; restrained modern spacing.

function AIconBack({ t }) { return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M14 4 L 6 11 L 14 18" stroke={t.ink} strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>; }
function AIconClose({ t }) { return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M5 5 L 17 17 M17 5 L 5 17" stroke={t.ink} strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function AIconSearch({ t }) { return <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="9" cy="9" r="5" stroke={t.ink} strokeWidth="1.2" fill="none"/><path d="M13 13 L 17 17" stroke={t.ink} strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function AIconHeart({ t, fill }) { return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 18 Q 3 12, 3 7 Q 3 4, 6 4 Q 9 4, 11 7 Q 13 4, 16 4 Q 19 4, 19 7 Q 19 12, 11 18 Z" stroke={t.ink} strokeWidth="1.3" fill={fill || 'none'} strokeLinejoin="round"/></svg>; }
function AIconBag({ t, n }) { return (
  <div style={{ position: 'relative' }}>
    <svg width="22" height="22" viewBox="0 0 22 22"><path d="M4 7 L 18 7 L 17 19 L 5 19 Z" stroke={t.ink} strokeWidth="1.3" fill="none"/><path d="M8 7 V 5 Q 8 3, 11 3 Q 14 3, 14 5 V 7" stroke={t.ink} strokeWidth="1.3" fill="none"/></svg>
    {n > 0 && <div style={{ position: 'absolute', top: -3, right: -4, background: t.accent, color: '#fff', borderRadius: 999, width: 15, height: 15, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{n}</div>}
  </div>
);}

function ATopBar({ t, left, right, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 10px', background: t.bg }}>
      <div style={{ minWidth: 24 }}>{left}</div>
      <div style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.inkSoft, fontWeight: 500 }}>{title}</div>
      <div style={{ minWidth: 24, display: 'flex', gap: 14 }}>{right}</div>
    </div>
  );
}

// ─── A · Home ────────────────────────────────────────────────
function A_Home({ t }) {
  return (
    <Phone t={t}>
      <ATopBar t={t}
        left={<div style={{ fontFamily: t.serif, fontSize: 22, fontStyle: 'italic' }}>Muzzle</div>}
        title=""
        right={<><AIconSearch t={t}/><AIconBag t={t} n={2}/></>}
      />

      {/* Hero */}
      <div style={{ padding: '8px 20px 24px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.inkMute, fontWeight: 500 }}>Volume 04 · Spring 2026</div>
        <div style={{ fontFamily: t.serif, fontSize: 44, lineHeight: 1.0, letterSpacing: '-0.02em', marginTop: 10 }}>
          Coats for<br/>the <span style={{ fontStyle: 'italic', color: t.accent }}>long-legged.</span>
        </div>
        <div style={{ fontSize: 12.5, color: t.inkSoft, lineHeight: 1.55, marginTop: 12, maxWidth: 280 }}>
          골든, 리트리버, 말라뮤트 — 큰 친구들을 위한 2026년 봄 컬렉션.
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: t.r.lg, overflow: 'hidden', position: 'relative' }}>
          <IllusScene stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.24em', color: t.ink, opacity: 0.7, fontWeight: 500 }}>THIS VOLUME</div>
              <div style={{ fontFamily: t.serif, fontSize: 18, fontStyle: 'italic', color: t.ink, marginTop: 2 }}>Field Trench</div>
            </div>
            <Btn t={t} size="sm" variant="primary">Shop →</Btn>
          </div>
        </div>
      </div>

      {/* For Hana */}
      <div style={{ padding: '36px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow t={t}>Fit for Hana · Golden · L</Eyebrow>
            <div style={{ fontFamily: t.serif, fontSize: 26, letterSpacing: '-0.015em', marginTop: 2 }}>Picked <span style={{ fontStyle: 'italic' }}>for your hound.</span></div>
          </div>
          <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.14em' }}>ALL</div>
        </div>
      </div>

      <div className="mz-scroll" style={{ display: 'flex', gap: 12, padding: '0 20px 4px', overflowX: 'auto' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flexShrink: 0, width: 168 }}>
            <div style={{ position: 'relative', borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep }}>
              <ProductIllus t={t} seed={i} ratio="4/5"/>
              <div style={{ position: 'absolute', top: 10, left: 10, background: t.bg, padding: '3px 8px', fontSize: 9, letterSpacing: '0.14em', fontWeight: 500, borderRadius: 2 }}>FIT ★ L</div>
              <div style={{ position: 'absolute', top: 10, right: 10 }}><AIconHeart t={t}/></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: t.serif, fontSize: 15 }}>{['Field Trench','Wool Chore','Rain Shell','Linen Tee'][i]}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <div style={{ fontSize: 11, color: t.inkMute }}>{['Oat','Ink','Olive','Bone'][i]}</div>
                <div style={{ fontFamily: t.serif, fontSize: 13 }}>₩ {['148','196','88','62'][i]},000</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category strip */}
      <div style={{ padding: '32px 20px 16px' }}>
        <Eyebrow t={t}>By Breed</Eyebrow>
        <div style={{ fontFamily: t.serif, fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>Shop for your hound.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 20px' }}>
        {['Golden','Retriever','Malamute','Bernese','Samoyed','Shepherd'].map((b, i) => (
          <div key={i} style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, position: 'relative', aspectRatio: '1' }}>
            <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} seed={i} w="100%" h="100%"/>
            <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: t.serif, fontSize: 12, color: t.ink }}>{b}</div>
          </div>
        ))}
      </div>

      {/* Journal */}
      <div style={{ padding: '40px 20px 24px' }}>
        <Eyebrow t={t}>The Journal · No 18</Eyebrow>
        <div style={{ fontFamily: t.serif, fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.015em', marginTop: 6 }}>
          A tape, a friend, <span style={{ fontStyle: 'italic' }}>and four numbers.</span>
        </div>
        <div style={{ marginTop: 14, borderRadius: t.r.md, overflow: 'hidden' }}>
          <div style={{ aspectRatio: '16/9', background: t.bgDeep, position: 'relative' }}>
            <IllusHound stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.55 }}>
          큰 아이들은 사이즈 하나로 요약되지 않습니다. 가슴, 목, 등 — 세 숫자를 재는 법.
        </div>
        <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '0.18em', borderBottom: `1px solid ${t.ink}`, paddingBottom: 3, display: 'inline-block' }}>READ THE GUIDE</div>
      </div>

      <TabBar t={t} active="home"/>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── A · PLP ──────────────────────────────────────────────────
function A_PLP({ t }) {
  const items = Array.from({length: 10}).map((_, i) => ({
    name: ['Field Trench','Wool Chore','Rain Shell','Linen Tee','Canvas Harness','Oxford Coat','Puffer','Knit Vest','Barbour','Shearling'][i],
    color: ['Oat','Ink','Olive','Bone','Ink','Navy','Clay','Cream','Olive','Cognac'][i],
    price: [148,196,88,62,58,188,138,78,220,280][i],
    fit: [true,true,false,true,true,false,true,true,true,false][i],
  }));
  return (
    <Phone t={t}>
      <ATopBar t={t} left={<AIconBack t={t}/>} title="Outerwear" right={<AIconSearch t={t}/>}/>

      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.inkMute, fontWeight: 500 }}>Spring · 2026</div>
        <div style={{ fontFamily: t.serif, fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>Coats & <span style={{ fontStyle: 'italic' }}>Jackets</span></div>
        <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 8 }}>52 pieces · <span style={{ color: t.accent }}>✓ Fit for Hana</span></div>
      </div>

      {/* chips */}
      <div className="mz-scroll" style={{ display: 'flex', gap: 8, padding: '6px 20px 14px', overflowX: 'auto' }}>
        <Chip t={t} active>Hana (L)</Chip>
        {['Oat','Ink','Olive','Trench','Wool','Rain'].map(c => <Chip key={c} t={t}>{c}</Chip>)}
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div style={{ fontSize: 12, letterSpacing: '0.12em' }}>⇅  FILTER · 2</div>
        <div style={{ fontSize: 12, letterSpacing: '0.12em' }}>SORT · Newest</div>
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 14 }}>
        {items.map((p, i) => (
          <div key={i}>
            <div style={{ position: 'relative', borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep }}>
              <ProductIllus t={t} seed={i} ratio="4/5"/>
              {p.fit && <div style={{ position: 'absolute', top: 8, left: 8, background: t.accent, color: '#fff', fontSize: 9, padding: '3px 7px', letterSpacing: '0.12em', fontWeight: 500, borderRadius: 2 }}>FIT ★ L</div>}
              {i === 3 && <div style={{ position: 'absolute', top: 8, left: 8, background: t.bg, color: t.ink, fontSize: 9, padding: '3px 7px', letterSpacing: '0.12em', fontWeight: 500, borderRadius: 2 }}>NEW</div>}
              <div style={{ position: 'absolute', top: 8, right: 8 }}><AIconHeart t={t}/></div>
              {i === 6 && <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, padding: '2px 6px', letterSpacing: '0.12em', borderRadius: 2 }}>3 LEFT · L</div>}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: t.serif, fontSize: 14 }}>{p.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <div style={{ fontSize: 11, color: t.inkMute }}>{p.color}</div>
                <div style={{ fontFamily: t.serif, fontSize: 13 }}>₩ {p.price},000</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TabBar t={t} active="home"/>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── A · PDP ──────────────────────────────────────────────────
function A_PDP({ t }) {
  return (
    <Phone t={t}>
      <ATopBar t={t} left={<AIconBack t={t}/>} title="Field Trench" right={<><AIconHeart t={t}/><AIconBag t={t} n={2}/></>}/>

      {/* Gallery */}
      <div style={{ background: t.bgDeep, position: 'relative' }}>
        <div style={{ aspectRatio: '4/5' }}>
          <IllusPortrait stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: i === 0 ? 18 : 5, height: 5, borderRadius: 3, background: i === 0 ? t.ink : t.inkSoft, opacity: i === 0 ? 1 : 0.3 }}/>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <Tag t={t} accent>Muzzle Atelier · SS26</Tag>
        </div>
      </div>

      <div style={{ padding: '22px 20px 14px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 34, lineHeight: 1.0, letterSpacing: '-0.02em' }}>
          Field Trench,<br/><span style={{ fontStyle: 'italic' }}>Oat.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
          <div style={{ fontFamily: t.serif, fontSize: 24 }}>₩ 148,000</div>
          <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.06em' }}>★ 4.8 · 213 reviews</div>
        </div>
      </div>

      {/* Fit for Hana callout */}
      <div style={{ margin: '6px 20px 0', padding: 16, borderRadius: t.r.md, background: t.accentSoft, border: `1px solid ${t.accent}` }}>
        <div style={{ fontSize: 10, letterSpacing: '0.22em', color: t.accentInk, fontWeight: 600 }}>FIT FOR HANA</div>
        <div style={{ fontFamily: t.serif, fontSize: 19, marginTop: 3, color: t.accentInk }}>
          Recommended · <span style={{ fontStyle: 'italic' }}>size L</span>
        </div>
        <div style={{ fontSize: 11, color: t.accentInk, opacity: 0.75, marginTop: 4 }}>가슴 72 · 등 68 · 28kg · Sporty</div>
      </div>

      {/* Size */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <Eyebrow t={t}>Size</Eyebrow>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', borderBottom: `1px solid ${t.ink}` }}>SIZE GUIDE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[['M','3 left'],['L','12 · ★', true],['XL','5'],['XXL','sold', false, true]].map(([s, d, sel, out], i) => (
            <div key={i} style={{
              padding: '12px 0', textAlign: 'center',
              border: `1px solid ${sel ? t.ink : t.line}`,
              background: sel ? t.ink : 'transparent',
              color: sel ? t.bg : t.ink,
              opacity: out ? 0.35 : 1,
              borderRadius: t.r.sm,
              position: 'relative',
            }}>
              <div style={{ fontFamily: t.serif, fontSize: 16 }}>{s}</div>
              <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Color */}
      <div style={{ padding: '22px 20px 0' }}>
        <Eyebrow t={t}>Color · Oat</Eyebrow>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {[['#D6C9A6', true],['#4A463D'],['#6B2020'],['#4A5237']].map(([c, sel], i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: '50%', background: c,
              border: `1px solid ${t.lineStrong}`,
              boxShadow: sel ? `0 0 0 2px ${t.bg}, 0 0 0 3px ${t.ink}` : 'none',
            }}/>
          ))}
        </div>
      </div>

      {/* Story */}
      <div style={{ padding: '26px 20px 0' }}>
        <Eyebrow t={t}>The Garment</Eyebrow>
        <div style={{ fontFamily: t.serif, fontSize: 19, fontStyle: 'italic', lineHeight: 1.35, marginTop: 6, letterSpacing: '-0.01em' }}>
          "A field trench, re-cut for the long-backed hound — waxed cotton, bone-horn buttons, a roomy chest."
        </div>
        <div style={{ fontSize: 12.5, color: t.inkSoft, lineHeight: 1.6, marginTop: 12 }}>
          Made in Porto. 왁스 코튼 겉감에 코튼 안감. 가슴 둘레에 +4cm 여유를 두어 움직임을 방해하지 않습니다.
        </div>
      </div>

      {/* Specs */}
      <div style={{ padding: '22px 20px 0' }}>
        {[
          ['Material', 'Waxed cotton · Cotton lining · Bone horn'],
          ['Cut', 'Long-back · chest +4cm ease'],
          ['Care', 'Wipe clean · no machine wash'],
          ['Made in', 'Porto, Portugal'],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '12px 0', borderBottom: `1px solid ${t.line}` }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: t.inkMute }}>{k.toUpperCase()}</div>
            <div style={{ fontFamily: t.serif, fontSize: 13 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div style={{ padding: '26px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow t={t}>Reviews · 213</Eyebrow>
            <div style={{ fontFamily: t.serif, fontSize: 24, fontStyle: 'italic', marginTop: 2 }}>What other hounds say.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: t.serif, fontSize: 22 }}>4.8</div>
            <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.14em' }}>★★★★★</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 16px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ padding: '16px 0', borderTop: `1px solid ${t.line}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: t.bgDeep }}>
                <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} w={36} h={36} seed={i}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontSize: 13 }}>{['Hana · Golden','Taro · Malamute'][i]}</div>
                <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.06em' }}>{['28kg · Sporty · L · 딱 맞음','42kg · Sturdy · XL · 조금 큼'][i]}</div>
              </div>
              <div style={{ color: t.accent, fontSize: 10 }}>★★★★★</div>
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>
              "{['어깨가 넓은 편인데 가슴이 여유있어서 편해 보여요.','장모 버니즈라 통풍이 걱정이었는데 괜찮네요.'][i]}"
            </div>
            {i === 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: 68, height: 68, borderRadius: t.r.sm, background: t.bgDeep, overflow: 'hidden' }}>
                    <IllusGolden stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <Btn t={t} variant="ghost" block>리뷰 213개 모두 보기</Btn>
      </div>

      {/* Sticky buy bar */}
      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, background: t.bg, display: 'flex', gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: t.r.sm, border: `1px solid ${t.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AIconHeart t={t}/></div>
        <Btn t={t} variant="primary" block size="lg">Add to bag · ₩ 148,000</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── A · Cart ─────────────────────────────────────────────────
function A_Cart({ t }) {
  const items = [
    { n: 'Field Trench', c: 'Oat', s: 'L', p: 148, q: 1, seed: 0 },
    { n: 'Rain Shell',   c: 'Ink', s: 'L', p: 88,  q: 1, seed: 2 },
    { n: 'Canvas Harness', c: 'Olive', s: 'L', p: 58, q: 2, seed: 3 },
  ];
  return (
    <Phone t={t}>
      <ATopBar t={t} left={<AIconClose t={t}/>} title="Bag · 4" right={<span style={{ fontSize: 11, letterSpacing: '0.16em' }}>EDIT</span>}/>

      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 32, letterSpacing: '-0.02em' }}>
          4 pieces for <span style={{ fontStyle: 'italic' }}>Hana.</span>
        </div>
        <div style={{ fontSize: 12, color: t.inkMute, marginTop: 4 }}>All fit for L · Golden · Sporty</div>
      </div>

      <div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderTop: `1px solid ${t.line}` }}>
            <div style={{ width: 86, height: 104, borderRadius: t.r.sm, overflow: 'hidden', background: t.bgDeep, flexShrink: 0 }}>
              <ProductIllus t={t} seed={it.seed} ratio="auto" style={{ height: '100%' }}/>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div>
                <div style={{ fontFamily: t.serif, fontSize: 15 }}>{it.n}</div>
                <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.06em', marginTop: 2 }}>{it.c.toUpperCase()} · SIZE {it.s}  ·  ✓ FITS</div>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.line}`, borderRadius: t.r.sm }}>
                  <div style={{ padding: '5px 11px', color: t.inkSoft }}>−</div>
                  <div style={{ padding: '5px 11px', fontFamily: t.serif, fontSize: 13, borderLeft: `1px solid ${t.line}`, borderRight: `1px solid ${t.line}` }}>{it.q}</div>
                  <div style={{ padding: '5px 11px' }}>+</div>
                </div>
                <div style={{ fontFamily: t.serif, fontSize: 15 }}>₩ {(it.p * it.q).toLocaleString()},000</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* recommend */}
      <div style={{ padding: '28px 20px 8px', background: t.bgDeep, marginTop: 12 }}>
        <Eyebrow t={t}>Complete the look</Eyebrow>
        <div style={{ fontFamily: t.serif, fontSize: 20, fontStyle: 'italic', marginTop: 4 }}>Goes with the trench.</div>
      </div>
      <div className="mz-scroll" style={{ background: t.bgDeep, padding: '14px 20px 20px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        {[4,5,0,1].map((s, i) => (
          <div key={i} style={{ flexShrink: 0, width: 130 }}>
            <div style={{ borderRadius: t.r.sm, overflow: 'hidden', background: t.bg }}>
              <ProductIllus t={t} seed={s} ratio="4/5"/>
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 12, marginTop: 6 }}>Leather Leash</div>
            <div style={{ fontSize: 11, color: t.inkMute }}>₩ 42,000</div>
          </div>
        ))}
      </div>

      {/* coupon */}
      <div style={{ padding: '20px' }}>
        <div style={{ border: `1px solid ${t.line}`, borderRadius: t.r.md, padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: t.inkMute }}>COUPON</div>
            <div style={{ fontFamily: t.serif, fontSize: 15, marginTop: 2 }}>FIRST-10 · <span style={{ color: t.accent }}>− ₩ 35,200</span></div>
          </div>
          <span style={{ color: t.inkMute }}>›</span>
        </div>
      </div>

      {/* totals */}
      <div style={{ padding: '0 20px 10px' }}>
        {[['Subtotal','352,000'],['Shipping','FREE'],['Coupon','− 35,200']].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12.5, color: t.inkSoft }}>
            <span>{k}</span><span style={{ fontFamily: t.serif, color: t.ink, fontSize: 13 }}>₩ {v}</span>
          </div>
        ))}
        <Rule t={t} style={{ margin: '10px 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: t.serif, fontSize: 16 }}>Total</span>
          <span style={{ fontFamily: t.serif, fontSize: 24 }}>₩ 316,800</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}` }}>
        <Btn t={t} variant="primary" block size="lg">결제하기  ·  ₩ 316,800</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── A · Checkout ─────────────────────────────────────────────
function A_Checkout({ t }) {
  return (
    <Phone t={t}>
      <ATopBar t={t} left={<AIconBack t={t}/>} title="Checkout" right={<span style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute }}>🔒 SECURE</span>}/>

      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 32, letterSpacing: '-0.02em' }}>
          Almost <span style={{ fontStyle: 'italic' }}>ready.</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center', fontSize: 11, letterSpacing: '0.1em' }}>
          <span style={{ color: t.accent }}>● CHECKOUT</span>
          <span style={{ color: t.inkMute }}>○ CONFIRM</span>
          <span style={{ color: t.inkMute }}>○ DONE</span>
        </div>
      </div>

      {/* Summary pill */}
      <div style={{ margin: '0 20px', padding: 14, borderRadius: t.r.md, background: t.bgDeep, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 36, height: 46, borderRadius: t.r.sm, overflow: 'hidden', background: t.bg }}>
              <ProductIllus t={t} seed={i} ratio="auto" style={{ height: '100%' }}/>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.serif, fontSize: 14 }}>4 items</div>
          <div style={{ fontSize: 11, color: t.inkMute }}>Oat trench +2</div>
        </div>
        <div style={{ fontFamily: t.serif, fontSize: 18 }}>₩316,800</div>
      </div>

      {/* Ship to */}
      <div style={{ padding: '26px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Eyebrow t={t}>Ship to</Eyebrow>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', borderBottom: `1px solid ${t.ink}` }}>CHANGE</span>
        </div>
        <div style={{ padding: 14, borderRadius: t.r.md, border: `1px solid ${t.line}` }}>
          <div style={{ fontFamily: t.serif, fontSize: 16 }}>Hana Kim · <span style={{ fontStyle: 'italic', color: t.inkMute }}>자택</span></div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
            서울 성동구 왕십리로 222, 2층 · 04777<br/>
            010-3456-7890
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div style={{ padding: '26px 20px 0' }}>
        <Eyebrow t={t}>Delivery</Eyebrow>
        <div style={{ marginTop: 10 }}>
          {[
            ['Standard', '2–4 days', 'FREE', true],
            ['Express', '1 day · before 2pm', '₩ 7,000'],
            ['Pickup · Seongsu', 'tomorrow', 'FREE'],
          ].map(([t1, d, p, sel], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
              border: `1px solid ${sel ? t.ink : t.line}`,
              borderRadius: t.r.md, marginBottom: 8,
              background: sel ? t.accentSoft : 'transparent',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? t.accent : t.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent }}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontSize: 14 }}>{t1}</div>
                <div style={{ fontSize: 11, color: t.inkMute }}>{d}</div>
              </div>
              <div style={{ fontFamily: t.serif, fontSize: 13 }}>{p}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div style={{ padding: '18px 20px 0' }}>
        <Eyebrow t={t}>Payment</Eyebrow>
        <div style={{ marginTop: 10, padding: 14, border: `1px solid ${t.ink}`, borderRadius: t.r.md, background: t.accentSoft, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 30, borderRadius: 3, background: t.ink, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.serif, fontSize: 15 }}>Visa · · · · 4412</div>
            <div style={{ fontSize: 10, color: t.inkSoft, letterSpacing: '0.06em' }}>expires 09/28</div>
          </div>
          <span style={{ fontSize: 11, letterSpacing: '0.14em' }}>CHANGE</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {['Apple Pay','Kakao','Naver','Toss'].map((x, i) => (
            <div key={i} style={{ flex: 1, padding: '9px 0', textAlign: 'center', fontSize: 11, letterSpacing: '0.08em', border: `1px solid ${t.line}`, borderRadius: t.r.sm, fontWeight: 500 }}>{x}</div>
          ))}
        </div>
      </div>

      {/* Gift note */}
      <div style={{ padding: '22px 20px 0' }}>
        <Eyebrow t={t}>Gift note (optional)</Eyebrow>
        <div style={{ marginTop: 8, padding: 14, border: `1px solid ${t.line}`, borderRadius: t.r.md, background: t.bgDeep, minHeight: 64, fontSize: 12, color: t.inkMute, fontFamily: t.serif, fontStyle: 'italic' }}>
          hand-written message card inside…
        </div>
      </div>

      {/* Totals */}
      <div style={{ padding: '20px' }}>
        {[['Subtotal','352,000'],['Shipping','FREE'],['Coupon · FIRST-10','− 35,200']].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5, color: t.inkSoft }}>
            <span>{k}</span><span style={{ color: t.ink, fontFamily: t.serif, fontSize: 13 }}>₩ {v}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: t.inkMute }}>TO PAY</div>
          <div style={{ fontFamily: t.serif, fontSize: 22 }}>₩ 316,800</div>
        </div>
        <Btn t={t} variant="primary" size="lg" style={{ flex: 1 }}>Place order</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

Object.assign(window, { A_Home, A_PLP, A_PDP, A_Cart, A_Checkout });
