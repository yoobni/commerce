// ─── Direction B · Modern crisp — 5 core screens ──────────────
// Fraunces serif display + disciplined grid. More product-forward.

function BIcon({ d, t, size = 22, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={t.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}
const BI = {
  back:  (t) => <BIcon t={t} d="M15 4 L 7 12 L 15 20"/>,
  close: (t) => <BIcon t={t} d="M5 5 L 19 19 M19 5 L 5 19"/>,
  search:(t) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="1.4" strokeLinecap="round"><circle cx="11" cy="11" r="6"/><path d="M16 16 L 21 21"/></svg>,
  heart: (t, f) => <svg width="22" height="22" viewBox="0 0 24 24" stroke={t.ink} strokeWidth="1.4" fill={f || 'none'}><path d="M12 20 Q 3 13, 3 8 Q 3 4, 7 4 Q 10 4, 12 7 Q 14 4, 17 4 Q 21 4, 21 8 Q 21 13, 12 20 Z" strokeLinejoin="round"/></svg>,
  bag: (t, n) => (
    <div style={{ position: 'relative' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="1.4" strokeLinejoin="round"><path d="M5 8 L 19 8 L 18 21 L 6 21 Z"/><path d="M9 8 V 6 Q 9 3, 12 3 Q 15 3, 15 6 V 8"/></svg>
      {n > 0 && <div style={{ position: 'absolute', top: -4, right: -4, background: t.accent, color: '#fff', borderRadius: 999, width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{n}</div>}
    </div>
  ),
};

function BTopBar({ t, left, right, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', background: t.bg }}>
      <div style={{ minWidth: 24, display: 'flex', gap: 14 }}>{left}</div>
      <div style={{ fontFamily: t.sans, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ minWidth: 24, display: 'flex', gap: 16 }}>{right}</div>
    </div>
  );
}

// ─── B · Home ────────────────────────────────────────────────
function B_Home({ t }) {
  return (
    <Phone t={t}>
      <BTopBar t={t}
        left={<div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>Muzzle.</div>}
        title=""
        right={<>{BI.search(t)}{BI.bag(t, 2)}</>}
      />

      <div style={{ padding: '4px 20px 20px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 42, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500 }}>
          Outfitters for the<br/>larger hound.
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
          Spring collection for golden, retriever, malamute &amp; friends.
        </div>
      </div>

      {/* hero w/ pinned info card */}
      <div style={{ padding: '0 20px', position: 'relative' }}>
        <div style={{ borderRadius: t.r.lg, overflow: 'hidden', background: t.bgDeep }}>
          <IllusScene stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
        </div>
        <div style={{
          position: 'absolute', bottom: 16, left: 32, right: 32,
          padding: 14, background: t.surface, borderRadius: t.r.md,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: t.mode === 'dark' ? '0 4px 18px rgba(0,0,0,0.5)' : '0 4px 18px rgba(0,0,0,0.08)',
        }}>
          <div style={{ width: 44, height: 54, borderRadius: t.r.sm, background: t.bgDeep, overflow: 'hidden' }}>
            <ProductIllus t={t} seed={0} ratio="auto" style={{ height: '100%' }}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>FEATURED</div>
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, marginTop: 2 }}>Field Trench · Oat</div>
            <div style={{ fontSize: 11, color: t.inkMute, marginTop: 1 }}>₩ 148,000 · in stock</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.ink, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>→</div>
        </div>
      </div>

      {/* Category pills */}
      <div className="mz-scroll" style={{ display: 'flex', gap: 8, padding: '32px 20px 0', overflowX: 'auto' }}>
        {['All','Outerwear','Knits','Rainwear','Harness','Accessories'].map((c, i) => (
          <Chip t={t} active={i === 0} key={c}>{c}</Chip>
        ))}
      </div>

      <div style={{ padding: '24px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>FIT FOR HANA</div>
          <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, marginTop: 2 }}>Picked for your hound</div>
        </div>
        <div style={{ fontSize: 12, color: t.inkMute }}>View all</div>
      </div>

      {/* Grid 2col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 20px 8px' }}>
        {[0,1,2,3].map(i => (
          <div key={i}>
            <div style={{ position: 'relative', borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep }}>
              <ProductIllus t={t} seed={i} ratio="1"/>
              <div style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {BI.heart(t)}
              </div>
              <div style={{ position: 'absolute', bottom: 8, left: 8, background: t.surface, padding: '3px 7px', borderRadius: 999, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>★ FIT L</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>{['Field Trench','Wool Chore','Rain Shell','Linen Tee'][i]}</div>
              <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>{['Oat','Ink','Olive','Bone'][i]} · L</div>
              <div style={{ fontFamily: t.sans, fontSize: 13, fontWeight: 600, marginTop: 4 }}>₩ {['148','196','88','62'][i]},000</div>
            </div>
          </div>
        ))}
      </div>

      {/* breed row */}
      <div style={{ padding: '30px 20px 10px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>BY BREED</div>
        <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, marginTop: 2 }}>Shop for your hound</div>
      </div>
      <div className="mz-scroll" style={{ display: 'flex', gap: 10, padding: '0 20px 8px', overflowX: 'auto' }}>
        {['Golden','Retriever','Malamute','Bernese','Samoyed'].map((b, i) => (
          <div key={i} style={{ flexShrink: 0, width: 92, textAlign: 'center' }}>
            <div style={{ width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', background: t.bgDeep }}>
              <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} w={92} h={92} seed={i}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8 }}>{b}</div>
            <div style={{ fontSize: 10, color: t.inkMute, marginTop: 1 }}>{[18,22,14,16,12][i]} pieces</div>
          </div>
        ))}
      </div>

      {/* Journal */}
      <div style={{ padding: '36px 20px 20px' }}>
        <div style={{ padding: 16, background: t.bgDeep, borderRadius: t.r.md, display: 'flex', gap: 14 }}>
          <div style={{ width: 92, height: 92, borderRadius: t.r.sm, overflow: 'hidden', background: t.surface, flexShrink: 0 }}>
            <IllusHound stroke={t.ink} fill={t.surface} accent={t.accent}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>JOURNAL · N°18</div>
            <div style={{ fontFamily: t.serif, fontSize: 17, fontWeight: 500, lineHeight: 1.2, marginTop: 3 }}>Four numbers to the perfect fit.</div>
            <div style={{ fontSize: 11, color: t.inkMute, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>5 min read <span>→</span></div>
          </div>
        </div>
      </div>

      <TabBar t={t} active="home"/>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── B · PLP ──────────────────────────────────────────────────
function B_PLP({ t }) {
  const items = Array.from({length: 8}).map((_, i) => ({
    name: ['Field Trench','Wool Chore','Rain Shell','Linen Tee','Canvas Harness','Oxford Coat','Puffer','Knit Vest'][i],
    color: ['Oat','Ink','Olive','Bone','Ink','Navy','Clay','Cream'][i],
    price: [148,196,88,62,58,188,138,78][i],
    fit: [true,true,false,true,true,false,true,true][i],
  }));
  return (
    <Phone t={t}>
      <BTopBar t={t} left={BI.back(t)} title="Outerwear" right={BI.search(t)}/>

      <div style={{ padding: '2px 20px 14px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>Coats &amp; Jackets</div>
        <div style={{ fontSize: 12, color: t.inkMute, marginTop: 4 }}>52 pieces · <span style={{ color: t.accent, fontWeight: 600 }}>✓ Fit for Hana</span></div>
      </div>

      {/* segmented */}
      <div className="mz-scroll" style={{ display: 'flex', gap: 8, padding: '2px 20px 14px', overflowX: 'auto' }}>
        <Chip t={t} active>Hana (L)</Chip>
        {['Under ₩100k','Oat','Ink','Olive','Wool','Rain','New'].map(c => <Chip t={t} key={c}>{c}</Chip>)}
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 20px', borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, background: t.surface }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" stroke={t.ink} strokeWidth="1.3" fill="none"><line x1="2" y1="4" x2="12" y2="4"/><line x1="2" y1="10" x2="12" y2="10"/><circle cx="9" cy="4" r="2" fill={t.bg}/><circle cx="5" cy="10" r="2" fill={t.bg}/></svg>
          Filter · <span style={{ color: t.accent }}>2</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>Sort · Newest ▾</div>
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 14 }}>
        {items.map((p, i) => (
          <div key={i}>
            <div style={{ position: 'relative', borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep }}>
              <ProductIllus t={t} seed={i} ratio="1"/>
              {p.fit && <div style={{ position: 'absolute', top: 8, left: 8, background: t.accent, color: '#fff', fontSize: 9, padding: '3px 7px', letterSpacing: '0.08em', fontWeight: 700, borderRadius: 999 }}>★ FIT L</div>}
              {i === 3 && <div style={{ position: 'absolute', top: 8, left: 8, background: t.ink, color: t.bg, fontSize: 9, padding: '3px 7px', letterSpacing: '0.08em', fontWeight: 700, borderRadius: 999 }}>NEW</div>}
              <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{BI.heart(t)}</div>
              {i === 6 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', background: `linear-gradient(transparent, rgba(0,0,0,0.65))`, color: '#fff', fontSize: 10, fontWeight: 600 }}>Only 3 left · L</div>}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              </div>
              <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>{p.color}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>₩ {p.price},000</div>
            </div>
          </div>
        ))}
      </div>

      <TabBar t={t} active="home"/>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── B · PDP ──────────────────────────────────────────────────
function B_PDP({ t }) {
  return (
    <Phone t={t}>
      <BTopBar t={t} left={BI.back(t)} title="Field Trench" right={<>{BI.heart(t)}{BI.bag(t, 2)}</>}/>

      <div style={{ background: t.bgDeep, position: 'relative' }}>
        <div style={{ aspectRatio: '1' }}>
          <IllusPortrait stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
        </div>
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <span style={{ padding: '4px 10px', background: t.ink, color: t.bg, borderRadius: 999, fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>SS26</span>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {[0,1,2,3,4].map(i => <div key={i} style={{ width: i === 0 ? 22 : 6, height: 6, borderRadius: 3, background: i === 0 ? t.ink : t.bg, opacity: i === 0 ? 1 : 0.6 }}/>)}
        </div>
      </div>

      <div style={{ padding: '22px 20px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: t.inkMute, fontWeight: 600 }}>MUZZLE ATELIER</div>
            <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.1 }}>Field Trench, Oat</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 600 }}>₩148,000</div>
            <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>★ 4.8 (213)</div>
          </div>
        </div>
      </div>

      {/* Fit card */}
      <div style={{ margin: '10px 20px 0', padding: 14, borderRadius: t.r.md, background: t.accentSoft, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: t.bg, flexShrink: 0 }}>
          <IllusAvatar stroke={t.ink} fill={t.bg} accent={t.accent} w={40} h={40}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: t.accentInk, fontWeight: 700 }}>FIT FOR HANA</div>
          <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, color: t.accentInk, marginTop: 2 }}>Recommended · size L</div>
        </div>
        <div style={{ fontSize: 11, color: t.accentInk, fontWeight: 600 }}>Why →</div>
      </div>

      {/* size */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Size</div>
          <span style={{ fontSize: 12, color: t.inkMute, fontWeight: 500 }}>Size guide →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[['M','3 left'],['L','12', true],['XL','5'],['XXL','sold', false, true]].map(([s, d, sel, out], i) => (
            <div key={i} style={{
              padding: '11px 0', textAlign: 'center',
              border: `1.5px solid ${sel ? t.ink : t.line}`,
              background: sel ? t.ink : t.surface,
              color: sel ? t.bg : t.ink,
              opacity: out ? 0.35 : 1,
              borderRadius: t.r.md,
            }}>
              <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>{s}{sel && <span style={{ color: t.accent, marginLeft: 3 }}>★</span>}</div>
              <div style={{ fontSize: 9, marginTop: 2, opacity: 0.75 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* color */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Color · <span style={{ color: t.inkMute, fontWeight: 400 }}>Oat</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['#D6C9A6', true],['#4A463D'],['#6B2020'],['#4A5237']].map(([c, sel], i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: sel ? `2px solid ${t.ink}` : `1px solid ${t.lineStrong}`, padding: sel ? 3 : 0, boxSizing: 'border-box', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: c }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '26px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>About this piece</div>
        <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.6 }}>
          왁스 코튼 겉감에 코튼 안감. 대형견의 긴 등과 넓은 가슴에 맞춰 재단되었습니다. 본 호른 버튼, 포르투갈 포르토에서 제작.
        </div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        {[['Material','Waxed cotton'],['Cut','Long-back · +4cm ease'],['Made in','Porto, Portugal'],['Care','Wipe clean']].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${t.line}`, fontSize: 12.5 }}>
            <span style={{ color: t.inkMute }}>{k}</span>
            <span style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* reviews summary */}
      <div style={{ padding: '26px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontFamily: t.serif, fontSize: 20, fontWeight: 500 }}>Reviews · 213</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 600 }}>4.8</div>
          </div>
        </div>
        {/* fit distribution */}
        <div style={{ padding: 14, borderRadius: t.r.md, background: t.bgDeep }}>
          <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>Fit feedback</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
            {[['Small', 8],['Fits', 82],['Big', 10]].map(([lbl, pct], i) => (
              <div key={i} style={{ flex: pct, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 2, background: i === 1 ? t.accent : t.lineStrong }}/>
                <div style={{ marginTop: 4 }}>{lbl} · {pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* review cards */}
      <div style={{ padding: '14px 20px 12px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ padding: 14, marginBottom: 10, borderRadius: t.r.md, background: t.surface, border: `1px solid ${t.line}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden' }}>
                <IllusAvatar stroke={t.ink} fill={t.bgDeep} accent={t.accent} w={32} h={32} seed={i+1}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{['Hana','Taro'][i]} · {['Golden, 28kg','Malamute, 42kg'][i]}</div>
                <div style={{ fontSize: 10.5, color: t.inkMute }}>{['L · fits perfectly','XL · slightly large'][i]}</div>
              </div>
              <div style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>★★★★★</div>
            </div>
            <div style={{ fontSize: 13, marginTop: 10, color: t.inkSoft, lineHeight: 1.5 }}>
              "{['어깨가 넓은 편인데 가슴이 여유있어서 편해 보여요.','장모에도 통풍이 잘돼요.'][i]}"
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <Btn t={t} variant="ghost" block>Show all 213 reviews</Btn>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, background: t.bg, display: 'flex', gap: 10 }}>
        <div style={{ width: 50, height: 50, borderRadius: t.r.md, border: `1px solid ${t.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{BI.heart(t)}</div>
        <Btn t={t} variant="primary" block size="lg">Add to bag · ₩148,000</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── B · Cart ─────────────────────────────────────────────────
function B_Cart({ t }) {
  const items = [
    { n: 'Field Trench', c: 'Oat', s: 'L', p: 148, q: 1, seed: 0 },
    { n: 'Rain Shell',   c: 'Ink', s: 'L', p: 88,  q: 1, seed: 2 },
    { n: 'Canvas Harness', c: 'Olive', s: 'L', p: 58, q: 2, seed: 3 },
  ];
  return (
    <Phone t={t}>
      <BTopBar t={t} left={BI.close(t)} title="Bag · 4" right={<span style={{ fontSize: 12, fontWeight: 500, color: t.inkSoft }}>Edit</span>}/>

      <div style={{ padding: '4px 20px 16px' }}>
        <div style={{ fontFamily: t.serif, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em' }}>4 pieces for Hana</div>
        <div style={{ fontSize: 12, color: t.inkMute, marginTop: 4 }}>All fit for L · Golden · Sporty</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {items.map((it, i) => (
          <div key={i} style={{ padding: 14, marginBottom: 8, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r.md, display: 'flex', gap: 12 }}>
            <div style={{ width: 76, height: 94, borderRadius: t.r.sm, overflow: 'hidden', background: t.bgDeep, flexShrink: 0 }}>
              <ProductIllus t={t} seed={it.seed} ratio="auto" style={{ height: '100%' }}/>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div>
                <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>{it.n}</div>
                <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>{it.c} · Size {it.s}</div>
                <div style={{ display: 'inline-block', marginTop: 6, fontSize: 9, letterSpacing: '0.1em', fontWeight: 700, padding: '2px 7px', background: t.accentSoft, color: t.accentInk, borderRadius: 999 }}>✓ FITS</div>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.line}`, borderRadius: 999, background: t.bg }}>
                  <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.inkSoft }}>−</div>
                  <div style={{ minWidth: 22, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>{it.q}</div>
                  <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>₩{(it.p * it.q).toLocaleString()},000</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '22px 20px 10px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>COMPLETE THE LOOK</div>
        <div className="mz-scroll" style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto' }}>
          {[4,5,0,1].map((s, i) => (
            <div key={i} style={{ flexShrink: 0, width: 120 }}>
              <div style={{ borderRadius: t.r.sm, overflow: 'hidden', background: t.bgDeep }}>
                <ProductIllus t={t} seed={s} ratio="1"/>
              </div>
              <div style={{ fontFamily: t.serif, fontSize: 12, marginTop: 6, fontWeight: 500 }}>Leather Leash</div>
              <div style={{ fontSize: 11, color: t.inkMute }}>₩42,000</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ padding: 14, border: `1px dashed ${t.lineStrong}`, borderRadius: t.r.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.1em', fontWeight: 600 }}>COUPON</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>FIRST-10 · <span style={{ color: t.accent }}>− ₩35,200</span></div>
          </div>
          <span style={{ color: t.inkMute }}>›</span>
        </div>
      </div>

      <div style={{ padding: '18px 20px 10px' }}>
        {[['Subtotal','352,000'],['Shipping','FREE'],['Coupon','− 35,200']].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5, color: t.inkSoft }}>
            <span>{k}</span><span style={{ color: t.ink, fontWeight: 500 }}>₩{v}</span>
          </div>
        ))}
        <Rule t={t} style={{ margin: '10px 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Total</span>
          <span style={{ fontFamily: t.serif, fontSize: 24, fontWeight: 600 }}>₩316,800</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}` }}>
        <Btn t={t} variant="primary" block size="lg">Checkout · ₩316,800</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

// ─── B · Checkout ─────────────────────────────────────────────
function B_Checkout({ t }) {
  return (
    <Phone t={t}>
      <BTopBar t={t} left={BI.back(t)} title="Checkout" right={<span style={{ fontSize: 10, color: t.inkMute, fontWeight: 600, letterSpacing: '0.1em' }}>🔒 SSL</span>}/>

      {/* progress */}
      <div style={{ padding: '2px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, fontWeight: 600 }}>
          {['Bag','Checkout','Pay','Done'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: i <= 1 ? t.ink : t.inkMute }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: i <= 1 ? t.accent : 'transparent', color: i <= 1 ? '#fff' : t.inkMute, border: i <= 1 ? 'none' : `1px solid ${t.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {i <= 0 ? '✓' : i + 1}
                </div>
                <span>{s}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: t.line }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ship to */}
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Shipping</div>
        <div style={{ padding: 14, border: `1px solid ${t.line}`, borderRadius: t.r.md, background: t.surface, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500 }}>Hana Kim · 자택</div>
            <div style={{ fontSize: 12, color: t.inkMute, marginTop: 4, lineHeight: 1.5 }}>
              서울 성동구 왕십리로 222, 2층<br/>04777 · 010-3456-7890
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: t.inkSoft }}>Edit</span>
        </div>
      </div>

      {/* delivery */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Delivery method</div>
        {[
          ['Standard', '2–4 days', 'FREE', true],
          ['Express', '1 day · before 2pm', '₩7,000'],
          ['Pickup · Seongsu', 'tomorrow', 'FREE'],
        ].map(([t1, d, p, sel], i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            border: `1.5px solid ${sel ? t.ink : t.line}`,
            borderRadius: t.r.md, marginBottom: 8,
            background: sel ? t.surface : 'transparent',
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? t.ink : t.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {sel && <div style={{ width: 9, height: 9, borderRadius: '50%', background: t.ink }}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500 }}>{t1}</div>
              <div style={{ fontSize: 11, color: t.inkMute, marginTop: 1 }}>{d}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{p}</div>
          </div>
        ))}
      </div>

      {/* payment */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Payment</div>
        <div style={{ padding: 14, borderRadius: t.r.md, background: t.accentSoft, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 32, borderRadius: 4, background: t.ink, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, letterSpacing: '0.1em', fontWeight: 700 }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, color: t.accentInk }}>•••• 4412</div>
            <div style={{ fontSize: 10.5, color: t.accentInk, opacity: 0.7, marginTop: 1 }}>Expires 09/28</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: t.accentInk }}>Change</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 10 }}>
          {['Apple','Kakao','Naver','Toss'].map(m => (
            <div key={m} style={{ padding: '10px 0', textAlign: 'center', background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r.sm, fontSize: 11, fontWeight: 600 }}>{m}</div>
          ))}
        </div>
      </div>

      {/* order summary */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ padding: 14, borderRadius: t.r.md, background: t.bgDeep }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Order · 4 items</div>
            <span style={{ fontSize: 11, color: t.inkMute }}>View all</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 40, height: 48, borderRadius: t.r.sm, overflow: 'hidden', background: t.surface }}>
                <ProductIllus t={t} seed={i} ratio="auto" style={{ height: '100%' }}/>
              </div>
            ))}
            <div style={{ width: 40, height: 48, borderRadius: t.r.sm, background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: t.inkMute }}>+1</div>
          </div>
          {[['Subtotal','352,000'],['Shipping','FREE'],['Coupon','− 35,200']].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, color: t.inkSoft }}>
              <span>{k}</span><span style={{ color: t.ink }}>₩{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 8px', fontSize: 11, color: t.inkMute, lineHeight: 1.5 }}>
        주문하기 버튼을 누르면 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${t.line}`, background: t.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600 }}>TOTAL</div>
          <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 600 }}>₩316,800</div>
        </div>
        <Btn t={t} variant="primary" size="lg" style={{ flex: 1 }}>Place order</Btn>
      </div>
      <HomeIndicator t={t}/>
    </Phone>
  );
}

Object.assign(window, { B_Home, B_PLP, B_PDP, B_Cart, B_Checkout, BI, BTopBar });
