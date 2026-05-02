'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePostAction } from '@/lib/community/actions';
import { createClient } from '@/lib/supabase/client';
import { uploadPostImage, getStoragePublicUrl } from '@commerce/shared';
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

const MAX_IMAGES = 5;

export function EditPostForm({ post, locale }: EditPostFormProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [boardType, setBoardType] = useState<BoardType>(post.board_type);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [dogBreed, setDogBreed] = useState(post.dog_breed ?? '');
  // Existing uploaded image URLs (kept as-is)
  const [existingUrls, setExistingUrls] = useState<string[]>(post.images ?? []);
  // New files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingUrls.length + newImageFiles.length;

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - totalCount;
    const toAdd = files.slice(0, remaining);
    setNewImageFiles((prev) => [...prev, ...toAdd]);
    setNewImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeExisting(idx: number) {
    setExistingUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNew(idx: number) {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    let newUploadedUrls: string[] = [];

    if (newImageFiles.length > 0) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(t('error.updateFailed'));
        setIsSubmitting(false);
        return;
      }

      try {
        for (const file of newImageFiles) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filename = `${Date.now()}-${safeName}`;
          const path = await uploadPostImage(supabase, file, user.id, post.id, filename);
          const url = getStoragePublicUrl(supabase, 'posts', path);
          newUploadedUrls.push(url);
        }
      } catch {
        setError(t('imageUploadFailed'));
        setIsSubmitting(false);
        return;
      }
    }

    const result = await updatePostAction(post.id, {
      board_type: boardType,
      title,
      content,
      dog_breed: dogBreed.trim() || null,
      images: [...existingUrls, ...newUploadedUrls],
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

      {/* Image management */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('postImages')}
        </p>

        {/* Existing images */}
        {(existingUrls.length > 0 || newImagePreviews.length > 0) && (
          <div className="flex gap-2 flex-wrap mb-3">
            {existingUrls.map((url, idx) => (
              <div
                key={`existing-${idx}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-neutral-100)]"
              >
                <Image src={url} alt={`이미지 ${idx + 1}`} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeExisting(idx)}
                  aria-label="이미지 제거"
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs leading-none hover:bg-black/80 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            {newImagePreviews.map((src, idx) => (
              <div
                key={`new-${idx}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-brand-primary)] bg-[var(--color-neutral-100)]"
              >
                <Image src={src} alt={`새 이미지 ${idx + 1}`} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(idx)}
                  aria-label="이미지 제거"
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs leading-none hover:bg-black/80 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        {totalCount < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <PlusIcon />
            {t('postImagesAdd')}
            <span className="text-xs text-[var(--color-text-tertiary)]">
              ({totalCount}/{MAX_IMAGES})
            </span>
          </button>
        )}
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5">{t('postImagesHint')}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFilePick}
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
          {t('postUpdate')}
        </Button>
      </div>
    </form>
  );
}

function PlusIcon() {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
