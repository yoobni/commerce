'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

const LOCALE_LABELS: Record<Locale, { short: string; native: string }> = {
  en: { short: 'EN', native: 'English' },
  ko: { short: 'KO', native: '한국어' },
  ja: { short: 'JA', native: '日本語' },
  de: { short: 'DE', native: 'Deutsch' },
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative group">
      <button
        aria-label="Switch language"
        aria-haspopup="listbox"
        disabled={isPending}
        className="flex items-center gap-1 px-2 py-2 text-[12px] font-medium text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors duration-150 rounded-lg disabled:opacity-50"
      >
        <GlobeIcon />
        <span className="hidden md:block">{LOCALE_LABELS[locale].short}</span>
      </button>

      <ul
        role="listbox"
        aria-label="Select language"
        className="absolute right-0 top-full mt-1 w-[110px] bg-[var(--mz-surface)] border border-[var(--mz-line)] rounded-lg shadow-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50"
      >
        {locales.map((loc) => (
          <li key={loc} role="option" aria-selected={loc === locale}>
            <button
              onClick={() => handleChange(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors duration-100 ${
                loc === locale
                  ? 'text-[var(--mz-ink)] bg-[var(--mz-bg)] font-semibold'
                  : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] hover:bg-[var(--mz-bg)]'
              }`}
            >
              <span className="w-6 text-left font-mono">{LOCALE_LABELS[loc].short}</span>
              <span>{LOCALE_LABELS[loc].native}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GlobeIcon() {
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
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
