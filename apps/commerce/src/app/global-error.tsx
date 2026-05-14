'use client';

import { defaultLocale } from '@/i18n/routing';
import { fontClassNames } from './fonts';

/**
 * Top-level error boundary — fires for unhandled errors that escape the locale
 * subtree (root layout returns `children` only, so we render the document
 * shell here too).
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={fontClassNames} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[var(--mz-bg,#fafafa)]">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Error</p>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
