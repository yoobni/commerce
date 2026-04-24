// Mobile screens — Part 2: Category, Search, Filter, PLP, PDP, Review

// ─── 08 · CATEGORY / PLP with filters ─────────────────────────
function M08_Category() {
  const items = [
    { n: 'Field Trench', p: '148,000', t: 'M · L · XL · XXL', stock: true },
    { n: 'Wool Chore Coat', p: '196,000', t: 'L · XL · XXL', stock: true, low: true },
    { n: 'Rain Shell', p: '88,000', t: 'M · L · XL', stock: true },
    { n: 'Knit Pullover', p: '72,000', t: 'L · XL', stock: false },
    { n: 'Puffer Vest', p: '124,000', t: 'M · L · XL · XXL', stock: true },
    { n: 'Canvas Harness', p: '58,000', t: 'L · XL', stock: true },
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }}>
      <TopBar left={ICONS.back} right={<div style={{ display:'flex', gap:10, color: WIRE.ink }}>{ICONS.search}{ICONS.bag}</div>} center=""/>
      <div style={{ padding: '8px 16px 14px' }}>
        <Eyebrow>Outerwear</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 30, letterSpacing: '-0.02em' }}>Coats & Jackets</div>
        <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 2 }}>52 pieces · Golden · Sporty · L</div>
      </div>

      {/* sort + filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${WIRE.rule}`, borderBottom: `1px solid ${WIRE.rule}`, padding: '10px 16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, letterSpacing: '0.1em' }}>
          {ICONS.filter} FILTER · 3
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
          NEWEST {ICONS.chev}
        </div>
      </div>

      {/* active filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 16px', overflow: 'auto' }}>
        {['Golden Fit', 'L', '50k–200k'].map((c, i) => (
          <div key={i} style={{ padding: '4px 10px', border: `1px solid ${WIRE.rule}`, fontSize: 10, letterSpacing: '0.1em', display: 'flex', gap: 6, alignItems: 'center' }}>
            {c} {ICONS.close}
          </div>
        ))}
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <ImgBox ratio="4/5" flat label={it.n.toLowerCase()}/>
              <div style={{ position: 'absolute', top: 8, right: 8, color: WIRE.ink }}>{ICONS.heart}</div>
              {it.low && (
                <div style={{ position: 'absolute', top: 8, left: 8, background: WIRE.paper, fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em', border: `1px solid ${WIRE.rule}` }}>LOW STOCK</div>
              )}
              {!it.stock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,241,232,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WIRE.serif, fontSize: 12, letterSpacing: '0.2em' }}>SOLD OUT</div>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>{it.n}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.04em' }}>{it.t}</div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13, marginTop: 2 }}>₩ {it.p}</div>
            </div>
          </div>
        ))}
      </div>
    </MScreen>
  );
}

// ─── 09 · FILTER SHEET ────────────────────────────────────────
function M09_FilterSheet() {
  const rows = [
    ['Fit for', 'Golden · Sporty', true],
    ['Size',    'L (selected)',    true],
    ['Category','Outerwear',       false],
    ['Color',   'Neutrals',        false],
    ['Price',   '50k – 200k',      true],
    ['Material','—',               false],
    ['Rating',  '4★ and up',       false],
  ];
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: 'rgba(42,36,32,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: WIRE.paper, borderTopLeftRadius: 0, borderTop: `1px solid ${WIRE.rule}`, padding: 0, maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <div style={{ width: 40, height: 3, background: WIRE.rule }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${WIRE.rule}` }}>
          <span style={{ fontSize: 11, letterSpacing: '0.16em' }}>FILTER & SORT</span>
          <span style={{ color: WIRE.ink }}>{ICONS.close}</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {rows.map(([k, v, active], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
              <div>
                <div style={{ fontFamily: WIRE.serif, fontSize: 16 }}>{k}</div>
                <div style={{ fontSize: 11, color: active ? WIRE.accent : WIRE.inkSoft, marginTop: 2, fontStyle: active ? 'italic' : 'normal' }}>{v}</div>
              </div>
              <div style={{ color: WIRE.inkSoft }}>{ICONS.chev}</div>
            </div>
          ))}

          <div style={{ padding: '16px 20px' }}>
            <Eyebrow style={{ marginBottom: 10 }}>Sort by</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Newest','Best fit for Hana','Popular','Price ↑','Price ↓','Review ★'].map((s, i) => (
                <div key={i} style={{
                  padding: '6px 12px', fontSize: 11,
                  border: `1px solid ${i === 1 ? WIRE.ink : WIRE.rule}`,
                  background: i === 1 ? WIRE.ink : 'transparent',
                  color: i === 1 ? WIRE.paper : WIRE.ink,
                }}>{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${WIRE.rule}`, display: 'flex', gap: 10 }}>
          <WireBtn ghost>Reset</WireBtn>
          <WireBtn primary block size="lg">Show 27 pieces</WireBtn>
        </div>
      </div>
    </div>
  );
}

// ─── 10 · SEARCH · empty state ────────────────────────────────
function M10_Search() {
  return (
    <MScreen mastProps={{ tab: 'search' }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${WIRE.rule}`, padding: '10px 12px' }}>
          <span style={{ color: WIRE.inkSoft }}>{ICONS.search}</span>
          <span style={{ fontSize: 13, color: WIRE.inkSoft, flex: 1 }}>검색 — breed, item, material</span>
          <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>CANCEL</span>
        </div>

        <div style={{ marginTop: 28 }}>
          <Eyebrow>In season</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 22, fontStyle: 'italic', marginTop: 4 }}>Trending right now</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {['trench coat', 'golden M', 'rain shell', 'bernese XL', 'harness leather', 'reflective'].map((t, i) => (
              <div key={i} style={{ padding: '6px 12px', border: `1px solid ${WIRE.rule}`, fontSize: 11, display: 'flex', gap: 6 }}>
                <span style={{ color: WIRE.inkSoft }}>{String(i+1).padStart(2,'0')}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>Recent</Eyebrow>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>CLEAR</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['golden 겨울코트', 'rain jacket XL', '하네스'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: WIRE.inkSoft }}>{ICONS.search}</span>
                  <span style={{ fontSize: 13 }}>{t}</span>
                </div>
                <span style={{ color: WIRE.inkSoft }}>{ICONS.close}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <Eyebrow>From The Journal</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            {[1,2].map(i => (
              <div key={i}>
                <ImgBox ratio="4/5" flat label="journal" />
                <div style={{ fontFamily: WIRE.serif, fontSize: 12, marginTop: 6, lineHeight: 1.2 }}>Measuring the long-backed</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MScreen>
  );
}

// ─── 11 · SEARCH · autocomplete ───────────────────────────────
function M11_SearchType() {
  const sugg = [
    { q: 'golden retriever', n: '24 results' },
    { q: 'golden trench coat', n: '7 results' },
    { q: 'golden fit · wool', n: '12 results' },
    { q: 'golden hour journal', n: 'story' },
  ];
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${WIRE.ink}`, padding: '8px 12px' }}>
          <span style={{ color: WIRE.ink }}>{ICONS.search}</span>
          <span style={{ fontSize: 13, color: WIRE.ink, flex: 1 }}>golden<span style={{ background: WIRE.accent, color: WIRE.paper, opacity: 0.9, marginLeft: 1, width: 1, display: 'inline-block', height: 14, verticalAlign: 'middle' }}>|</span></span>
          <span style={{ color: WIRE.inkSoft }}>{ICONS.close}</span>
        </div>
        <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>CANCEL</span>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <Eyebrow>Suggestions</Eyebrow>
      </div>
      <div>
        {sugg.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderTop: `1px solid ${WIRE.ruleSoft}`,
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ color: WIRE.inkSoft }}>{ICONS.search}</span>
              <div>
                <div style={{ fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>golden</span>
                  <span style={{ color: WIRE.inkSoft }}> {s.q.replace('golden','').trim()}</span>
                </div>
                <div style={{ fontSize: 10, color: WIRE.inkSoft, marginTop: 2, letterSpacing: '0.08em' }}>{s.n}</div>
              </div>
            </div>
            <span style={{ color: WIRE.inkSoft, fontSize: 14 }}>↖</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <Eyebrow>Top products</Eyebrow>
      </div>
      <div style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px 16px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flexShrink: 0, width: 130 }}>
            <ImgBox w={130} h={160} flat label={`golden ${i}`}/>
            <div style={{ fontFamily: WIRE.serif, fontSize: 12, marginTop: 6 }}>Field Trench</div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft }}>₩ 148,000</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>
      {/* keyboard placeholder */}
      <div style={{ background: WIRE.paperDeep, height: 230, borderTop: `1px solid ${WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WIRE.hand, color: WIRE.inkSoft, fontSize: 15 }}>
        keyboard
      </div>
    </div>
  );
}

// ─── 12 · PDP · Product Detail ────────────────────────────────
function M12_PDP() {
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <div className="wire-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {/* hero gallery */}
        <div style={{ position: 'relative' }}>
          <ImgBox ratio="3/4" flat label="PDP hero · golden in trench"/>
          <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.back}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.heart}</div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.bag}</div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? WIRE.ink : WIRE.ruleSoft }}/>)}
          </div>
        </div>

        {/* title strip */}
        <div style={{ padding: 20, borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
          <Eyebrow>Muzzle Atelier · SS26</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
            Field Trench, <span style={{ fontStyle: 'italic' }}>Oat</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 20 }}>₩ 148,000</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: WIRE.inkSoft }}>
              <span style={{ color: WIRE.accent }}>{ICONS.star}</span> 4.8 · 213 reviews
            </div>
          </div>
        </div>

        {/* Fit-for-your-dog card */}
        <div style={{ margin: 20, border: `1px solid ${WIRE.ink}`, padding: 16, background: WIRE.fill, position: 'relative' }}>
          <Eyebrow>Fit for Hana</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 20, marginTop: 2 }}>
            Recommended size · <span style={{ fontStyle: 'italic', color: WIRE.accent }}>L</span>
          </div>
          <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 4 }}>
            가슴 72cm · 등 68cm · 체중 28kg — Golden · Sporty 핏 기준
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, color: WIRE.ink }}>
            WHY L? <span style={{ color: WIRE.inkSoft }}>{ICONS.chev}</span>
          </div>
        </div>

        {/* size + color selector */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Eyebrow>Size</Eyebrow>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.ink, borderBottom: `1px solid ${WIRE.ink}` }}>SIZE GUIDE</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              ['M', 'left 3'],
              ['L', 'left 12', true],
              ['XL', 'left 5'],
              ['XXL', 'sold out', false, true],
            ].map(([s, stock, sel, out], i) => (
              <div key={i} style={{
                flex: '1 1 40%', padding: '10px 12px',
                border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`,
                background: sel ? WIRE.ink : 'transparent',
                color: sel ? WIRE.paper : WIRE.ink,
                opacity: out ? 0.4 : 1,
                position: 'relative',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: WIRE.serif, fontSize: 16 }}>{s}</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>{stock}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <Eyebrow>Color · Oat</Eyebrow>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {[['#d6c9a6', true],['#4a463d', false],['#7a2e2e', false],['#2a2420', false]].map(([c, sel], i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: '50%', background: c,
                  border: `1px solid ${WIRE.rule}`,
                  boxShadow: sel ? `0 0 0 1.5px ${WIRE.paper}, 0 0 0 2.5px ${WIRE.ink}` : 'none',
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* editorial description */}
        <div style={{ padding: '20px 20px 0', borderTop: `1px solid ${WIRE.ruleSoft}` }}>
          <Eyebrow>The Garment</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, marginTop: 8, color: WIRE.ink }}>
            "A traditional field trench, re-cut for a long-backed hound — waxed cotton, bone horn buttons, a roomy chest."
          </div>
          <TextBlock lines={4} gap={7} style={{ marginTop: 14 }}/>
        </div>

        {/* detail rows */}
        <div style={{ padding: '20px' }}>
          {[
            ['Material', 'Waxed cotton · cotton lining'],
            ['Care', 'Wipe clean · no machine wash'],
            ['Made in', 'Porto, Portugal'],
            ['Delivery', '2–4 days · free over ₩100k'],
          ].map(([k,v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
              <span style={{ fontSize: 11, letterSpacing: '0.14em', color: WIRE.inkSoft }}>{k.toUpperCase()}</span>
              <span style={{ fontFamily: WIRE.serif, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* reviews teaser */}
        <div style={{ padding: 20, background: WIRE.paperDeep }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Eyebrow>Reviews · 213</Eyebrow>
            <span style={{ fontSize: 10, letterSpacing: '0.14em' }}>ALL →</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 42, letterSpacing: '-0.02em' }}>4.8</div>
            <div style={{ flex: 1 }}>
              {[5,4,3,2,1].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 9, width: 10 }}>{s}</span>
                  <div style={{ flex: 1, height: 3, background: WIRE.ruleSoft }}>
                    <div style={{ width: `${[80,14,4,1,1][5-s]}%`, height: '100%', background: WIRE.ink }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['딱 맞아요 · 182', '큼직 · 18', '작음 · 13'].map((t, i) => (
              <div key={i} style={{ padding: '4px 10px', border: `1px solid ${WIRE.rule}`, fontSize: 10, letterSpacing: '0.08em' }}>{t}</div>
            ))}
          </div>

          {/* photo reviews strip */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, overflow: 'auto' }}>
            {[1,2,3,4,5].map(i => (
              <ImgBox key={i} w={100} h={100} flat label="review pic" style={{ flexShrink: 0 }}/>
            ))}
          </div>
        </div>

        {/* you may also like */}
        <div style={{ padding: 20 }}>
          <Eyebrow>You may also like</Eyebrow>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto', marginTop: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 130 }}>
                <ImgBox w={130} h={160} flat/>
                <div style={{ fontFamily: WIRE.serif, fontSize: 12, marginTop: 6 }}>Wool Coat</div>
                <div style={{ fontSize: 10, color: WIRE.inkSoft }}>₩ 196,000</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{ padding: 14, borderTop: `1px solid ${WIRE.rule}`, background: WIRE.paper, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, border: `1px solid ${WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WIRE.ink }}>{ICONS.heart}</div>
        <WireBtn block style={{ flex: 1 }}>Add to bag</WireBtn>
        <WireBtn primary size="lg" style={{ flex: 1.2 }}>Buy now · 148k</WireBtn>
      </div>
    </div>
  );
}

// ─── 13 · REVIEWS · Detail ────────────────────────────────────
function M13_Reviews() {
  const reviews = [
    { name: 'Hana · Golden · 28kg', size: 'L 구매 · 딱 맞아요', rating: 5, txt: '어깨가 넓은 편인데 가슴이 여유있어서 정말 편해 보여요. 왁스 마감도 실제로 보니 더 고급스럽네요.', imgs: 3, body: 'Sporty · 가슴 72 · 등 68' },
    { name: 'Duke · Labrador · 32kg', size: 'XL 구매 · 조금 큼', rating: 4, txt: '래브라도 XL인데 가슴이 살짝 남네요. 그래도 겨울엔 레이어 가능해서 만족.', imgs: 2, body: 'Sturdy · 가슴 78 · 등 72' },
    { name: 'Momo · Bernese · 45kg', size: 'XXL 구매 · 딱 맞아요', rating: 5, txt: '', imgs: 5, body: 'Sturdy · 가슴 90 · 등 80' },
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right="" center="Reviews · 213"/>
      {/* summary */}
      <div style={{ padding: 20, borderBottom: `1px solid ${WIRE.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontFamily: WIRE.serif, fontSize: 44, letterSpacing: '-0.02em' }}>4.8</div>
          <div style={{ color: WIRE.accent }}>★★★★★</div>
        </div>
        <div style={{ fontSize: 11, color: WIRE.inkSoft }}>213 verified reviews · 156 with photos</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
          {[['Fit','딱 맞아요','86%'],['Quality','프리미엄','92%'],['Color','사진과 동일','81%']].map(([k,v,p], i) => (
            <div key={i} style={{ border: `1px solid ${WIRE.ruleSoft}`, padding: 10 }}>
              <Eyebrow>{k}</Eyebrow>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13, marginTop: 2 }}>{v}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft }}>{p} 선택</div>
            </div>
          ))}
        </div>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflow: 'auto', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
        {['Photos only','Golden','My size (L)','5 ★','Verified'].map((c, i) => (
          <div key={i} style={{ padding: '5px 10px', border: `1px solid ${i === 0 ? WIRE.ink : WIRE.rule}`, fontSize: 10, letterSpacing: '0.1em', background: i === 0 ? WIRE.ink : 'transparent', color: i === 0 ? WIRE.paper : WIRE.ink }}>{c}</div>
        ))}
      </div>

      <div>
        {reviews.map((r, i) => (
          <div key={i} style={{ padding: 20, borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ImgBox w={40} h={40} flat style={{ borderRadius: '50%' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.06em' }}>{r.body}</div>
              </div>
              <div style={{ color: WIRE.accent, fontSize: 11 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, letterSpacing: '0.12em', color: WIRE.inkSoft, textTransform: 'uppercase' }}>{r.size}</div>
            {r.txt && <div style={{ fontFamily: WIRE.serif, fontSize: 14, lineHeight: 1.45, marginTop: 8 }}>"{r.txt}"</div>}
            {!!r.imgs && (
              <div style={{ display: 'flex', gap: 6, marginTop: 12, overflow: 'auto' }}>
                {Array.from({ length: r.imgs }).map((_, j) => <ImgBox key={j} w={80} h={80} flat style={{ flexShrink: 0 }}/>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.1em' }}>
              <span>♡ 24</span>
              <span>REPLY</span>
              <span>REPORT</span>
            </div>
          </div>
        ))}
      </div>
    </MScreen>
  );
}

Object.assign(window, {
  M08_Category, M09_FilterSheet, M10_Search, M11_SearchType, M12_PDP, M13_Reviews,
});
