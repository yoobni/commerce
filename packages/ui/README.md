# @muzzle/ui — Muzzle Design System

Direction B (Modern) · Burgundy accent · Confirmed 2026-04-24

## Install (workspace)

Both `apps/commerce` and `apps/admin` already declare `"@muzzle/ui": "*"` as a workspace dependency.

## Token import (CSS)

Add to each app's `globals.css`:

```css
@import 'tailwindcss';
@source '../../../../packages/ui/src';
```

For Tailwind utility classes (`bg-mz-ink`, `text-mz-accent`, etc.) copy the `@theme` block from `src/tailwind/preset.css` into the app's `globals.css`, or `@import` it directly.

For `--mz-*` CSS custom properties used by components, include either:
- `@import '../../../../packages/ui/src/tokens/tokens.css'`, or
- Define them inline (both apps already have this in their `globals.css`).

## Component import

```tsx
import { Button, Input, Modal, Toast, useToast } from '@muzzle/ui';
import { MZ_COLORS, MZ_TYPOGRAPHY } from '@muzzle/ui';
```

## Token reference

### Colors

| CSS var | Tailwind class | Value | Usage |
|---|---|---|---|
| `--mz-bg` | `bg-mz-bg` | `#F7F6F3` | Page background |
| `--mz-bg-deep` | `bg-mz-bg-deep` | `#EFEDE7` | Card/image backdrop |
| `--mz-surface` | `bg-mz-surface` | `#FFFFFF` | Input, card above bg |
| `--mz-ink` | `text-mz-ink` | `#0E0E0C` | Primary text, primary button |
| `--mz-ink-soft` | `text-mz-ink-soft` | `#4D4D48` | Body prose |
| `--mz-ink-mute` | `text-mz-ink-mute` | `#8F8F88` | Meta, labels |
| `--mz-line` | `border-mz-line` (n/a) | `rgba(14,14,12,0.08)` | Dividers |
| `--mz-line-strong` | — | `rgba(14,14,12,0.18)` | Input border, chip outline |
| `--mz-accent` | `bg-mz-accent` | `#6B2020` | Burgundy — signal only |
| `--mz-accent-soft` | `bg-mz-accent-soft` | `#F1E5E0` | Fit card background |
| `--mz-accent-ink` | `text-mz-accent-ink` | `#4A1818` | Text on accent-soft |

### Spacing (4-base)

| Token | Value | CSS var |
|---|---|---|
| xs | 4px | `--mz-space-xs` |
| sm | 8px | `--mz-space-sm` |
| md | 12px | `--mz-space-md` |
| lg | 16px | `--mz-space-lg` |
| xl | 22px | `--mz-space-xl` |
| 2xl | 32px | `--mz-space-2xl` |
| 3xl | 44px | `--mz-space-3xl` |

### Radii

| Token | Value | CSS var |
|---|---|---|
| sm | 4px | `--mz-radius-sm` |
| md | 10px | `--mz-radius-md` |
| lg | 16px | `--mz-radius-lg` |
| xl | 22px | `--mz-radius-xl` |
| pill | 999px | `--mz-radius-pill` |

### Typography scale

| Role | Font | Size/LH | Weight | Letter-spacing |
|---|---|---|---|---|
| Display XL | Fraunces | 48/50 | 500 | -0.035em |
| Display L | Fraunces | 32/36 | 500 | -0.025em |
| Title | Fraunces | 24/29 | 500 | -0.02em |
| Product | Fraunces | 15/20 | 500 | 0 |
| Body | Inter | 13/21 | 400 | 0 |
| Label | Inter | 12/17 | 500 | 0 |
| Eyebrow | Inter | 10 | 600 | +0.16em UPPERCASE |
| Price | Fraunces | 22/26 | 600 | 0 |
| Mono | JetBrains Mono | 11/15 | 400 | 0 |

## Component list

### Button

```tsx
<Button variant="primary" size="md">Add to bag</Button>
<Button variant="accent" size="lg" fullWidth>Apply fit</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="quiet">Dismiss</Button>
<Button variant="danger" loading>Deleting…</Button>
```

**variant**: `primary` | `accent` | `ghost` | `quiet` | `secondary` | `danger`
**size**: `sm` (h-40) | `md` (h-48) | `lg` (h-56)

### Input

```tsx
<Input label="Email" type="email" required />
<Input label="Password" floatingLabel placeholder="Password" />
<PasswordInput label="Password" floatingLabel />
<Input label="Name" error="Required" hint="Your full name" />
```

**props**: `label`, `hint`, `error`, `floatingLabel`, `leadingIcon`, `trailingAction`

### Textarea

```tsx
<Textarea label="Message" rows={5} hint="Max 500 chars" />
```

### Select

```tsx
<Select
  label="Size"
  options={[{ value: 'L', label: 'L — Large' }]}
  placeholder="Select size"
/>
```

### Checkbox / Radio

```tsx
<Checkbox label="I agree to terms" hint="Required" />
<RadioGroup name="shipping" label="Shipping" options={[...]} value={v} onChange={setV} />
```

### Card

```tsx
<Card variant="elevated" padding="lg">
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```

**variant**: `default` | `elevated` | `outlined` | `ghost`
**padding**: `none` | `sm` | `md` | `lg`

### Badge / Tag

```tsx
<Badge variant="fit">★ FIT L</Badge>
<FitBadge size="L" />
<Badge variant="new">NEW</Badge>
<Tag onRemove={() => {}}>Outerwear</Tag>
```

**variant**: `fit` | `fitSoft` | `new` | `season` | `sale` | `soldOut` | `success` | `warning` | `default`

### Modal / ConfirmDialog

```tsx
<Modal open={open} onClose={close} title="Confirm" size="md" footer={<Button>OK</Button>}>
  Content
</Modal>
<ConfirmDialog open={open} onClose={close} onConfirm={del} title="Delete?" danger />
```

**size**: `sm` | `md` | `lg` | `xl` | `fullscreen`

### Toast

```tsx
// Wrap app in ToastProvider once (in layout)
<ToastProvider position="bottom-center">
  {children}
</ToastProvider>

// Use anywhere
const { toast } = useToast();
toast({ message: 'Added to bag', variant: 'success' });
toast({ title: 'Error', message: 'Out of stock', variant: 'error', duration: 6000 });
```

**variant**: `default` | `success` | `error` | `warning` | `info`
**position**: `top-center` | `top-right` | `bottom-center` | `bottom-right`

### Tooltip

```tsx
<Tooltip content="Add to wishlist" placement="top">
  <button>♡</button>
</Tooltip>
```

**placement**: `top` | `bottom` | `left` | `right`

### Tabs

```tsx
<Tabs defaultValue="details" variant="underline">
  <TabList>
    <Tab value="details">Details</Tab>
    <Tab value="reviews">Reviews</Tab>
  </TabList>
  <TabPanel value="details">…</TabPanel>
  <TabPanel value="reviews">…</TabPanel>
</Tabs>
```

**variant**: `underline` | `pill`

### Skeleton

```tsx
<Skeleton variant="rect" width="100%" height={200} />
<Skeleton variant="circle" width={40} height={40} />
<Skeleton variant="text" lines={3} />
<ProductCardSkeleton />
<TextSkeleton lines={4} />
```

**variant**: `text` | `rect` | `circle`

## Keyframes (required in app globals.css)

These must be present for animated components to work:

```css
@keyframes mz-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes mz-spin { to { transform: rotate(360deg); } }
@keyframes mz-fade-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mz-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
```

Both `apps/commerce` and `apps/admin` already have these defined.
