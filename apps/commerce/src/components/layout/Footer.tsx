'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Language switcher strip ──────────────────────────────────────────────────

function FooterLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const tLang = useTranslations('languages');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
        {tNav('switchLanguage')}
      </span>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => router.replace(pathname, { locale: locale as Locale })}
          aria-pressed={locale === currentLocale}
          className={cn(
            'text-sm transition-colors',
            locale === currentLocale
              ? 'text-[var(--color-text-primary)] font-medium underline underline-offset-2'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          {tLang(locale)}
        </button>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const SHOP_LINKS = [
  { key: 'shop', href: '/products' },
  { key: 'collections', href: '/collections' },
  { key: 'sizeGuide', href: '/size-guide' },
] as const;

const HELP_LINKS = [
  { key: 'about', href: '/about' },
  { key: 'community', href: '/community' },
  { key: 'contact', href: '/contact' },
] as const;

export function Footer({ locale }: { locale: string }) {
  const tFooter = useTranslations('footer');

  return (
    <footer
      className={cn(
        'bg-[var(--color-neutral-800)] text-[var(--color-neutral-300)]',
        // Above mobile nav
        'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0'
      )}
      aria-label="Site footer"
    >
      {/* Main footer content */}
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] md:px-[var(--container-padding-md)] lg:px-[var(--container-padding-lg)] pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              aria-label="RAVI — Home"
              className="inline-block text-xl font-bold tracking-[0.12em] text-white hover:opacity-80 transition-opacity mb-3"
            >
              RAVI
            </Link>
            <p className="text-sm leading-relaxed text-[var(--color-neutral-400)]">
              {tFooter('tagline')}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[var(--color-neutral-400)] hover:text-white transition-colors"
              >
                <IconInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[var(--color-neutral-400)] hover:text-white transition-colors"
              >
                <IconYoutube />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <nav aria-label="Shop links">
            <h3 className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider mb-4">
              {tFooter('shop')}
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-neutral-300)] hover:text-white transition-colors"
                  >
                    {tFooter(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help links */}
          <nav aria-label="Help links">
            <h3 className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider mb-4">
              {tFooter('about')}
            </h3>
            <ul className="space-y-2.5">
              {HELP_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-neutral-300)] hover:text-white transition-colors"
                  >
                    {tFooter(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider mb-4">
              Language
            </h3>
            <div className="flex flex-col gap-2">
              {locales.map((loc) => (
                <FooterLocaleSwitcherItem
                  key={loc}
                  locale={loc}
                  currentLocale={locale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-neutral-700)]">
        <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] md:px-[var(--container-padding-md)] lg:px-[var(--container-padding-lg)] py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            {tFooter('copyright')}
          </p>
          <nav aria-label="Legal links" className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-300)] transition-colors"
            >
              {tFooter('privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-300)] transition-colors"
            >
              {tFooter('terms')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ─── Individual locale item in footer ────────────────────────────────────────

function FooterLocaleSwitcherItem({
  locale,
  currentLocale,
}: {
  locale: Locale;
  currentLocale: string;
}) {
  const tLang = useTranslations('languages');
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      onClick={() => router.replace(pathname, { locale })}
      aria-pressed={locale === currentLocale}
      className={cn(
        'text-sm text-left transition-colors',
        locale === currentLocale
          ? 'text-white font-medium'
          : 'text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-200)]'
      )}
    >
      {tLang(locale)}
    </button>
  );
}
