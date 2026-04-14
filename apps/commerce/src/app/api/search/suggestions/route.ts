import { NextRequest, NextResponse } from 'next/server';
import { searchSuggestions } from '@/lib/queries/search';
import type { Locale } from '@commerce/types';

const VALID_LOCALES: Locale[] = ['ko', 'en', 'ja', 'de'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q')?.trim() ?? '';
  const rawLocale = searchParams.get('locale') ?? 'en';
  const locale: Locale = VALID_LOCALES.includes(rawLocale as Locale) ? (rawLocale as Locale) : 'en';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await searchSuggestions(q, locale, 5);
    return NextResponse.json(suggestions, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
