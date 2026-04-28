'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/Button';
import type { PostWithUser } from '@/lib/community/queries';
import type { BoardType } from '@commerce/types';

type BoardFilter = BoardType | 'ALL';
type SortOption = 'newest' | 'popular';

interface CommunityListClientProps {
  locale: string;
  initialPosts: PostWithUser[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  currentBoard: BoardFilter;
  currentSort: SortOption;
  currentSearch: string;
  isAuthenticated: boolean;
}

const BOARD_FILTERS: { key: BoardFilter; labelKey: string }[] = [
  { key: 'ALL', labelKey: 'boardAll' },
  { key: 'DAILY', labelKey: 'boardDaily' },
  { key: 'STYLE', labelKey: 'boardStyle' },
  { key: 'TIP', labelKey: 'boardTip' },
  { key: 'QUESTION', labelKey: 'boardQuestion' },
];

export function CommunityListClient({
  locale,
  initialPosts,
  initialTotal,
  initialPage,
  perPage,
  currentBoard,
  currentSort,
  currentSearch,
  isAuthenticated,
}: CommunityListClientProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const tEmpty = useTranslations('empty');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentSearch);

  const hasMore = initialPage * perPage < initialTotal;

  function navigate(params: Record<string, string | undefined>) {
    const url = new URL(`/${locale}/community`, window.location.origin);
    const merged = {
      board: currentBoard !== 'ALL' ? currentBoard : undefined,
      sort: currentSort !== 'newest' ? currentSort : undefined,
      q: currentSearch || undefined,
      page: undefined,
      ...params,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
    startTransition(() => {
      router.push(url.pathname + url.search);
    });
  }

  function handleBoardChange(board: BoardFilter) {
    navigate({ board: board !== 'ALL' ? board : undefined, page: undefined });
  }

  function handleSortChange(sort: SortOption) {
    navigate({ sort: sort !== 'newest' ? sort : undefined, page: undefined });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: searchInput.trim() || undefined, page: undefined });
  }

  function handleLoadMore() {
    navigate({ page: String(initialPage + 1) });
  }

  function handleWrite() {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?next=/${locale}/community/new`);
      return;
    }
    router.push(`/${locale}/community/new`);
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {initialTotal > 0 ? t('views', { count: initialTotal }) : ''}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleWrite}>
            <PenIcon />
            {t('write')}
          </Button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-colors"
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            aria-label={tCommon('search')}
          >
            <SearchIcon />
          </button>
        </form>

        {/* Board filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {BOARD_FILTERS.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => handleBoardChange(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentBoard === key
                  ? 'bg-[var(--color-brand-primary)] text-white'
                  : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}

          {/* Sort — right side */}
          <div className="ml-auto shrink-0 flex gap-1">
            <button
              onClick={() => handleSortChange('newest')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentSort === 'newest'
                  ? 'text-[var(--color-brand-primary)] font-bold'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {t('sortNewest')}
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentSort === 'popular'
                  ? 'text-[var(--color-brand-primary)] font-bold'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {t('sortPopular')}
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {isPending && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Post grid */}
        {!isPending && (
          <>
            {initialPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🐾</p>
                <p className="text-[var(--color-text-secondary)]">{tEmpty('community.title')}</p>
                <button
                  onClick={handleWrite}
                  className="mt-4 text-sm text-[var(--color-brand-accent)] hover:underline"
                >
                  {tEmpty('community.action')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialPosts.map((post) => (
                  <PostCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="secondary" size="md" onClick={handleLoadMore} loading={isPending}>
                  {t('loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
