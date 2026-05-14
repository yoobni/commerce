import { defaultLocale } from '@/i18n/routing';
import { fontClassNames } from './fonts';

/**
 * Top-level not-found — fires for paths that don't match any locale-prefixed
 * route. We render full `<html>`/`<body>` here because the root layout returns
 * `children` only (the locale layout owns the document shell).
 */
export default function NotFound() {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={fontClassNames} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[var(--mz-bg,#fafafa)]">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">404</p>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-sm text-neutral-600 mb-6">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
          <a
            href={`/${defaultLocale}`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Home
          </a>
        </div>
      </body>
    </html>
  );
}
