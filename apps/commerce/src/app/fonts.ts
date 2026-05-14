import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

// Display / Title / Product / Price typography — opsz axis for size-responsive letterforms.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

// Mono — order numbers, timestamps, specs, SKUs.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: '400',
});

export const fontClassNames = `${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`;
