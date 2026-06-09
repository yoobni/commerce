'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createPost } from '@/lib/api/community/client';
import { ApiCallError } from '@/lib/api/client';
import type { BoardType, Locale, PostImage, Product } from '@commerce/types';
import { PostImageInput } from '../../_components/PostImageInput';
import { ProductSelector } from '../../_components/ProductSelector';

interface PostFormProps {
  locale: Locale;
  userId: string;
}

type BoardOption = { value: BoardType; labelKey: string };

const BOARD_OPTIONS: BoardOption[] = [
  { value: 'DAILY', labelKey: 'boardDaily' },
  { value: 'STYLE', labelKey: 'boardStyle' },
  { value: 'TIP', labelKey: 'boardTip' },
  { value: 'QUESTION', labelKey: 'boardQuestion' },
];

export function PostForm({ locale, userId }: PostFormProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [boardType, setBoardType] = useState<BoardType>('DAILY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [images, setImages] = useState<PostImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPost({
        board_type: boardType,
        title,
        content,
        dog_breed: dogBreed.trim() || null,
        images,
        product_ids: products.map((p) => p.id),
      });
      router.push(`/${locale}/community/${result.short_id}/${result.slug}`);
    } catch (e) {
      const code = e instanceof ApiCallError ? e.code : 'createFailed';
      const retry =
        e instanceof ApiCallError && code === 'rate_limited'
          ? (e.details as { retryAfterSec?: number } | undefined)?.retryAfterSec ?? 60
          : 60;
      setError(
        code === 'rate_limited'
          ? t('error.rateLimited', { sec: retry })
          : t('error.createFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
            *
          </span>
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
        <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
          <span>{t('markdownHint')}</span>
          <span>{content.length} / 5000</span>
        </div>
      </div>

      {/* Dog breed */}
      <Input
        label={t('postDogBreed')}
        value={dogBreed}
        onChange={(e) => setDogBreed(e.target.value)}
        placeholder={t('postDogBreedPlaceholder')}
        maxLength={50}
      />

      {/* Images */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('postImages')}
        </p>
        <PostImageInput
          value={images}
          onChange={setImages}
          userId={userId}
          disabled={isSubmitting}
        />
      </div>

      {/* Products mentioned in the post (F#8) */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('postProducts')}
        </p>
        <ProductSelector
          value={products}
          onChange={setProducts}
          locale={locale}
          disabled={isSubmitting}
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

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
          {t('postSubmit')}
        </Button>
      </div>
    </form>
  );
}
