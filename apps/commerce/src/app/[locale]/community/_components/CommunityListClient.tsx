'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import type { PostWithUser } from '@/lib/api/community/posts';
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
  /** "내 글" filter active. Server already resolved auth requirement. */
  currentMine: boolean;
  /** "좋아요한 글" filter active. */
  currentLiked: boolean;
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
  currentMine,
  currentLiked,
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
      mine: currentMine ? '1' : undefined,
      liked: currentLiked ? '1' : undefined,
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

  function handleMineToggle() {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?next=/${locale}/community?mine=1`);
      return;
    }
    // mine and liked are mutually exclusive — toggling one clears the other.
    navigate({
      mine: currentMine ? undefined : '1',
      liked: undefined,
      page: undefined,
    });
  }

  function handleLikedToggle() {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?next=/${locale}/community?liked=1`);
      return;
    }
    navigate({
      liked: currentLiked ? undefined : '1',
      mine: undefined,
      page: undefined,
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
    <div className="min-h-screen bg-[var(--mz-bg)]">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
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
        <form onSubmit={handleSearch} className="mb-6">
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            leadingIcon={<SearchIcon />}
            aria-label={tCommon('search')}
          />
        </form>

        {/* Board filter chips */}
        <ChipGroup className="mb-3">
          {BOARD_FILTERS.map(({ key, labelKey }) => (
            <Chip
              key={key}
              selected={currentBoard === key}
              onClick={() => handleBoardChange(key)}
            >
              {t(labelKey)}
            </Chip>
          ))}

          {/* "내 글" / "좋아요한 글" — auth required, mutually exclusive */}
          <Chip selected={currentMine} onClick={handleMineToggle}>
            <UserIcon />
            {t('mineFilter')}
          </Chip>
          <Chip selected={currentLiked} onClick={handleLikedToggle}>
            <HeartIcon />
            {t('likedFilter')}
          </Chip>
        </ChipGroup>

        {/* Sort — quiet, right-aligned text toggle */}
        <div className="flex justify-end mb-6 gap-1">
          <button
            type="button"
            onClick={() => handleSortChange('newest')}
            className={`px-2 py-1 text-[12px] font-medium transition-colors ${
              currentSort === 'newest'
                ? 'text-[var(--mz-ink)] underline underline-offset-4 decoration-[var(--mz-accent)] decoration-2'
                : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)]'
            }`}
          >
            {t('sortNewest')}
          </button>
          <span className="text-[var(--mz-ink-mute)] text-[12px] self-center" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => handleSortChange('popular')}
            className={`px-2 py-1 text-[12px] font-medium transition-colors ${
              currentSort === 'popular'
                ? 'text-[var(--mz-ink)] underline underline-offset-4 decoration-[var(--mz-accent)] decoration-2'
                : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)]'
            }`}
          >
            {t('sortPopular')}
          </button>
        </div>

        {/* Loading overlay */}
        {isPending && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--mz-ink)] border-t-transparent rounded-full animate-spin" />
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-12 pb-4">
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

function UserIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
