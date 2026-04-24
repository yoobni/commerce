// ─── Direction B · Design System Reference ──────────────────────
// Organized swatches / typography / components for handoff.

function DSSection({ t, title, num, children, sub }) {
  return (
    <div style={{ padding: '40px 44px', borderBottom: `1px solid ${t.line}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 22 }}>
        <div style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: '0.18em', color: t.inkMute, fontWeight: 600 }}>§ {num}</div>
        <div style={{ fontFamily: t.serif, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', color: t.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: t.inkMute }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SwatchCard({ t, name, hex, light = false }) {
  return (
    <div style={{ border: `1px solid ${t.line}`, borderRadius: t.r.md, overflow: 'hidden' }}>
      <div style={{ height: 84, background: hex, borderBottom: `1px solid ${t.line}` }}/>
      <div style={{ padding: '10px 12px', background: t.surface }}>
        <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500, color: t.ink }}>{name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11, color: t.inkMute, marginTop: 2, textTransform: 'uppercase' }}>{hex}</div>
      </div>
    </div>
  );
}

function TypeRow({ t, label, sample, spec, fontFamily, fontSize, fontWeight, italic, letterSpacing, lineHeight }) {
  return (
    <div style={{ padding: '18px 0', borderTop: `1px solid ${t.line}`, display: 'grid', gridTemplateColumns: '180px 1fr 260px', gap: 24, alignItems: 'baseline' }}>
      <div style={{ fontFamily: t.sans, fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily, fontSize, fontWeight, fontStyle: italic ? 'italic' : 'normal', letterSpacing, lineHeight, color: t.ink }}>{sample}</div>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10.5, color: t.inkMute, lineHeight: 1.6 }}>{spec}</div>
    </div>
  );
}

function Swatch({ t, hex, size = 48, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: hex, border: `1px solid ${t.lineStrong}`, margin: '0 auto' }}/>
      <div style={{ fontSize: 10, color: t.inkMute, marginTop: 6, fontFamily: 'JetBrains Mono, ui-monospace, monospace', textTransform: 'uppercase' }}>{label || hex}</div>
    </div>
  );
}

function SpecLabel({ t, children }) {
  return <div style={{ fontFamily: t.sans, fontSize: 10, letterSpacing: '0.14em', color: t.inkMute, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>;
}

function B_DesignSystem({ t }) {
  return (
    <div className="mz" style={{ width: 1280, background: t.bg, color: t.ink, fontFamily: t.sans, fontSize: 13 }}>

      {/* Header */}
      <div style={{ padding: '56px 44px 40px', borderBottom: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: '0.22em', color: t.inkMute, fontWeight: 600 }}>MUZZLE · DESIGN SYSTEM</div>
            <div style={{ fontFamily: t.serif, fontSize: 56, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1, marginTop: 16 }}>
              Direction B · <span style={{ fontStyle: 'italic' }}>Modern.</span>
            </div>
            <div style={{ fontSize: 14, color: t.inkSoft, marginTop: 12, maxWidth: 600, lineHeight: 1.55 }}>
              A design system for the larger hound. Bone white surfaces, disciplined product grid, Fraunces display serif for moments and Inter for utility.
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11, color: t.inkMute, lineHeight: 1.8 }}>
            <div>VERSION · 1.0</div>
            <div>SCOPE · Mobile iOS</div>
            <div>ACCENT · {t.accentName}</div>
          </div>
        </div>
      </div>

      {/* Colors */}
      <DSSection t={t} num="01" title="Colors" sub="Bone white neutrals, one accent at a time">
        <SpecLabel t={t}>Neutrals</SpecLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          <SwatchCard t={t} name="Bg"         hex={t.bg}/>
          <SwatchCard t={t} name="Bg Deep"    hex={t.bgDeep}/>
          <SwatchCard t={t} name="Surface"    hex={t.surface}/>
          <SwatchCard t={t} name="Ink"        hex={t.ink}/>
          <SwatchCard t={t} name="Ink Soft"   hex={t.inkSoft}/>
        </div>
        <SpecLabel t={t}>Accent · {t.accentName}</SpecLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 2fr', gap: 12 }}>
          <SwatchCard t={t} name="Accent"      hex={t.accent}/>
          <SwatchCard t={t} name="Accent Soft" hex={t.accentSoft}/>
          <SwatchCard t={t} name="Accent Ink"  hex={t.accentInk}/>
          <div style={{ padding: 16, border: `1px solid ${t.line}`, borderRadius: t.r.md, background: t.surface }}>
            <SpecLabel t={t}>Usage</SpecLabel>
            <div style={{ fontSize: 12, color: t.inkSoft, lineHeight: 1.6 }}>
              Reserved for fit-intelligence callouts, active states, and price highlights. Not a background.
            </div>
          </div>
        </div>
      </DSSection>

      {/* Typography */}
      <DSSection t={t} num="02" title="Typography" sub="Fraunces display · Inter utility">
        <TypeRow t={t} label="Display / XL"
          sample="Outfitters for the larger hound."
          fontFamily={t.serif} fontSize={48} fontWeight={500} letterSpacing="-0.035em" lineHeight={1.05}
          spec={`Fraunces 500\n48 / 50 · -3.5%`}/>
        <TypeRow t={t} label="Display / L"
          sample="Coats & Jackets"
          fontFamily={t.serif} fontSize={32} fontWeight={500} letterSpacing="-0.025em" lineHeight={1.1}
          spec={`Fraunces 500\n32 / 36 · -2.5%`}/>
        <TypeRow t={t} label="Title"
          sample="Field Trench, Oat"
          fontFamily={t.serif} fontSize={24} fontWeight={500} letterSpacing="-0.02em" lineHeight={1.2}
          spec={`Fraunces 500\n24 / 29 · -2%`}/>
        <TypeRow t={t} label="Product"
          sample="Field Trench"
          fontFamily={t.serif} fontSize={15} fontWeight={500} letterSpacing="0" lineHeight={1.3}
          spec={`Fraunces 500\n15 / 20`}/>
        <TypeRow t={t} label="Body"
          sample="왁스 코튼 겉감에 코튼 안감. 대형견의 긴 등과 넓은 가슴에 맞춰 재단되었습니다."
          fontFamily={t.sans} fontSize={13} fontWeight={400} letterSpacing="0" lineHeight={1.6}
          spec={`Inter 400\n13 / 21`}/>
        <TypeRow t={t} label="Label"
          sample="Only 3 left · size L"
          fontFamily={t.sans} fontSize={12} fontWeight={500} letterSpacing="0" lineHeight={1.4}
          spec={`Inter 500\n12 / 17`}/>
        <TypeRow t={t} label="Eyebrow"
          sample="FIT FOR HANA"
          fontFamily={t.sans} fontSize={10} fontWeight={600} letterSpacing="0.16em" lineHeight={1.4}
          spec={`Inter 600 · UPPER\n10 · +16%`}/>
        <TypeRow t={t} label="Price"
          sample="₩148,000"
          fontFamily={t.serif} fontSize={22} fontWeight={600} letterSpacing="0" lineHeight={1.2}
          spec={`Fraunces 600\n22 / 26`}/>
        <TypeRow t={t} label="Mono · spec"
          sample="04777 · 010-3456-7890"
          fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize={11} fontWeight={400} letterSpacing="0" lineHeight={1.4}
          spec={`JetBrains Mono 400\n11 / 15`}/>
      </DSSection>

      {/* Spacing + Radii */}
      <DSSection t={t} num="03" title="Spacing & radii">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <SpecLabel t={t}>Spacing scale (4-base)</SpecLabel>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              {[[4, 'xs'],[8,'sm'],[12,'md'],[16,'lg'],[22,'xl'],[32,'2xl'],[44,'3xl']].map(([v, n]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: v, height: v, background: t.ink, margin: '0 auto' }}/>
                  <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: t.inkMute, marginTop: 8 }}>{n}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: t.ink, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SpecLabel t={t}>Border radius</SpecLabel>
            <div style={{ display: 'flex', gap: 16 }}>
              {[[t.r.sm,'sm'],[t.r.md,'md'],[t.r.lg,'lg'],[t.r.xl,'xl'],[t.r.pill,'pill']].map(([v, n]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: t.ink, borderRadius: v }}/>
                  <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: t.inkMute, marginTop: 8 }}>{n}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: t.ink, fontWeight: 600 }}>{v === 999 ? '∞' : v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSection>

      {/* Buttons */}
      <DSSection t={t} num="04" title="Buttons">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          {[
            ['Primary', 'primary', 'Add to bag'],
            ['Accent', 'accent', 'Apply fit'],
            ['Ghost', 'ghost', 'Show all reviews'],
            ['Quiet', 'quiet', 'Cancel'],
          ].map(([n, v, l]) => (
            <div key={n}>
              <SpecLabel t={t}>{n}</SpecLabel>
              <Btn t={t} variant={v} block>{l}</Btn>
              <div style={{ marginTop: 10 }}>
                <Btn t={t} variant={v} size="sm">Smaller</Btn>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 14, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r.md, fontSize: 11.5, color: t.inkSoft, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: t.ink }}>Spec · </span>
          height 40 (sm) / 48 (md) / 56 (lg) · radius {t.r.md} · padding 20/13 · Inter 500 13/14 · -letterSpacing 0.02em · hover opacity 0.85 (150ms)
        </div>
      </DSSection>

      {/* Chips */}
      <DSSection t={t} num="05" title="Chips & Tags">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <SpecLabel t={t}>Filter chips</SpecLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip t={t} active>Hana (L)</Chip>
              <Chip t={t}>Under ₩100k</Chip>
              <Chip t={t}>Oat</Chip>
              <Chip t={t}>Ink</Chip>
              <Chip t={t}>Rain</Chip>
            </div>
          </div>
          <div>
            <SpecLabel t={t}>Badges</SpecLabel>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 8px', background: t.accent, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 999 }}>★ FIT L</span>
              <span style={{ padding: '3px 8px', background: t.ink, color: t.bg, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 999 }}>NEW</span>
              <span style={{ padding: '3px 8px', background: t.accentSoft, color: t.accentInk, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 999 }}>✓ FITS</span>
              <span style={{ padding: '3px 8px', background: t.bgDeep, color: t.ink, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 999 }}>SS26</span>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Product card */}
      <DSSection t={t} num="06" title="Product card" sub="The spine of Muzzle browse">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[0,1,2,3].map(i => (
            <div key={i}>
              <div style={{ position: 'relative', borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep }}>
                <ProductIllus t={t} seed={i} ratio="1"/>
                {i !== 2 && <div style={{ position: 'absolute', top: 8, left: 8, background: t.accent, color: '#fff', fontSize: 9, padding: '3px 7px', letterSpacing: '0.08em', fontWeight: 700, borderRadius: 999 }}>★ FIT L</div>}
                <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{BI.heart(t)}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 500 }}>{['Field Trench','Wool Chore','Rain Shell','Linen Tee'][i]}</div>
                <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2 }}>{['Oat','Ink','Olive','Bone'][i]}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>₩ {['148','196','88','62'][i]},000</div>
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Forms */}
      <DSSection t={t} num="07" title="Forms">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            <SpecLabel t={t}>Text field</SpecLabel>
            <div style={{ padding: '14px 16px', border: `1px solid ${t.line}`, borderRadius: t.r.md, background: t.surface, fontSize: 14 }}>
              hana@muzzle.co
            </div>
            <div style={{ padding: '14px 16px', border: `1.5px solid ${t.ink}`, borderRadius: t.r.md, background: t.surface, fontSize: 14, marginTop: 10, position: 'relative' }}>
              ••••••••<span style={{ display: 'inline-block', width: 1, height: 16, background: t.ink, verticalAlign: 'middle', marginLeft: 1, animation: 'mz-blink 1s infinite' }}/>
              <div style={{ position: 'absolute', top: -6, left: 12, background: t.bg, padding: '0 6px', fontSize: 10, letterSpacing: '0.14em', color: t.ink, fontWeight: 600 }}>PASSWORD</div>
            </div>
          </div>
          <div>
            <SpecLabel t={t}>Selection</SpecLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['M','3 left'],['L','12 · ★', true],['XL','5'],['XXL','sold', false, true]].map(([s, d, sel, out], i) => (
                <div key={i} style={{
                  flex: 1, padding: '11px 0', textAlign: 'center',
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
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {[['#D6C9A6', true],['#4A463D'],['#6B2020'],['#4A5237']].map(([c, sel], i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: sel ? `2px solid ${t.ink}` : `1px solid ${t.lineStrong}`, padding: sel ? 3 : 0, boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: c }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSection>

      {/* Fit card */}
      <DSSection t={t} num="08" title="Fit-for-Hana card" sub="Signature component — appears on every hound-facing surface">
        <div style={{ padding: 14, borderRadius: t.r.md, background: t.accentSoft, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 420 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: t.bg, flexShrink: 0 }}>
            <IllusAvatar stroke={t.ink} fill={t.bg} accent={t.accent} w={40} h={40}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: t.accentInk, fontWeight: 700 }}>FIT FOR HANA</div>
            <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, color: t.accentInk, marginTop: 2 }}>Recommended · size L</div>
          </div>
          <div style={{ fontSize: 11, color: t.accentInk, fontWeight: 600 }}>Why →</div>
        </div>
      </DSSection>

      {/* Icons */}
      <DSSection t={t} num="09" title="Iconography" sub="1.4 stroke · round caps · 24px grid">
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            ['Back', BI.back(t)],
            ['Close', BI.close(t)],
            ['Search', BI.search(t)],
            ['Heart', BI.heart(t)],
            ['Bag', BI.bag(t, 0)],
          ].map(([n, el]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, border: `1px solid ${t.line}`, borderRadius: t.r.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{el}</div>
              <div style={{ fontSize: 10, color: t.inkMute, marginTop: 8, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{n}</div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Illustration */}
      <DSSection t={t} num="10" title="Illustration" sub="SVG-only · line + one accent fill · no photography">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, aspectRatio: '4/5' }}>
            <IllusPortrait stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
          </div>
          <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, aspectRatio: '4/5' }}>
            <IllusGolden stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
          </div>
          <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, aspectRatio: '4/5' }}>
            <IllusHound stroke={t.ink} fill={t.bgDeep} accent={t.accent}/>
          </div>
          <div style={{ borderRadius: t.r.md, overflow: 'hidden', background: t.bgDeep, aspectRatio: '4/5' }}>
            <IllusFlat stroke={t.ink} fill={t.bgDeep} accent={t.accent} variant="trench"/>
          </div>
        </div>
      </DSSection>

      <div style={{ padding: '40px 44px', textAlign: 'center', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: t.inkMute, letterSpacing: '0.14em' }}>
        END · MUZZLE DESIGN SYSTEM · {t.accentName.toUpperCase()} · {t.mode.toUpperCase()}
      </div>
    </div>
  );
}

Object.assign(window, { B_DesignSystem });
