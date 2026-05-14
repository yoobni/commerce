import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravidog.com'),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // `<html>` and `<body>` are rendered in `[locale]/layout.tsx` so we can set
  // `lang={locale}` at SSR time for hreflang + screen-reader accuracy.
  return children;
}
