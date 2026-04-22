'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePostAction } from '@/lib/community/actions';
import type { PostWithUser } from '@/lib/community/queries';
import type { BoardType } from '@commerce/types';

interface EditPostFormProps {
  post: PostWithUser;
  locale: string;
}

type BoardOption = { value: BoardType; labelKey: string };

const BOARD_OPTIONS: BoardOption[] = [
  { value: 'DAILY', labelKey: 'boardDaily' },
  { value: 'STYLE', labelKey: 'boardStyle' },
  { value: 'TIP', labelKey: 'boardTip' },
  { value: 'QUESTION', labelKey: 'boardQuestion' },
];

export function EditPostForm({ post, locale }: EditPostFormProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [boardType, setBoardType] = useState<BoardType>(post.board_type);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [dogBreed, setDogBreed] = useState(post.dog_breed ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await updatePostAction(post.id, {
      board_type: boardType,
      title,
      content,
      dog_breed: dogBreed.trim() || null,
      images: post.images ?? [],
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(t('error.updateFailed'));
      return;
    }

    router.push(`/${locale}/community/${post.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Board type selector */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('postBoard')}
        </p>
        <div className="flex flex-wrap gap-2">
          {BOARD_OPTIONS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBoardType(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                boardType === value
                  ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                  : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <Input
        label={t('postTitle')}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('postTitlePlaceholder')}
        maxLength={100}
      />

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          {t('postContent')}
          <span className="text-[var(--color-error)] ml-1" aria-hidden="true">*</span>
        </label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('postContentPlaceholder')}
          rows={8}
          maxLength={5000}
          className="w-full px-3 py-2.5 rounded border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm placeholder:text-[var(--color-text-tertiary)] resize-y focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-colors"
        />
        <p className="text-xs text-[var(--color-text-tertiary)] text-right">
          {content.length} / 5000
        </p>
      </div>

      {/* Dog breed */}
      <Input
        label={t('postDogBreed')}
        value={dogBreed}
        onChange={(e) => setDogBreed(e.target.value)}
        placeholder={t('postDogBreedPlaceholder')}
        maxLength={50}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!title.trim() || !content.trim()}
        >
          {t('postUpdate')}
        </Button>
      </div>
    </form>
  );
}
