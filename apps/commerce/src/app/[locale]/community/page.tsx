import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listPosts } from '@/lib/community/queries';
import { CommunityListClient } from './_components/CommunityListClient';
import type { BoardType } from '@commerce/types';
import { buildAlternates } from '@/lib/seo/alternates';

type BoardFilter = BoardType | 'ALL';
type SortOption = 'newest' | 'popular';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    board?: string;
    sort?: string;
    q?: string;
    page?: string;
    mine?: string;
    liked?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return {
    title: t('title'),
    alternates: buildAlternates('/community', locale),
  };
}

const VALID_BOARDS: BoardFilter[] = ['ALL', 'DAILY', 'STYLE', 'TIP', 'QUESTION'];
const PER_PAGE = 12;

export default async function CommunityPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const boardParam = sp.board?.toUpperCase() as BoardFilter | undefined;
  const currentBoard: BoardFilter =
    boardParam && VALID_BOARDS.includes(boardParam) ? boardParam : 'ALL';
  const currentSort: SortOption = sp.sort === 'popular' ? 'popular' : 'newest';
  const currentSearch = sp.q ?? '';
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));
  const wantsMine = sp.mine === '1';
  const wantsLiked = sp.liked === '1';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth-gated filters silently fall back to the global listing when
  // unauthenticated; the toggle button itself routes to login.
  const currentMine = wantsMine && !!user;
  const currentLiked = wantsLiked && !!user;

  const result = await listPosts({
    boardType: currentBoard,
    search: currentSearch || undefined,
    sort: currentSort,
    page: currentPage,
    per_page: PER_PAGE,
    authorId: currentMine ? user!.id : undefined,
    likedByUserId: currentLiked ? user!.id : undefined,
    // Own posts show ACTIVE + HIDDEN so the author can see what moderation
    // hid; global / liked listings only show ACTIVE.
    includeHidden: currentMine,
  });

  return (
    <CommunityListClient
      locale={locale}
      initialPosts={result.data}
      initialTotal={result.total}
      initialPage={currentPage}
      perPage={PER_PAGE}
      currentBoard={currentBoard}
      currentSort={currentSort}
      currentSearch={currentSearch}
      currentMine={currentMine}
      currentLiked={currentLiked}
      isAuthenticated={!!user}
    />
  );
}
