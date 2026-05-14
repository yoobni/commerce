'use client';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';

// Spec: Direction B — Fit-for-Hana Card (Signature Component ★)
// bg: accentSoft, fg: accentInk, radius: md (10)
// Layout: 40px circular hound avatar | flex-1 text stack | "Why →"
// Text: eyebrow "FIT FOR {name}" + Fraunces 15/500 recommendation
// Appears on: Home, PLP header, PDP, Cart, Checkout, My page
// Fallback (no profile): muted "Set up Hana's profile →" prompt

export interface HoundProfile {
  /** Hound's name (e.g. "Hana") */
  name: string;
  /** Breed display name */
  breed: string;
  /** Recommended size derived from profile */
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  /** Body type classification */
  bodyType?: 'Sporty' | 'Sturdy' | 'Slim' | 'Cloud';
  /** Profile image URL — falls back to placeholder illustration */
  avatarUrl?: string | null;
}

export interface FitForHanaCardProps {
  /** Hound profile from onboarding. Pass null/undefined to render setup prompt. */
  profile?: HoundProfile | null;
  /** Custom recommendation text. Defaults to "Recommended · size {size}" */
  recommendation?: string;
  /** Called when "Why →" is pressed */
  onWhyClick?: () => void;
  /** Setup CTA destination — only used in fallback state */
  setupHref?: string;
  className?: string;
}

export function FitForHanaCard({
  profile,
  recommendation,
  onWhyClick,
  setupHref = '/onboarding',
  className,
}: FitForHanaCardProps) {
  // ── Fallback: onboarding not completed ────────────────────────────────────
  if (!profile) {
    return (
      <Link
        href={setupHref}
        className={cn(
          'flex items-center gap-3 p-[14px] rounded-[var(--radius-md)]',
          'border border-[var(--mz-line-strong)] bg-[var(--mz-surface)]',
          'transition-colors duration-150 hover:bg-[var(--mz-bg-deep)]',
          'no-underline',
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--mz-bg)] flex items-center justify-center shrink-0">
          <PawPlaceholder />
        </div>
        <span className="text-[13px] text-[var(--mz-ink-mute)] flex-1 font-medium">
          Set up your hound&apos;s profile →
        </span>
      </Link>
    );
  }

  // ── Active: profile present ────────────────────────────────────────────────
  const displayText = recommendation ?? `Recommended · size ${profile.size}`;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-[14px] rounded-[var(--radius-md)]',
        'bg-[var(--mz-accent-soft)]',
        className
      )}
      role="region"
      aria-label={`Fit for ${profile.name}`}
    >
      {/* Hound avatar — 40×40, page-bg fill per spec */}
      <div
        className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[var(--mz-bg)] flex items-center justify-center"
        aria-hidden="true"
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <DogAvatarPlaceholder />
        )}
      </div>

      {/* Text stack */}
      <div className="flex-1 min-w-0">
        {/* Eyebrow — Inter 10/700 +0.16em UPPERCASE */}
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mz-accent-ink)] mb-0.5">
          Fit for {profile.name}
        </p>
        {/* Recommendation — Fraunces 15/500 */}
        <p
          className="text-[15px] font-[500] leading-[20px] text-[var(--mz-accent-ink)] font-serif truncate"
          title={displayText}
        >
          {displayText}
        </p>
      </div>

      {/* Why CTA — Inter 11/600, always visible per spec */}
      {onWhyClick ? (
        <button
          type="button"
          onClick={onWhyClick}
          className="text-[11px] font-semibold text-[var(--mz-accent-ink)] shrink-0 hover:underline underline-offset-2 transition-opacity active:opacity-70"
          aria-label={`Why is size ${profile.size} recommended for ${profile.name}?`}
        >
          Why →
        </button>
      ) : (
        <span
          aria-hidden="true"
          className="text-[11px] font-semibold text-[var(--mz-accent-ink)] shrink-0"
        >
          Why →
        </span>
      )}
    </div>
  );
}

// ─── SVG Placeholders ─────────────────────────────────────────────────────────
// Minimal SVG illustrations until real assets are commissioned

function PawPlaceholder() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--mz-ink-mute)]"
    >
      <circle cx="12" cy="16" r="5" />
      <circle cx="6" cy="9" r="2.5" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="18" cy="9" r="2.5" />
    </svg>
  );
}

function DogAvatarPlaceholder() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--mz-accent-ink)]"
    >
      {/* Simplified dog head silhouette */}
      <path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" />
      <path d="M7 6c-1.5-1-2.5-1.5-3-1l-.5 3" />
      <path d="M17 6c1.5-1 2.5-1.5 3-1l.5 3" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
