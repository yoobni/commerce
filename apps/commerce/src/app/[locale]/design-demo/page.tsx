'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  FitBadge,
  FitForHanaCard,
  Input,
  PasswordInput,
  SizeSelector,
  Tag,
  type SizeOption,
} from '@/components/ui';

// ─────────────────────────────────────────────────────────────
// Design demo · Muzzle Direction B (Olive)
// Mirrors hifi/dir-b-ds.jsx — token + component reference catalog.
// Not linked from the app nav; visit /<locale>/design-demo directly.
// ─────────────────────────────────────────────────────────────

export default function DesignDemoPage() {
  return (
    <div className="bg-[var(--mz-bg)] text-[var(--mz-ink)]">
      <div className="mx-auto max-w-[1080px] px-5 py-10 md:px-10 md:py-14">
        <Header />
        <Section id="colors" eyebrow="01 · Tokens" title="Color">
          <ColorSwatches />
        </Section>

        <Section id="typography" eyebrow="02 · Tokens" title="Typography">
          <TypographyScale />
        </Section>

        <Section id="spacing" eyebrow="03 · Tokens" title="Spacing & radius">
          <SpacingAndRadii />
        </Section>

        <Section id="buttons" eyebrow="04 · Components" title="Button">
          <ButtonShowcase />
        </Section>

        <Section id="chips" eyebrow="05 · Components" title="Chip">
          <ChipShowcase />
        </Section>

        <Section id="badges" eyebrow="06 · Components" title="Badge & Tag">
          <BadgeShowcase />
        </Section>

        <Section id="inputs" eyebrow="07 · Components" title="Input">
          <InputShowcase />
        </Section>

        <Section id="size-selector" eyebrow="08 · Components" title="Size selector">
          <SizeSelectorShowcase />
        </Section>

        <Section id="color-swatch" eyebrow="09 · Components" title="Color swatch (PDP)">
          <ColorSwatchShowcase />
        </Section>

        <Section id="fit-card" eyebrow="10 · Components" title="Fit-for-Hana card">
          <FitForHanaShowcase />
        </Section>

        <Section id="icons" eyebrow="11 · Components" title="Icons">
          <IconShowcase />
        </Section>

        <footer className="mt-16 mb-8 border-t border-[var(--mz-line)] pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mz-ink-mute)]">
            Muzzle · Direction B · Olive (locked)
          </p>
          <p className="mt-2 text-[12px] text-[var(--mz-ink-mute)]">
            Reference catalog mirroring <code className="font-mono">hifi/dir-b-ds.jsx</code>.
            Source of truth: design_handoff_muzzle/README.md.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────

function Header() {
  return (
    <header className="mb-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mz-accent)]">
        Muzzle · Design System
      </p>
      <h1 className="mt-3 font-serif text-[40px] md:text-[56px] font-medium leading-[1.05] tracking-[-0.025em]">
        Direction B — <em className="font-serif italic">Olive</em>.
      </h1>
      <p className="mt-4 max-w-[560px] text-[14px] leading-[1.6] text-[var(--mz-ink-soft)]">
        Component & token catalog. Light theme only — dark variants to follow.
        Every surface here exists as a primitive in <code className="font-mono text-[12px]">@/components/ui</code>.
      </p>
    </header>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-[var(--mz-line)] py-12 first-of-type:border-t-0 first-of-type:pt-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mz-ink-mute)]">
        {eyebrow}
      </p>
      <h2 className="mb-8 font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mz-ink-mute)]">
      {children}
    </p>
  );
}

// ─── 01 · Color ───────────────────────────────────────────────

function ColorSwatches() {
  const neutrals: { name: string; varName: string; hex: string; note: string }[] = [
    { name: 'bg', varName: '--mz-bg', hex: '#F7F6F3', note: 'page' },
    { name: 'bgDeep', varName: '--mz-bg-deep', hex: '#EFEDE7', note: 'image/card backdrop' },
    { name: 'surface', varName: '--mz-surface', hex: '#FFFFFF', note: 'inputs, elevated cards' },
    { name: 'ink', varName: '--mz-ink', hex: '#0E0E0C', note: 'primary text + button' },
    { name: 'inkSoft', varName: '--mz-ink-soft', hex: '#4D4D48', note: 'body prose' },
    { name: 'inkMute', varName: '--mz-ink-mute', hex: '#8F8F88', note: 'meta, labels' },
  ];
  const lines: { name: string; varName: string; hex: string; note: string }[] = [
    { name: 'line', varName: '--mz-line', hex: 'rgba(14,14,12,0.08)', note: 'dividers' },
    { name: 'lineStrong', varName: '--mz-line-strong', hex: 'rgba(14,14,12,0.18)', note: 'inputs, chip outline' },
  ];
  const accents: { name: string; varName: string; hex: string; note: string }[] = [
    { name: 'accent', varName: '--mz-accent', hex: '#4A5237', note: 'fit badges, active states' },
    { name: 'accentSoft', varName: '--mz-accent-soft', hex: '#E5E7D8', note: 'fit card bg, applied chips' },
    { name: 'accentInk', varName: '--mz-accent-ink', hex: '#2E3422', note: 'text on accentSoft' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <SubLabel>Neutrals · Light</SubLabel>
        <SwatchGrid items={neutrals} />
      </div>
      <div>
        <SubLabel>Lines</SubLabel>
        <SwatchGrid items={lines} />
      </div>
      <div>
        <SubLabel>Accent · Olive (locked)</SubLabel>
        <SwatchGrid items={accents} />
      </div>
    </div>
  );
}

function SwatchGrid({
  items,
}: {
  items: { name: string; varName: string; hex: string; note: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.varName}
          className="rounded-[10px] border border-[var(--mz-line)] overflow-hidden bg-[var(--mz-surface)]"
        >
          <div
            className="aspect-[5/3] border-b border-[var(--mz-line)]"
            style={{ background: `var(${item.varName})` }}
          />
          <div className="p-3">
            <p className="font-serif text-[14px] font-medium">{item.name}</p>
            <p className="mt-0.5 font-mono text-[10.5px] text-[var(--mz-ink-mute)]">
              {item.hex}
            </p>
            <p className="mt-1.5 text-[10px] text-[var(--mz-ink-mute)]">{item.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 02 · Typography ──────────────────────────────────────────

function TypographyScale() {
  const samples: {
    role: string;
    sample: string;
    className: string;
    meta: string;
  }[] = [
    {
      role: 'Display XL',
      sample: 'Outfitters for the larger hound.',
      className:
        'font-serif text-[48px] leading-[50px] font-medium tracking-[-0.035em]',
      meta: 'Fraunces 48/50 · 500 · -0.035em',
    },
    {
      role: 'Display L',
      sample: 'Coats & Jackets',
      className:
        'font-serif text-[32px] leading-[36px] font-medium tracking-[-0.025em]',
      meta: 'Fraunces 32/36 · 500 · -0.025em',
    },
    {
      role: 'Title',
      sample: 'Field Trench, Oat',
      className:
        'font-serif text-[24px] leading-[29px] font-medium tracking-[-0.02em]',
      meta: 'Fraunces 24/29 · 500 · -0.02em',
    },
    {
      role: 'Subtitle',
      sample: 'Hound profile',
      className:
        'font-serif text-[20px] leading-[26px] font-medium tracking-[-0.015em]',
      meta: 'Fraunces 20/26 · 500 · -0.015em',
    },
    {
      role: 'Product name',
      sample: 'Wool Field Coat',
      className: 'font-serif text-[15px] leading-[20px] font-medium',
      meta: 'Fraunces 15/20 · 500',
    },
    {
      role: 'Body',
      sample:
        '왁스 코튼 겉감에 코튼 안감. 대형견의 긴 등과 넓은 가슴에 맞춰 재단되었습니다.',
      className: 'font-sans text-[13px] leading-[21px] text-[var(--mz-ink-soft)]',
      meta: 'Inter 13/21 · 400 · Pretendard fallback for Hangul',
    },
    {
      role: 'Body small',
      sample: 'Made in Porto, Portugal',
      className: 'font-sans text-[12px] leading-[18px] text-[var(--mz-ink-soft)]',
      meta: 'Inter 12/18 · 400',
    },
    {
      role: 'Label',
      sample: 'Add to bag',
      className: 'font-sans text-[12px] leading-[17px] font-medium tracking-[0.02em]',
      meta: 'Inter 12/17 · 500 · +0.02em',
    },
    {
      role: 'Eyebrow',
      sample: 'MUZZLE ATELIER',
      className:
        'font-sans text-[10px] leading-[14px] font-semibold uppercase tracking-[0.16em] text-[var(--mz-ink-mute)]',
      meta: 'Inter 10/14 · 600 · +0.16em UPPERCASE',
    },
    {
      role: 'Price',
      sample: '₩148,000',
      className: 'font-serif text-[22px] leading-[26px] font-semibold',
      meta: 'Fraunces 22/26 · 600',
    },
    {
      role: 'Price · big',
      sample: '₩316,800',
      className:
        'font-serif text-[32px] leading-[36px] font-semibold tracking-[-0.02em]',
      meta: 'Fraunces 32/36 · 600 · -0.02em',
    },
    {
      role: 'Mono · spec',
      sample: 'ORDER #MZ-29418',
      className: 'font-mono text-[11px] leading-[15px]',
      meta: 'JetBrains Mono 11/15 · 400',
    },
  ];

  return (
    <div className="divide-y divide-[var(--mz-line)] rounded-[10px] border border-[var(--mz-line)] bg-[var(--mz-surface)]">
      {samples.map((s) => (
        <div
          key={s.role}
          className="grid grid-cols-1 gap-2 p-5 md:grid-cols-[140px_1fr_minmax(0,260px)] md:items-baseline md:gap-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mz-ink-mute)]">
            {s.role}
          </p>
          <p className={s.className}>{s.sample}</p>
          <p className="font-mono text-[10.5px] text-[var(--mz-ink-mute)]">{s.meta}</p>
        </div>
      ))}
    </div>
  );
}

// ─── 03 · Spacing & radii ─────────────────────────────────────

function SpacingAndRadii() {
  const spacing: { name: string; px: number }[] = [
    { name: 'xs', px: 4 },
    { name: 'sm', px: 8 },
    { name: 'md', px: 12 },
    { name: 'lg', px: 16 },
    { name: 'xl', px: 22 },
    { name: '2xl', px: 32 },
    { name: '3xl', px: 44 },
  ];
  const radii: { name: string; px: number }[] = [
    { name: 'sm', px: 4 },
    { name: 'md', px: 10 },
    { name: 'lg', px: 16 },
    { name: 'xl', px: 22 },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <SubLabel>Spacing scale (4-base)</SubLabel>
        <div className="space-y-3">
          {spacing.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="w-12 font-mono text-[11px] text-[var(--mz-ink-mute)]">{s.name}</span>
              <div
                className="h-3 rounded-sm bg-[var(--mz-accent)]"
                style={{ width: `${s.px}px` }}
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] text-[var(--mz-ink-mute)]">{s.px}px</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>Radii</SubLabel>
        <div className="grid grid-cols-2 gap-4">
          {radii.map((r) => (
            <div
              key={r.name}
              className="border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] p-4"
              style={{ borderRadius: `${r.px}px` }}
            >
              <p className="font-serif text-[14px] font-medium">{r.name}</p>
              <p className="font-mono text-[10.5px] text-[var(--mz-ink-mute)]">{r.px}px</p>
            </div>
          ))}
          <div className="rounded-full border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] p-4 text-center">
            <p className="font-serif text-[14px] font-medium">pill</p>
            <p className="font-mono text-[10.5px] text-[var(--mz-ink-mute)]">9999px</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 04 · Button ──────────────────────────────────────────────

function ButtonShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <SubLabel>Variants · md size</SubLabel>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Add to bag</Button>
          <Button variant="accent">Track shipment</Button>
          <Button variant="ghost">Size guide</Button>
          <Button variant="quiet">Cancel</Button>
        </div>
      </div>
      <div>
        <SubLabel>Sizes · primary</SubLabel>
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="primary" size="sm">
            sm · 40
          </Button>
          <Button variant="primary" size="md">
            md · 48
          </Button>
          <Button variant="primary" size="lg">
            lg · 56
          </Button>
        </div>
      </div>
      <div>
        <SubLabel>States</SubLabel>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" loading>
            Submitting
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" fullWidth>
            Full-width primary
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── 05 · Chip ────────────────────────────────────────────────

function ChipShowcase() {
  const [selected, setSelected] = useState<string>('coats');
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'coats', label: 'Coats' },
    { key: 'rain', label: 'Rain' },
    { key: 'harness', label: 'Harness' },
    { key: 'wool', label: 'Wool' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <SubLabel>Filter group (single-select)</SubLabel>
        <ChipGroup>
          {filters.map((f) => (
            <Chip
              key={f.key}
              selected={selected === f.key}
              onClick={() => setSelected(f.key)}
            >
              {f.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>
      <div>
        <SubLabel>Fit variant (Fit-for-Hana)</SubLabel>
        <div className="flex flex-wrap gap-2">
          <Chip variant="fit" selected>
            FIT L · selected
          </Chip>
          <Chip variant="fit">FIT L</Chip>
        </div>
      </div>
    </div>
  );
}

// ─── 06 · Badge & Tag ─────────────────────────────────────────

function BadgeShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <SubLabel>Badges</SubLabel>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="new">NEW</Badge>
          <Badge variant="sale">−15%</Badge>
          <Badge variant="soldOut">SOLD OUT</Badge>
          <Badge variant="lowStock">3 LEFT</Badge>
          <FitBadge size="L" />
          <Badge>DEFAULT</Badge>
        </div>
      </div>
      <div>
        <SubLabel>Tags</SubLabel>
        <div className="flex flex-wrap gap-2">
          <Tag>Wool</Tag>
          <Tag onRemove={() => {}}>Hana (L)</Tag>
          <Tag onRemove={() => {}}>Olive</Tag>
        </div>
      </div>
    </div>
  );
}

// ─── 07 · Input ───────────────────────────────────────────────

function InputShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <SubLabel>Static label</SubLabel>
        <Input label="Email" placeholder="ravi@example.com" required />
        <Input label="Postcode" placeholder="06236" hint="5 digits" />
        <Input
          label="Promo code"
          defaultValue="FIRST10"
          error="Code already applied"
        />
      </div>
      <div className="space-y-4">
        <SubLabel>Floating label · Password</SubLabel>
        <Input floatingLabel label="EMAIL" />
        <PasswordInput floatingLabel label="PASSWORD" defaultValue="••••••••" />
        <Input
          floatingLabel
          label="ADDRESS"
          defaultValue="서울 성동구 성수이로 113"
        />
      </div>
    </div>
  );
}

// ─── 08 · Size selector ───────────────────────────────────────

function SizeSelectorShowcase() {
  const [value, setValue] = useState('L');
  const options: SizeOption[] = [
    { label: 'M', stock: 3 },
    { label: 'L', stock: 12, isFit: true },
    { label: 'XL', stock: 5 },
    { label: 'XXL', stock: 0 },
  ];

  return (
    <div className="max-w-[520px]">
      <SubLabel>4-cell row · live stock + fit star</SubLabel>
      <SizeSelector options={options} value={value} onChange={setValue} />
      <p className="mt-3 text-[11px] text-[var(--mz-ink-mute)]">
        Selected: <span className="font-serif text-[var(--mz-ink)]">{value}</span> · stock {'≤'}5 shows count, 0 disables to "sold".
      </p>
    </div>
  );
}

// ─── 09 · Color swatch ────────────────────────────────────────

function ColorSwatchShowcase() {
  const COLORS: { name: string; hex: string }[] = [
    { name: 'Oat', hex: '#D6C9A6' },
    { name: 'Ink', hex: '#4A463D' },
    { name: 'Olive', hex: '#4A5237' },
    { name: 'Bone', hex: '#EFEDE7' },
  ];
  const [active, setActive] = useState(0);

  return (
    <div className="max-w-[520px]">
      <SubLabel>PDP color swatch · 34×34, ink ring on active</SubLabel>
      <p className="mb-4 text-[13px] font-semibold">
        Color ·{' '}
        <span className="font-normal text-[var(--mz-ink-mute)]">{COLORS[active].name}</span>
      </p>
      <div className="flex gap-[10px]">
        {COLORS.map((c, i) => {
          const isActive = active === i;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => setActive(i)}
              aria-label={c.name}
              aria-pressed={isActive}
              className={[
                'relative box-border h-[34px] w-[34px] rounded-full transition-all',
                isActive
                  ? 'border-2 border-[var(--mz-ink)] p-[3px]'
                  : 'border border-[var(--mz-line-strong)] p-0',
              ].join(' ')}
            >
              <span
                className="block h-full w-full rounded-full"
                style={{ background: c.hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 10 · Fit-for-Hana card ───────────────────────────────────

function FitForHanaShowcase() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <SubLabel>Active · profile present</SubLabel>
        <FitForHanaCard
          profile={{
            name: 'Hana',
            breed: 'Golden, 28kg',
            size: 'L',
            bodyType: 'Sporty',
          }}
          onWhyClick={() => {}}
        />
      </div>
      <div>
        <SubLabel>Fallback · no profile</SubLabel>
        <FitForHanaCard profile={null} setupHref="#" />
      </div>
    </div>
  );
}

// ─── 11 · Icons ───────────────────────────────────────────────

function IconShowcase() {
  const icons: { name: string; render: () => React.ReactElement }[] = [
    { name: 'back', render: () => <Chevron dir="left" /> },
    { name: 'close', render: () => <CloseIcon /> },
    { name: 'search', render: () => <SearchIcon /> },
    { name: 'heart', render: () => <HeartIcon /> },
    { name: 'heart-fill', render: () => <HeartIcon filled /> },
    { name: 'bag', render: () => <BagIcon /> },
    { name: 'home', render: () => <HomeIcon /> },
    { name: 'user', render: () => <UserIcon /> },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-8">
      {icons.map((icon) => (
        <div
          key={icon.name}
          className="flex flex-col items-center gap-2 rounded-[10px] border border-[var(--mz-line)] bg-[var(--mz-surface)] p-4"
        >
          <div className="grid h-9 w-9 place-items-center text-[var(--mz-ink)]">
            {icon.render()}
          </div>
          <p className="font-mono text-[10px] text-[var(--mz-ink-mute)]">{icon.name}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Local icon set — 24×24, 1.4 stroke, round caps (per design spec)
// Production swap: Phosphor or Lucide at the same weight.
// ─────────────────────────────────────────────────────────────

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M15 18 L9 12 L15 6' : 'M9 18 L15 12 L9 6';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 16 L21 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10.5A4.5 4.5 0 0 1 12 6.5 4.5 4.5 0 0 1 19 9.5C19 15.5 12 20 12 20Z"
        fill={filled ? 'var(--mz-accent)' : 'none'}
        stroke={filled ? 'var(--mz-accent)' : 'currentColor'}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
