// Desktop screens — rendered inside ChromeWindow frames on the canvas.
// Designs are 1280 wide content (chrome adds 40px chrome). Screens:
//  D1 Home · D2 PLP · D3 PDP · D4 Checkout

// ─── Global header for all desktop screens ────────────────────
function DHeader({ active = 'shop' }) {
  const NAV = ['Journal','Shop','By Breed','Fitting Room','The Atelier'];
  return (
    <div style={{ padding: '16px 40px', borderBottom: `1px solid ${WIRE.rule}`, background: WIRE.paper }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.26em', color: WIRE.inkSoft }}>SEOUL · NEW YORK · LONDON</div>
        <div style={{ fontSize: 10, letterSpacing: '0.26em', color: WIRE.inkSoft }}>FREE SHIPPING OVER ₩ 100,000</div>
        <div style={{ fontSize: 10, letterSpacing: '0.26em', color: WIRE.inkSoft }}>KR · ₩  |  EN · $</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          {NAV.slice(0,2).map((n, i) => (
            <div key={i} style={{ fontFamily: WIRE.serif, fontStyle: active === n.toLowerCase() ? 'italic' : 'normal', fontSize: 14, color: active === n.toLowerCase() ? WIRE.accent : WIRE.ink }}>{n}</div>
          ))}
        </div>
        <div style={{ fontFamily: WIRE.serif, fontSize: 36, letterSpacing: '0.04em', fontStyle: 'italic' }}>Muzzle</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          {NAV.slice(2).map((n, i) => (
            <div key={i} style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{n}</div>
          ))}
          <div style={{ display: 'flex', gap: 16, color: WIRE.ink, marginLeft: 4 }}>
            {ICONS.search}{ICONS.user}{ICONS.heart}{ICONS.bag}
          </div>
        </div>
      </div>
    </div>
  );
}

function DFooter() {
  return (
    <div style={{ padding: '32px 40px', borderTop: `1px solid ${WIRE.rule}`, background: WIRE.paperDeep }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <div style={{ fontFamily: WIRE.serif, fontSize: 22, fontStyle: 'italic' }}>Muzzle</div>
          <TextBlock lines={3} gap={6} lastW="70%" width={240} style={{ marginTop: 8 }}/>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ border: `1px solid ${WIRE.rule}`, padding: '8px 12px', fontSize: 11, flex: 1 }}>your@email.com</div>
            <WireBtn size="sm">Subscribe</WireBtn>
          </div>
        </div>
        {[['Shop', ['New','Outerwear','Rainwear','Harness']],
          ['By breed', ['Golden','Retriever','Malamute','Bernese']],
          ['Care', ['Size Guide','Shipping','Returns','FAQ']],
          ['Atelier', ['About','Journal','Lookbook','Press']]
        ].map(([h, items], i) => (
          <div key={i}>
            <Eyebrow style={{ marginBottom: 10 }}>{h}</Eyebrow>
            {items.map((t, j) => (
              <div key={j} style={{ fontSize: 12, padding: '4px 0' }}>{t}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.14em' }}>
        <span>© 2026 MUZZLE ATELIER</span>
        <span>TERMS · PRIVACY · COOKIES</span>
      </div>
    </div>
  );
}

// ─── D1 · HOME ────────────────────────────────────────────────
function D1_Home() {
  return (
    <div className="wire" style={{ background: WIRE.paper, width: '100%' }}>
      <DHeader active="shop"/>

      {/* hero */}
      <div style={{ padding: '40px 40px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'end' }}>
        <div>
          <Eyebrow>Volume 04 · Spring 2026</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 88, lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: 12 }}>
            Coats for the<br/>
            <span style={{ fontStyle: 'italic', color: WIRE.accent }}>long-legged.</span>
          </div>
          <div style={{ fontFamily: WIRE.sans, fontSize: 14, color: WIRE.inkSoft, marginTop: 20, maxWidth: 420, lineHeight: 1.6 }}>
            골든, 리트리버, 말라뮤트 — 우리가 사랑하는 큰 친구들을 위한 2026년 스프링 컬렉션이 도착했습니다.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <WireBtn primary size="lg">Shop the issue</WireBtn>
            <WireBtn size="lg">Read the journal</WireBtn>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <ImgBox ratio="4/5" flat label="hero · editorial shot"/>
          <div style={{ position: 'absolute', top: 20, right: 20, background: WIRE.paper, padding: '6px 12px', fontSize: 10, letterSpacing: '0.18em' }}>
            FEATURED · Field Trench
          </div>
        </div>
      </div>

      {/* breed navigator */}
      <div style={{ padding: '30px 40px', borderTop: `1px solid ${WIRE.rule}`, borderBottom: `1px solid ${WIRE.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow>By breed</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 28, fontStyle: 'italic', marginTop: 4 }}>Shop for your hound.</div>
          </div>
          <span style={{ fontSize: 11, letterSpacing: '0.18em' }}>ALL 24 BREEDS →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginTop: 24 }}>
          {['Golden Retriever','Labrador','Malamute','Bernese','Samoyed','Shepherd'].map((b, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <ImgBox ratio="1" flat style={{ borderRadius: '50%' }}/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13, marginTop: 10 }}>{b}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.06em' }}>{[18,22,14,16,12,20][i]} pieces</div>
            </div>
          ))}
        </div>
      </div>

      {/* curated edits — magazine split */}
      <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24 }}>
        <div>
          <Eyebrow>The Retriever Edit</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 6 }}>Built for<br/><span style={{ fontStyle: 'italic' }}>fields, forests, rivers.</span></div>
          <TextBlock lines={3} gap={6} lastW="60%" style={{ marginTop: 14 }}/>
          <div style={{ marginTop: 18, fontSize: 11, letterSpacing: '0.18em', borderBottom: `1px solid ${WIRE.ink}`, paddingBottom: 4, display: 'inline-block' }}>SHOP THE EDIT →</div>
        </div>
        <ImgBox ratio="3/4" flat label="retriever edit"/>
        <ImgBox ratio="3/4" flat label="field shot"/>
      </div>

      {/* personalized grid */}
      <div style={{ padding: '40px', background: WIRE.paperDeep }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow>For Hana · Golden · Sporty · L</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 32, fontStyle: 'italic', marginTop: 4 }}>Picked for your hound.</div>
          </div>
          <span style={{ fontSize: 11, letterSpacing: '0.18em' }}>VIEW ALL →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 26 }}>
          {[1,2,3,4].map(i => (
            <div key={i}>
              <div style={{ position: 'relative' }}>
                <ImgBox ratio="4/5" flat/>
                <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, letterSpacing: '0.14em', background: WIRE.paper, padding: '3px 8px' }}>FIT ★ L</div>
              </div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 15, marginTop: 10 }}>Barbour-style Trench</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: WIRE.inkSoft, marginTop: 2 }}>
                <span>L · in stock</span>
                <span style={{ color: WIRE.ink, fontFamily: WIRE.serif }}>₩ 148,000</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* journal feature */}
      <div style={{ padding: '50px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'center' }}>
          <ImgBox ratio="5/6" flat label="journal feature"/>
          <div>
            <Eyebrow>The Journal · No 18</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.02em', fontStyle: 'italic', marginTop: 6 }}>
              A tape, a friend,<br/>and four precise numbers.
            </div>
            <TextBlock lines={4} gap={6} lastW="50%" style={{ marginTop: 20 }}/>
            <div style={{ marginTop: 22, fontSize: 11, letterSpacing: '0.18em', borderBottom: `1px solid ${WIRE.ink}`, paddingBottom: 4, display: 'inline-block' }}>READ THE GUIDE →</div>
          </div>
        </div>
      </div>

      <DFooter/>
    </div>
  );
}

// ─── D2 · PLP / Category ──────────────────────────────────────
function D2_PLP() {
  return (
    <div className="wire" style={{ background: WIRE.paper, width: '100%' }}>
      <DHeader/>
      <div style={{ padding: '28px 40px 14px', borderBottom: `1px solid ${WIRE.rule}` }}>
        <div style={{ fontSize: 11, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>Shop / Outerwear</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
          <div>
            <Eyebrow>Spring 2026</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 56, letterSpacing: '-0.02em', lineHeight: 1 }}>Coats & <span style={{ fontStyle: 'italic' }}>Jackets</span></div>
            <div style={{ fontSize: 12, color: WIRE.inkSoft, marginTop: 10, maxWidth: 520, lineHeight: 1.6 }}>
              왁스 코튼부터 울 쇼어 코트까지 — 대형견의 긴 몸과 넓은 가슴을 위해 재단된 52벌.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', color: WIRE.inkSoft }}>52 PIECES · FIT ✓ Hana</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em' }}>SORT · NEWEST ▾</span>
              <span style={{ fontSize: 11, letterSpacing: '0.1em' }}>VIEW · GRID 4 ▾</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, padding: '28px 40px' }}>
        {/* filters rail */}
        <div>
          <Eyebrow>Filter</Eyebrow>
          {[
            ['Fit for',    ['Hana (Golden)','Any']],
            ['Size',       ['S','M','L — 12','XL — 5','XXL — 0']],
            ['Category',   ['Trench','Field Coat','Rain','Wool','Puffer']],
            ['Color',      ['Oat','Ink','Olive','Burgundy','Camel']],
            ['Price',      ['under 80k','80 – 150k','150 – 250k','over 250k']],
            ['Material',   ['Waxed Cotton','Wool','Shell','Fleece']],
            ['Rating',     ['4★ +','5★ only']],
          ].map(([t, opts], i) => (
            <div key={i} style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.16em', paddingBottom: 6, borderBottom: `1px solid ${WIRE.rule}` }}>
                <span>{t.toUpperCase()}</span><span>−</span>
              </div>
              <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {opts.map((o, j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                    <div style={{ width: 12, height: 12, border: `1px solid ${WIRE.rule}`, background: (t === 'Size' && j === 2) || (t === 'Fit for' && j === 0) ? WIRE.ink : 'transparent' }}/>
                    <span style={{ color: o.includes('— 0') ? WIRE.inkSoft : WIRE.ink, textDecoration: o.includes('— 0') ? 'line-through' : 'none' }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* product grid */}
        <div>
          {/* active filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {['Hana (Golden)','L','50 – 200k'].map((c, i) => (
              <div key={i} style={{ padding: '4px 10px', border: `1px solid ${WIRE.rule}`, fontSize: 10, letterSpacing: '0.1em', display: 'flex', gap: 6 }}>{c}  {ICONS.close}</div>
            ))}
            <span style={{ fontSize: 11, color: WIRE.inkSoft, padding: '4px 0', borderBottom: `1px solid ${WIRE.rule}` }}>Clear all</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {Array.from({length: 12}).map((_, i) => (
              <div key={i}>
                <div style={{ position: 'relative' }}>
                  <ImgBox ratio="4/5" flat/>
                  {i % 5 === 0 && <div style={{ position: 'absolute', top: 8, left: 8, background: WIRE.paper, fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em' }}>NEW</div>}
                  {i === 3 && <div style={{ position: 'absolute', top: 8, left: 8, background: WIRE.accent, color: WIRE.paper, fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em' }}>LOW STOCK</div>}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>{ICONS.heart}</div>
                  {i === 7 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,241,232,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WIRE.serif, fontSize: 12, letterSpacing: '0.2em' }}>SOLD OUT · L</div>}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>Field Trench</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: WIRE.inkSoft }}>
                    <span>M · L · XL</span>
                    <span style={{ color: WIRE.ink, fontFamily: WIRE.serif }}>₩ 148,000</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 40, fontSize: 11, letterSpacing: '0.14em' }}>
            {['1','2','3','4','5','→'].map((p, i) => (
              <div key={i} style={{ padding: '8px 12px', border: i === 0 ? `1px solid ${WIRE.ink}` : 'none', background: i === 0 ? WIRE.ink : 'transparent', color: i === 0 ? WIRE.paper : WIRE.ink }}>{p}</div>
            ))}
          </div>
        </div>
      </div>
      <DFooter/>
    </div>
  );
}

// ─── D3 · PDP ─────────────────────────────────────────────────
function D3_PDP() {
  return (
    <div className="wire" style={{ background: WIRE.paper, width: '100%' }}>
      <DHeader/>
      <div style={{ padding: '20px 40px 0', fontSize: 11, color: WIRE.inkSoft }}>Shop / Outerwear / Field Trench</div>

      <div style={{ padding: '20px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr 420px', gap: 30 }}>
        {/* thumbs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => (
            <ImgBox key={i} ratio="1" flat style={{ border: i === 1 ? `1.5px solid ${WIRE.ink}` : undefined }}/>
          ))}
        </div>

        {/* hero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ImgBox ratio="4/5" flat label="golden · field trench"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ImgBox ratio="4/5" flat/>
            <ImgBox ratio="4/5" flat/>
          </div>
        </div>

        {/* buy rail */}
        <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
          <Eyebrow>Muzzle Atelier · SS26</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 36, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1 }}>
            Field Trench,<br/><span style={{ fontStyle: 'italic' }}>Oat</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 24 }}>₩ 148,000</div>
            <div style={{ fontSize: 11, color: WIRE.inkSoft }}>★ 4.8 · 213 reviews</div>
          </div>

          <div style={{ marginTop: 20, border: `1px solid ${WIRE.ink}`, padding: 14, background: WIRE.fill }}>
            <Eyebrow>Fit for Hana</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 18, marginTop: 2 }}>Recommended · <span style={{ fontStyle: 'italic', color: WIRE.accent }}>size L</span></div>
            <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 4 }}>가슴 72 · 등 68 · 28kg · Sporty build</div>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', marginTop: 10 }}>WHY THIS SIZE? →</div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Eyebrow>Size</Eyebrow>
              <span style={{ fontSize: 11, letterSpacing: '0.14em', borderBottom: `1px solid ${WIRE.ink}` }}>SIZE GUIDE →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              {[
                ['M', '3 left'], ['L', '12 left · fit ★', true],
                ['XL', '5 left'], ['XXL', 'sold', false, true],
              ].map(([s, st, sel, out], i) => (
                <div key={i} style={{
                  padding: '10px 12px', border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`,
                  background: sel ? WIRE.ink : 'transparent',
                  color: sel ? WIRE.paper : WIRE.ink, opacity: out ? 0.4 : 1,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span style={{ fontFamily: WIRE.serif, fontSize: 16 }}>{s}</span>
                  <span style={{ fontSize: 10 }}>{st}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <Eyebrow>Color · Oat</Eyebrow>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {[['#d6c9a6', true],['#4a463d'],['#7a2e2e'],['#2a2420']].map(([c, sel], i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: `1px solid ${WIRE.rule}`, boxShadow: sel ? `0 0 0 1.5px ${WIRE.paper}, 0 0 0 2.5px ${WIRE.ink}` : 'none' }}/>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', gap: 10 }}>
            <div style={{ width: 48, height: 48, border: `1px solid ${WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.heart}</div>
            <WireBtn block size="lg" style={{ flex: 1 }}>Add to bag</WireBtn>
          </div>
          <div style={{ marginTop: 10 }}>
            <WireBtn primary size="lg" block>Buy now · ₩ 148,000</WireBtn>
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: WIRE.inkSoft }}>
            <div>✓ Free shipping · 2–4 days</div>
            <div>✓ 30일 교환 · 환불</div>
            <div>✓ Sizing consult (1:1 chat) →</div>
          </div>
        </div>
      </div>

      {/* editorial description + spec */}
      <div style={{ padding: '40px', borderTop: `1px solid ${WIRE.rule}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <Eyebrow>The Garment</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 28, fontStyle: 'italic', lineHeight: 1.2, marginTop: 6 }}>
            "A field trench, re-cut for a long-backed hound — waxed cotton, bone-horn buttons, a roomy chest."
          </div>
          <TextBlock lines={5} gap={7} lastW="40%" style={{ marginTop: 20 }}/>
        </div>
        <div>
          {[
            ['Material', 'Waxed cotton · cotton lining · bone horn'],
            ['Cut',      'Long-back fit · chest + 4cm ease'],
            ['Care',     'Wipe clean · no machine wash'],
            ['Made in',  'Porto, Portugal · family atelier'],
            ['Delivery', '2–4 days · free over ₩100k'],
            ['Returns',  '30 days · free pickup'],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', padding: '14px 0', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
              <span style={{ fontSize: 10, letterSpacing: '0.16em', color: WIRE.inkSoft }}>{k.toUpperCase()}</span>
              <span style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* reviews */}
      <div style={{ padding: '40px', background: WIRE.paperDeep }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <Eyebrow>Reviews · 213</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 36, fontStyle: 'italic', marginTop: 4 }}>What other hounds say.</div>
          </div>
          <WireBtn>Write a review</WireBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 26 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: WIRE.paper, padding: 20, border: `1px solid ${WIRE.ruleSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ImgBox w={40} h={40} flat style={{ borderRadius: '50%' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>Hana · Golden · 28kg</div>
                  <div style={{ fontSize: 10, color: WIRE.inkSoft }}>Sporty · 가슴 72 · 등 68</div>
                </div>
                <div style={{ color: WIRE.accent, fontSize: 11 }}>★★★★★</div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: WIRE.inkSoft, marginTop: 8, textTransform: 'uppercase' }}>L · 딱 맞아요</div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>"어깨가 넓은 편인데 가슴이 여유있어서 정말 편해 보여요."</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {[1,2].map(j => <ImgBox key={j} w={72} h={72} flat/>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DFooter/>
    </div>
  );
}

// ─── D4 · CHECKOUT (desktop 2-col) ────────────────────────────
function D4_Checkout() {
  return (
    <div className="wire" style={{ background: WIRE.paper, width: '100%', minHeight: 800 }}>
      <div style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${WIRE.rule}` }}>
        <div style={{ fontFamily: WIRE.serif, fontSize: 28, fontStyle: 'italic' }}>Muzzle</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, letterSpacing: '0.14em' }}>
          <span style={{ color: WIRE.accent }}>1 · CHECKOUT</span>
          <span style={{ color: WIRE.inkSoft }}>→  2 · CONFIRM</span>
          <span style={{ color: WIRE.inkSoft }}>→  3 · DONE</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', color: WIRE.inkSoft }}>🔒 SECURE</div>
      </div>

      <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60 }}>
        {/* main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div>
            <Eyebrow>01 · Contact</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 26, letterSpacing: '-0.01em', marginTop: 4 }}>Who shall we write to?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
              {[['Email','hana@muzzle.co'],['Phone','010 · 3456 · 7890']].map(([k,v], i) => (
                <div key={i}>
                  <Eyebrow>{k}</Eyebrow>
                  <div style={{ borderBottom: `1px solid ${WIRE.rule}`, padding: '10px 0', fontFamily: WIRE.serif, fontSize: 15 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>02 · Shipping</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 26, letterSpacing: '-0.01em', marginTop: 4 }}>Deliver to Hana's home.</div>
            <div style={{ marginTop: 16, border: `1px solid ${WIRE.ink}`, padding: 18, background: WIRE.fill, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: WIRE.serif, fontSize: 15 }}>Hana Kim · 자택</div>
                <div style={{ fontSize: 12, color: WIRE.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
                  서울 성동구 왕십리로 222, 2층 · 04777
                </div>
              </div>
              <span style={{ fontSize: 10, letterSpacing: '0.16em', alignSelf: 'flex-start' }}>CHANGE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
              {[['Standard','2–4 days · FREE', true],['Express','1 day · ₩ 7,000'],['Pickup · Seongsu','tomorrow · FREE']].map(([t, d, sel], i) => (
                <div key={i} style={{ border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, padding: 14, background: sel ? WIRE.fill : 'transparent' }}>
                  <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{t}</div>
                  <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 4 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>03 · Payment</Eyebrow>
            <div style={{ fontFamily: WIRE.serif, fontSize: 26, letterSpacing: '-0.01em', marginTop: 4 }}>How would you like to pay?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 14 }}>
              {[['Card', true],['Apple Pay'],['Kakao'],['Naver'],['Toss']].map(([t, sel], i) => (
                <div key={i} style={{ padding: '12px 0', textAlign: 'center', border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, background: sel ? WIRE.fill : 'transparent', fontFamily: WIRE.serif, fontSize: 13 }}>{t}</div>
              ))}
            </div>

            <div style={{ marginTop: 16, border: `1px solid ${WIRE.ruleSoft}`, padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
                {[['Card number','4532 · · · · · · · · · · · · 4412'],['MM / YY','09 / 28'],['CVC','· · ·']].map(([k, v], i) => (
                  <div key={i}>
                    <Eyebrow>{k}</Eyebrow>
                    <div style={{ borderBottom: `1px solid ${WIRE.rule}`, padding: '8px 0', fontFamily: WIRE.serif, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', fontSize: 11, color: WIRE.inkSoft }}>
                <div style={{ width: 14, height: 14, background: WIRE.ink, border: `1px solid ${WIRE.ink}`, color: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.tick}</div>
                다음에도 이 카드 저장
              </div>
            </div>
          </div>
        </div>

        {/* order summary sidebar */}
        <div style={{ border: `1px solid ${WIRE.rule}`, padding: 24, background: WIRE.paper, height: 'fit-content', position: 'sticky', top: 20 }}>
          <Eyebrow>Your order</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 24, fontStyle: 'italic', marginTop: 4 }}>4 pieces for Hana</div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Field Trench · Oat · L', '148,000', 1],
              ['Rain Shell · Ink · L',  '88,000',  1],
              ['Canvas Harness · L',     '116,000', 2],
            ].map(([n, p, q], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <ImgBox w={54} h={66} flat/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>{n}</div>
                  <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>QTY {q} · FIT ✓</div>
                </div>
                <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>₩ {p}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, borderTop: `1px solid ${WIRE.ruleSoft}`, paddingTop: 14 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, border: `1px solid ${WIRE.rule}`, padding: '8px 10px', fontSize: 12, color: WIRE.inkSoft }}>Promo code</div>
              <WireBtn size="sm">Apply</WireBtn>
            </div>
            <div style={{ fontSize: 11, color: WIRE.accent, marginTop: 8, fontFamily: WIRE.hand, fontSize: 14 }}>✓ FIRST-10 적용됨 − ₩ 35,200</div>
          </div>

          <div style={{ marginTop: 16, borderTop: `1px solid ${WIRE.ruleSoft}`, paddingTop: 14 }}>
            {[['Subtotal','352,000'],['Shipping','FREE'],['Coupon','− 35,200']].map(([k,v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, color: WIRE.inkSoft }}>
                <span>{k}</span><span style={{ fontFamily: WIRE.serif, color: WIRE.ink, fontSize: 13 }}>₩ {v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${WIRE.rule}` }}>
              <span style={{ fontFamily: WIRE.serif, fontSize: 18 }}>Total</span>
              <span style={{ fontFamily: WIRE.serif, fontSize: 24 }}>₩ 316,800</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <WireBtn primary block size="lg">Place order · ₩ 316,800</WireBtn>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', color: WIRE.inkSoft, marginTop: 10, textAlign: 'center' }}>
            결제 시 이용약관 · 개인정보 처리방침에 동의한 것으로 간주됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DHeader, DFooter, D1_Home, D2_PLP, D3_PDP, D4_Checkout });
