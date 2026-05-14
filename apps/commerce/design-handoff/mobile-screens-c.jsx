// Mobile screens — Part 3: Size Guide, Write Review, Cart, Wishlist, Checkout, Order Complete, Tracking, MyPage, Q&A, Refund

// ─── 14 · SIZE GUIDE ──────────────────────────────────────────
function M14_SizeGuide() {
  const rows = [
    ['S',  '40–55',  '26–35', '40–50', '8–15'],
    ['M',  '55–68',  '32–42', '48–58', '14–24'],
    ['L',  '65–78',  '40–52', '58–70', '22–34', true],
    ['XL', '75–90',  '48–60', '68–82', '32–48'],
    ['XXL','88–105', '58–72', '78–95', '45–60'],
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right={ICONS.close} center="Size Guide"/>
      <div style={{ padding: '12px 20px 0' }}>
        <Eyebrow>The Tape-Measure Method</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4 }}>
          <span style={{ fontStyle: 'italic', color: WIRE.accent }}>Three</span> numbers, one perfect fit.
        </div>
      </div>

      <div style={{ padding: 20, position: 'relative' }}>
        <ImgBox ratio="16/10" flat label="measurement diagram"/>
        <StickyNote style={{ position: 'absolute', top: 14, right: 8, maxWidth: 130 }} rotate={2}>
          ↗ ① 가슴 ② 목 ③ 등 마크
        </StickyNote>
      </div>

      <div style={{ padding: '0 20px' }}>
        {[
          ['①', '가슴둘레', '앞다리 겨드랑이 바로 뒤, 가장 두꺼운 곳을 둘러 측정'],
          ['②', '목둘레', '목걸이 자리 — 손가락 2개 여유 있게'],
          ['③', '등길이', '목 밑부터 꼬리 시작점까지 직선으로'],
        ].map(([n, t, d], i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 22, fontStyle: 'italic', color: WIRE.accent, width: 24 }}>{n}</div>
            <div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 15 }}>{t}</div>
              <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        <Eyebrow>Muzzle Size Chart · cm / kg</Eyebrow>
        <div style={{ marginTop: 10, border: `1px solid ${WIRE.rule}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr', padding: '8px', background: WIRE.fillStrong, fontSize: 10, letterSpacing: '0.1em', color: WIRE.inkSoft }}>
            <span></span><span>가슴</span><span>목</span><span>등</span><span>체중</span>
          </div>
          {rows.map(([s, a, b, c, d, hl], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr', padding: '10px 8px', fontSize: 12, fontFamily: WIRE.serif, borderTop: `1px solid ${WIRE.ruleSoft}`, background: hl ? WIRE.fill : 'transparent', color: hl ? WIRE.accent : WIRE.ink }}>
              <span style={{ fontWeight: 600 }}>{s}{hl && ' ★'}</span>
              <span>{a}</span><span>{b}</span><span>{c}</span><span>{d}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: WIRE.hand, fontSize: 14, color: WIRE.inkSoft, marginTop: 10 }}>
          ↑ Hana에게는 <span style={{ color: WIRE.accent }}>L</span>을 추천해 드려요
        </div>
      </div>
    </MScreen>
  );
}

// ─── 15 · WRITE REVIEW ────────────────────────────────────────
function M15_WriteReview() {
  return (
    <MScreen mastProps={{ tab: 'me' }} noTab>
      <TopBar left={ICONS.close} right={<span style={{ fontSize: 10, letterSpacing: '0.16em', color: WIRE.inkSoft }}>SAVE</span>} center="Write review"/>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: `1px solid ${WIRE.ruleSoft}`, paddingBottom: 14 }}>
          <ImgBox w={56} h={68} flat/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 15 }}>Field Trench, Oat</div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>L · delivered 04·18</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Overall</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 32, color: WIRE.accent, letterSpacing: '0.08em', marginTop: 4 }}>★★★★★</div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Size · fit</Eyebrow>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {['작음','딱 맞음','큼'].map((t, i) => (
              <div key={i} style={{ flex: 1, padding: 10, textAlign: 'center', border: `1px solid ${i === 1 ? WIRE.ink : WIRE.rule}`, background: i === 1 ? WIRE.ink : 'transparent', color: i === 1 ? WIRE.paper : WIRE.ink, fontFamily: WIRE.serif, fontSize: 13 }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Your hound</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            {[['견종','Golden'],['체형','Sporty'],['가슴','72cm'],['체중','28kg']].map(([k, v], i) => (
              <div key={i} style={{ border: `1px solid ${WIRE.ruleSoft}`, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, letterSpacing: '0.18em', color: WIRE.inkSoft, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontFamily: WIRE.serif, fontSize: 14, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: WIRE.hand, fontSize: 13, color: WIRE.inkSoft, marginTop: 8 }}>
            ↑ 프로필에서 자동 채움, 수정 가능
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Photos</Eyebrow>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, overflow: 'auto' }}>
            <div style={{ width: 80, height: 80, border: `1px dashed ${WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: WIRE.inkSoft }}>{ICONS.plus}</div>
            {[1,2,3].map(i => <ImgBox key={i} w={80} h={80} flat style={{ flexShrink: 0 }}/>)}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Story</Eyebrow>
          <div style={{ border: `1px solid ${WIRE.rule}`, padding: 12, marginTop: 8, minHeight: 120 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 14, color: WIRE.ink }}>어깨가 넓은 편인데 가슴이 여유있어서…<span style={{ color: WIRE.accent }}>|</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: WIRE.inkSoft, marginTop: 4 }}>
            <span>min 20 chars</span><span>24 / 500</span>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <WireBtn primary block size="lg">리뷰 게시</WireBtn>
        </div>
      </div>
    </MScreen>
  );
}

// ─── 16 · CART ────────────────────────────────────────────────
function M16_Cart() {
  const items = [
    { n: 'Field Trench · Oat',   s: 'L',   p: '148,000', q: 1 },
    { n: 'Rain Shell · Ink',     s: 'L',   p: '88,000',  q: 1 },
    { n: 'Canvas Harness',       s: 'L',   p: '58,000',  q: 2 },
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right={<span style={{ fontSize: 10, letterSpacing: '0.16em' }}>EDIT</span>} center="Bag · 4"/>
      <div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 16, borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
            <ImgBox w={90} h={110} flat/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{it.n}</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em', marginTop: 2 }}>SIZE {it.s} · FIT ✓ Hana</div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', border: `1px solid ${WIRE.rule}`, alignItems: 'center' }}>
                  <div style={{ padding: '6px 10px' }}>{ICONS.minus}</div>
                  <div style={{ padding: '6px 10px', fontFamily: WIRE.serif, fontSize: 13, borderLeft: `1px solid ${WIRE.ruleSoft}`, borderRight: `1px solid ${WIRE.ruleSoft}` }}>{it.q}</div>
                  <div style={{ padding: '6px 10px' }}>{ICONS.plus}</div>
                </div>
                <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>₩ {it.p}</div>
              </div>
            </div>
          </div>
        ))}

        {/* recommendation strip */}
        <div style={{ padding: 16, background: WIRE.paperDeep }}>
          <Eyebrow>Complete the look</Eyebrow>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto', marginTop: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 120 }}>
                <ImgBox w={120} h={140} flat/>
                <div style={{ fontFamily: WIRE.serif, fontSize: 11, marginTop: 6 }}>Leather Leash</div>
                <div style={{ fontSize: 10, color: WIRE.inkSoft }}>₩ 42,000</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <Eyebrow>Coupon</Eyebrow>
          <div style={{ border: `1px solid ${WIRE.rule}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, fontFamily: WIRE.serif }}>FIRST-10 · 10% off</span>
            <span style={{ color: WIRE.inkSoft }}>{ICONS.chev}</span>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          {[['Subtotal','₩ 352,000'],['Shipping','FREE'],['Coupon','− ₩ 35,200']].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 12, color: WIRE.inkSoft }}>
              <span>{k}</span><span style={{ fontFamily: WIRE.serif, color: WIRE.ink, fontSize: 13 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', borderTop: `1px solid ${WIRE.rule}`, marginTop: 6 }}>
            <span style={{ fontFamily: WIRE.serif, fontSize: 16 }}>Total</span>
            <span style={{ fontFamily: WIRE.serif, fontSize: 20 }}>₩ 316,800</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${WIRE.rule}` }}>
        <WireBtn primary block size="lg">결제하기 ·  316,800</WireBtn>
      </div>
    </MScreen>
  );
}

// ─── 17 · WISHLIST ────────────────────────────────────────────
function M17_Wishlist() {
  return (
    <MScreen mastProps={{ tab: 'heart' }}>
      <div style={{ padding: '14px 16px 0' }}>
        <Eyebrow>The Saved Edit</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 28, letterSpacing: '-0.02em' }}>Saved · <span style={{ fontStyle: 'italic' }}>24</span></div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 16px', overflow: 'auto' }}>
        {['All','Coats','Harness','Rain'].map((t, i) => (
          <div key={i} style={{ padding: '5px 12px', border: `1px solid ${i === 0 ? WIRE.ink : WIRE.rule}`, fontSize: 11, letterSpacing: '0.1em', background: i === 0 ? WIRE.ink : 'transparent', color: i === 0 ? WIRE.paper : WIRE.ink }}>{t}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i}>
            <div style={{ position: 'relative' }}>
              <ImgBox ratio="4/5" flat/>
              <div style={{ position: 'absolute', top: 8, right: 8, color: WIRE.accent }}>♥</div>
              {i === 2 && <div style={{ position: 'absolute', top: 8, left: 8, background: WIRE.paper, fontSize: 9, padding: '2px 6px', letterSpacing: '0.1em' }}>PRICE ↓</div>}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>Wool Chore Coat</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft }}>L · in stock</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: WIRE.serif, fontSize: 12 }}>₩ 196,000</span>
                <span style={{ fontSize: 10, letterSpacing: '0.08em', border: `1px solid ${WIRE.rule}`, padding: '2px 6px' }}>+ BAG</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MScreen>
  );
}

// ─── 18 · CHECKOUT ────────────────────────────────────────────
function M18_Checkout() {
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right="" center="Checkout"/>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* order summary pill */}
        <div style={{ border: `1px solid ${WIRE.ruleSoft}`, padding: 12, display: 'flex', gap: 10, alignItems: 'center', background: WIRE.fill }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3].map(i => <ImgBox key={i} w={36} h={44} flat/>)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>4 items · Oat trench +2</div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft }}>view all →</div>
          </div>
          <div style={{ fontFamily: WIRE.serif, fontSize: 16 }}>316,800</div>
        </div>

        <div>
          <Eyebrow>Ship to</Eyebrow>
          <div style={{ borderBottom: `1px solid ${WIRE.rule}`, padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 15 }}>Hana Kim</div>
              <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.ink, borderBottom: `1px solid ${WIRE.ink}` }}>CHANGE</span>
            </div>
            <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
              서울 성동구 왕십리로 222, 2층 · 04777<br/>
              010-3456-7890
            </div>
          </div>
        </div>

        <div>
          <Eyebrow>Delivery</Eyebrow>
          {[
            ['Standard', '2–4 days', 'FREE', true],
            ['Express', '1 day · before 2pm', '₩ 7,000', false],
            ['Pickup — Muzzle Seongsu', 'tomorrow', 'FREE', false],
          ].map(([t, d, p, sel], i) => (
            <div key={i} style={{
              border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`,
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
              marginTop: 10, background: sel ? WIRE.fill : 'transparent',
            }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: WIRE.ink }}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{t}</div>
                <div style={{ fontSize: 10, color: WIRE.inkSoft }}>{d}</div>
              </div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>{p}</div>
            </div>
          ))}
        </div>

        <div>
          <Eyebrow>Payment</Eyebrow>
          <div style={{ border: `1px solid ${WIRE.ink}`, padding: '14px 16px', marginTop: 8, background: WIRE.fill, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 24, background: WIRE.ink, color: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, letterSpacing: '0.1em' }}>VISA</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>Visa · · · · 4412</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft }}>expires 09/28</div>
            </div>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.ink }}>CHANGE</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {['Apple Pay','Kakao','Naver','Toss'].map((t, i) => (
              <div key={i} style={{ flex: 1, border: `1px solid ${WIRE.rule}`, padding: '8px 0', textAlign: 'center', fontSize: 10, letterSpacing: '0.1em' }}>{t}</div>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow>Gift notes (optional)</Eyebrow>
          <div style={{ border: `1px solid ${WIRE.rule}`, padding: 12, marginTop: 6, minHeight: 50, fontSize: 12, color: WIRE.inkSoft }}>
            메시지 카드를 동봉해 드립니다 ·  hand-written
          </div>
        </div>

        <div style={{ fontSize: 11, color: WIRE.inkSoft }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 14, height: 14, border: `1px solid ${WIRE.ink}`, background: WIRE.ink, color: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.tick}</div>
            구매 약관 · 개인정보 수집 동의
          </div>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${WIRE.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>TO PAY</div>
          <div style={{ fontFamily: WIRE.serif, fontSize: 20 }}>₩ 316,800</div>
        </div>
        <WireBtn primary size="lg" style={{ flex: 1, marginLeft: 16 }}>Place order</WireBtn>
      </div>
    </MScreen>
  );
}

// ─── 19 · ORDER COMPLETE ──────────────────────────────────────
function M19_OrderDone() {
  return (
    <div className="wire" style={{ width: '100%', height: '100%', background: WIRE.paper, display: 'flex', flexDirection: 'column' }}>
      <MagMasthead left="" right="ORDER CONFIRMED"/>
      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: WIRE.serif, fontSize: 12, fontStyle: 'italic', letterSpacing: '0.16em', color: WIRE.accent }}>
          — thank you —
        </div>
        <div style={{ fontFamily: WIRE.serif, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 14 }}>
          A package is on<br/>
          <span style={{ fontStyle: 'italic' }}>its way to Hana.</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', color: WIRE.inkSoft, marginTop: 16 }}>ORDER №  MZ-2026-04221</div>

        <div style={{ marginTop: 28, width: '100%' }}>
          <ImgBox ratio="16/8" flat label="illustration · dog w/ package"/>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10, width: '100%' }}>
          <WireBtn block>View receipt</WireBtn>
          <WireBtn primary block>Track shipment</WireBtn>
        </div>

        <Rule style={{ margin: '32px 0 24px', width: '100%' }} label="Also from this collection"/>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {[1,2].map(i => (
            <div key={i}>
              <ImgBox ratio="4/5" flat/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 12, marginTop: 6, textAlign: 'left' }}>Wool Chore Coat</div>
              <div style={{ fontSize: 10, color: WIRE.inkSoft, textAlign: 'left' }}>₩ 196,000</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 20 · SHIPMENT TRACKING ───────────────────────────────────
function M20_Tracking() {
  const steps = [
    ['Placed',     '04·22 · 16:02', true, true],
    ['Confirmed',  '04·22 · 17:30', true, true],
    ['Packed',     '04·23 · 11:10', true, true],
    ['In transit', 'CJ Express',    true, false, 'current'],
    ['Out for delivery', 'est. 04·25',  false],
    ['Delivered',  '',              false],
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right={ICONS.menu} center="Tracking"/>

      <div style={{ padding: 20, borderBottom: `1px solid ${WIRE.rule}` }}>
        <Eyebrow>Order MZ-2026-04221</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4 }}>
          <span style={{ fontStyle: 'italic' }}>En route</span> to you.
        </div>
        <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 4 }}>Arriving Thursday · April 25</div>

        <div style={{ marginTop: 14, position: 'relative' }}>
          <ImgBox ratio="16/8" flat label="map · origin → dest"/>
        </div>
      </div>

      <div style={{ padding: '22px 20px' }}>
        {steps.map(([t, d, done, past, curr], i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18, position: 'relative' }}>
            {/* connector */}
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', left: 7, top: 18, bottom: 0, width: 1, background: done ? WIRE.ink : WIRE.ruleSoft }}/>
            )}
            <div style={{
              width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
              background: done ? WIRE.ink : WIRE.paper,
              border: `1px solid ${done ? WIRE.ink : WIRE.rule}`,
              marginTop: 3,
              boxShadow: curr ? `0 0 0 4px ${WIRE.fill}` : 'none',
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: WIRE.serif, fontSize: 16, fontStyle: curr ? 'italic' : 'normal', color: done ? WIRE.ink : WIRE.inkSoft }}>
                {t}{curr && ' · now'}
              </div>
              <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <Eyebrow>Shipment · 4 items</Eyebrow>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflow: 'auto' }}>
          {[1,2,3,4].map(i => <ImgBox key={i} w={70} h={84} flat style={{ flexShrink: 0 }}/>)}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <WireBtn ghost block>Contact courier</WireBtn>
          <WireBtn block>Edit address</WireBtn>
        </div>
      </div>
    </MScreen>
  );
}

// ─── 21 · MY PAGE ─────────────────────────────────────────────
function M21_MyPage() {
  return (
    <MScreen mastProps={{ tab: 'user' }}>
      <div style={{ padding: '18px 20px' }}>
        <Eyebrow>The Wardrobe · Hana's</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 32, fontStyle: 'italic', letterSpacing: '-0.02em', marginTop: 4 }}>Good day, <span style={{ color: WIRE.accent }}>Hana.</span></div>

        {/* dog profile card */}
        <div style={{ marginTop: 14, border: `1px solid ${WIRE.rule}`, padding: 14, display: 'flex', gap: 14, position: 'relative' }}>
          <ImgBox w={68} h={68} flat style={{ borderRadius: '50%' }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: WIRE.serif, fontSize: 18 }}>Hana, <span style={{ fontStyle: 'italic', color: WIRE.accent }}>4</span></div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.1em', marginTop: 2, textTransform: 'uppercase' }}>Golden · Sporty · L</div>
            <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 6 }}>가슴 72 · 등 68 · 28kg</div>
          </div>
          <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.ink, alignSelf: 'flex-start' }}>EDIT</span>
        </div>
        <div style={{ fontSize: 11, color: WIRE.inkSoft, marginTop: 8, display: 'flex', gap: 4 }}>
          {ICONS.plus} <span>또 다른 아이 등록</span>
        </div>
      </div>

      {/* points + coupons strip */}
      <div style={{ padding: '6px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Points','2,480'],['Coupons','3'],['Tier','Muzzle · II']].map(([k,v], i) => (
            <div key={i} style={{ border: `1px solid ${WIRE.ruleSoft}`, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: WIRE.inkSoft, textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 18, marginTop: 4, letterSpacing: '-0.01em' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* orders preview */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <Eyebrow>Recent orders</Eyebrow>
          <span style={{ fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>ALL →</span>
        </div>
        {[
          { d: '04·22', st: 'In transit · due Thu', amt: '316,800', items: 4 },
          { d: '03·15', st: 'Delivered',            amt: '88,000',  items: 1 },
        ].map((o, i) => (
          <div key={i} style={{ border: `1px solid ${WIRE.ruleSoft}`, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.14em', color: WIRE.inkSoft }}>
              <span>{o.d}</span>
              <span style={{ color: i === 0 ? WIRE.accent : WIRE.inkSoft }}>{o.st.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: Math.min(o.items, 3) }).map((_, j) => <ImgBox key={j} w={44} h={52} flat/>)}
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ fontFamily: WIRE.serif, fontSize: 14 }}>₩ {o.amt}</div>
            </div>
            {i === 0 && <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <WireBtn size="sm">Track</WireBtn>
              <WireBtn size="sm">Cancel</WireBtn>
            </div>}
            {i === 1 && <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <WireBtn size="sm">Buy again</WireBtn>
              <WireBtn size="sm">Write review</WireBtn>
              <WireBtn size="sm">Return</WireBtn>
            </div>}
          </div>
        ))}
      </div>

      {/* menu list */}
      <div style={{ padding: '0 20px 20px' }}>
        {[
          ['Addresses', '2 saved'],
          ['Payment methods', 'Visa · · 4412'],
          ['Coupons · Points', '3 · 2,480'],
          ['Size Profile', 'Golden · Sporty · L'],
          ['Notifications', ''],
          ['Customer Care', '1:1 chat'],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${WIRE.ruleSoft}` }}>
            <div>
              <div style={{ fontFamily: WIRE.serif, fontSize: 15 }}>{k}</div>
              {v && <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.06em', marginTop: 2 }}>{v}</div>}
            </div>
            <span style={{ color: WIRE.inkSoft }}>{ICONS.chev}</span>
          </div>
        ))}
      </div>
    </MScreen>
  );
}

// ─── 22 · Q&A · Product questions ─────────────────────────────
function M22_QnA() {
  const qas = [
    { q: '45kg 버니즈인데 XXL 핏이 넉넉할까요?', a: 'Muzzle: 버니즈 45kg 기준 가슴 92cm 전후라면 XXL이 적정합니다. 배 부분에 2–3cm 여유가 있어요.', who: 'Muzzle Fit Team', ago: '2d ago', votes: 18 },
    { q: '왁스 코팅 여름에도 괜찮나요?', a: '봄·가을·초겨울 데일리로 권장드리며, 여름에는 레인쉘 시리즈를 추천해요.', who: 'Muzzle', ago: '1w', votes: 12 },
    { q: '말라뮤트 장모도 입힐 수 있을까요?', a: '', who: 'Taro', ago: '3d', votes: 2, pending: true },
  ];
  return (
    <MScreen mastProps={{ tab: 'home' }} noTab>
      <TopBar left={ICONS.back} right={<span style={{ fontSize: 10, letterSpacing: '0.14em' }}>ASK</span>} center="Q & A · 34"/>

      <div style={{ padding: '14px 16px 10px' }}>
        <div style={{ border: `1px solid ${WIRE.rule}`, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: WIRE.inkSoft }}>{ICONS.search}</span>
          <span style={{ fontSize: 12, color: WIRE.inkSoft }}>질문 검색</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflow: 'auto' }}>
          {['All','Sizing','Material','Delivery','Care'].map((t, i) => (
            <div key={i} style={{ padding: '4px 12px', border: `1px solid ${i===0 ? WIRE.ink : WIRE.rule}`, fontSize: 10, letterSpacing: '0.1em', background: i===0 ? WIRE.ink : 'transparent', color: i===0 ? WIRE.paper : WIRE.ink, flexShrink: 0 }}>{t}</div>
          ))}
        </div>
      </div>

      <div>
        {qas.map((q, i) => (
          <div key={i} style={{ padding: 16, borderTop: `1px solid ${WIRE.ruleSoft}` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ fontFamily: WIRE.serif, fontStyle: 'italic', color: WIRE.accent, fontSize: 18 }}>Q.</div>
              <div style={{ flex: 1, fontFamily: WIRE.serif, fontSize: 15, lineHeight: 1.4 }}>{q.q}</div>
            </div>
            <div style={{ fontSize: 10, color: WIRE.inkSoft, marginLeft: 26, letterSpacing: '0.08em', marginTop: 4 }}>{q.who.toUpperCase()} · {q.ago}</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12, background: WIRE.fill, padding: 12 }}>
              <div style={{ fontFamily: WIRE.serif, fontStyle: 'italic', color: WIRE.ink, fontSize: 16 }}>A.</div>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: q.pending ? WIRE.inkSoft : WIRE.ink, fontStyle: q.pending ? 'italic' : 'normal' }}>
                {q.pending ? '답변 대기중 — 평균 6시간 이내' : q.a}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.1em' }}>
              <span>도움됨 · {q.votes}</span>
              <span>공유</span>
              <span>신고</span>
            </div>
          </div>
        ))}
      </div>
    </MScreen>
  );
}

// ─── 23 · REFUND / RETURN REQUEST ─────────────────────────────
function M23_Refund() {
  return (
    <MScreen mastProps={{ tab: 'user' }} noTab>
      <TopBar left={ICONS.back} right="" center="Return request"/>
      <div style={{ padding: 20 }}>
        <Eyebrow>Order MZ-2026-03198</Eyebrow>
        <div style={{ fontFamily: WIRE.serif, fontSize: 24, letterSpacing: '-0.02em', marginTop: 4 }}>Tell us what happened.</div>

        <div style={{ marginTop: 20 }}>
          <Eyebrow>Items to return</Eyebrow>
          <div style={{ marginTop: 10 }}>
            {[
              ['Rain Shell · Ink',    'L · ₩ 88,000', true],
              ['Canvas Harness',       'L · ₩ 58,000', false],
            ].map(([n, m, sel], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 10, border: `1px solid ${sel ? WIRE.ink : WIRE.ruleSoft}`, alignItems: 'center', marginBottom: 8, background: sel ? WIRE.fill : 'transparent' }}>
                <div style={{ width: 18, height: 18, border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, background: sel ? WIRE.ink : 'transparent', color: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel && ICONS.tick}</div>
                <ImgBox w={44} h={54} flat/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: WIRE.serif, fontSize: 13 }}>{n}</div>
                  <div style={{ fontSize: 10, color: WIRE.inkSoft, letterSpacing: '0.08em' }}>{m}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Reason</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {[
              ['사이즈가 안 맞아요 — 교환', true],
              ['상품 불량/하자', false],
              ['마음이 바뀌었어요', false],
              ['배송 중 파손', false],
              ['사진과 달라요', false],
            ].map(([t, sel], i) => (
              <div key={i} style={{ padding: '12px 14px', border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, background: sel ? WIRE.fill : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: WIRE.serif, fontSize: 14 }}>{t}</span>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1px solid ${sel ? WIRE.ink : WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: WIRE.ink }}/>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Exchange for</Eyebrow>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[
              ['환불만','refund only'],
              ['같은 상품 XL로 교환','exchange'],
              ['다른 상품','store credit'],
            ].map(([t, s], i) => (
              <div key={i} style={{ flex: 1, padding: 10, border: `1px solid ${i===1 ? WIRE.ink : WIRE.rule}`, background: i===1 ? WIRE.ink : 'transparent', color: i===1 ? WIRE.paper : WIRE.ink, textAlign: 'center' }}>
                <div style={{ fontFamily: WIRE.serif, fontSize: 12 }}>{t}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Eyebrow>Photos + Note</Eyebrow>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{ width: 70, height: 70, border: `1px dashed ${WIRE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WIRE.inkSoft }}>{ICONS.plus}</div>
            <ImgBox w={70} h={70} flat/>
          </div>
          <div style={{ border: `1px solid ${WIRE.rule}`, padding: 12, marginTop: 10, minHeight: 80, fontSize: 12, color: WIRE.inkSoft }}>추가로 알려주실 내용…</div>
        </div>

        <div style={{ marginTop: 22, background: WIRE.fill, padding: 14, border: `1px solid ${WIRE.ruleSoft}` }}>
          <Eyebrow>Estimated refund</Eyebrow>
          <div style={{ fontFamily: WIRE.serif, fontSize: 22, marginTop: 4 }}>₩ 88,000</div>
          <div style={{ fontSize: 10, color: WIRE.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
            반품 수거 2–3일 · 환불 완료까지 영업일 3일
          </div>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${WIRE.rule}` }}>
        <WireBtn primary block size="lg">Submit request</WireBtn>
      </div>
    </MScreen>
  );
}

Object.assign(window, {
  M14_SizeGuide, M15_WriteReview, M16_Cart, M17_Wishlist,
  M18_Checkout, M19_OrderDone, M20_Tracking, M21_MyPage, M22_QnA, M23_Refund,
});
