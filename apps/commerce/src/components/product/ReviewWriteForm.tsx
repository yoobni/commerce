'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { createClient } from '@/lib/supabase/client';
import { submitReviewAction, updateReviewAction } from '@/lib/reviews/actions';
import type { ReviewWithUser } from '@/lib/queries/reviews';

const SIZE_FEEDBACK_OPTIONS = ['SMALL', 'PERFECT', 'LARGE'] as const;
type SizeFeedback = (typeof SIZE_FEEDBACK_OPTIONS)[number];

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

interface ReviewWriteFormProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productSlug: string;
  isAuthenticated: boolean;
  editReview?: ReviewWithUser;
  onSuccess?: () => void;
}

export function ReviewWriteForm({
  open,
  onClose,
  productId,
  productSlug,
  isAuthenticated,
  editReview,
  onSuccess,
}: ReviewWriteFormProps) {
  const t = useTranslations('review');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editReview;

  // ── form state ──────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [purchasedSize, setPurchasedSize] = useState('');
  const [sizeFeedback, setSizeFeedback] = useState<SizeFeedback>('PERFECT');
  const [dogBreed, setDogBreed] = useState('');
  const [dogWeightKg, setDogWeightKg] = useState('');

  // ── image state ──────────────────────────────────────────────────────────────
  // existingUrls: images already saved (edit mode), shown until removed
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  // newFiles: files selected by user, not yet uploaded
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // newPreviews: object URLs for newFiles (local preview only)
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [error, setError] = useState('');

  const totalImages = existingUrls.length + newFiles.length;
  const isValid =
    rating > 0 && content.trim().length >= 10 && purchasedSize.trim().length > 0;

  // ── populate form when opening in edit mode ──────────────────────────────────
  useEffect(() => {
    if (open && editReview) {
      setRating(editReview.rating);
      setContent(editReview.content ?? '');
      setPurchasedSize(editReview.purchased_size ?? '');
      setSizeFeedback((editReview.size_feedback as SizeFeedback) ?? 'PERFECT');
      setDogBreed(editReview.dog_breed ?? '');
      setDogWeightKg(editReview.dog_weight_kg != null ? String(editReview.dog_weight_kg) : '');
      setExistingUrls(editReview.images ?? []);
    }
  }, [open, editReview]);

  // ── revoke object URLs on unmount / change ────────────────────────────────
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  function handleClose() {
    if (isPending) return;
    resetForm();
    onClose();
  }

  function resetForm() {
    setRating(0);
    setHoverRating(0);
    setContent('');
    setPurchasedSize('');
    setSizeFeedback('PERFECT');
    setDogBreed('');
    setDogWeightKg('');
    setExistingUrls([]);
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewFiles([]);
    setNewPreviews([]);
    setError('');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const remaining = MAX_IMAGES - totalImages;
    const clamped = selected.slice(0, remaining);

    if (clamped.length < selected.length) {
      setError(t('imagesMax'));
    } else {
      setError('');
    }

    const previews = clamped.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...clamped]);
    setNewPreviews((prev) => [...prev, ...previews]);
    // reset input so same file can be re-selected after removal
    e.target.value = '';
  }

  function removeExistingUrl(idx: number) {
    setExistingUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNewFile(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadNewImages(userId: string): Promise<string[]> {
    if (!newFiles.length) return [];
    const supabase = createClient();
    const batchId = crypto.randomUUID();
    const urls: string[] = [];

    for (const file of newFiles) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${batchId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(path, file, { cacheControl: '31536000' });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('reviews').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  function handleSubmit() {
    if (!isValid || isPending) return;
    setError('');

    startTransition(async () => {
      try {
        // get user id for storage path (browser-side auth)
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError(t('loginRequired'));
          return;
        }

        const uploadedUrls = await uploadNewImages(user.id);
        const images = [...existingUrls, ...uploadedUrls];

        if (isEditMode && editReview) {
          await updateReviewAction(editReview.id, {
            productSlug,
            rating,
            content: content.trim(),
            purchasedSize: purchasedSize.trim(),
            sizeFeedback,
            dogBreed: dogBreed.trim() || undefined,
            dogWeightKg: dogWeightKg ? Number(dogWeightKg) : undefined,
            images,
          });
        } else {
          await submitReviewAction({
            productId,
            productSlug,
            rating,
            content: content.trim(),
            purchasedSize: purchasedSize.trim(),
            sizeFeedback,
            dogBreed: dogBreed.trim() || undefined,
            dogWeightKg: dogWeightKg ? Number(dogWeightKg) : undefined,
            images,
          });
        }

        resetForm();
        onSuccess?.();
        onClose();
      } catch {
        setError(isEditMode ? t('editError') : t('submitError'));
      }
    });
  }

  const title = isEditMode ? t('editTitle') : t('write');

  return (
    <Modal open={open} onClose={handleClose} title={title} size="md">
      {!isAuthenticated ? (
        <div className="text-center py-8">
          <p className="text-[var(--color-text-secondary)] mb-4">{t('loginRequired')}</p>
          <button
            type="button"
            onClick={handleClose}
            className="text-sm font-medium text-[var(--color-brand-primary)] underline underline-offset-2"
          >
            {t('close')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('rating')} <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="flex gap-1" role="radiogroup" aria-label={t('rating')}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star}점`}
                  aria-pressed={rating === star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded"
                >
                  <StarIcon filled={star <= (hoverRating || rating)} />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="review-content"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              {t('content')} <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={1000}
              placeholder={t('contentPlaceholder')}
              className={cn(
                'w-full px-3 py-2 text-sm border rounded-lg resize-none',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]',
                'border-[var(--color-border)] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-tertiary)]'
              )}
            />
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)] text-right">
              {content.length} / 1000
            </p>
          </div>

          {/* Purchased size */}
          <div>
            <label
              htmlFor="review-size"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              {t('purchasedSize')} <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="review-size"
              type="text"
              value={purchasedSize}
              onChange={(e) => setPurchasedSize(e.target.value)}
              placeholder="예: XL"
              maxLength={20}
              className={cn(
                'w-full px-3 py-2 text-sm border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]',
                'border-[var(--color-border)] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-tertiary)]'
              )}
            />
          </div>

          {/* Size feedback */}
          <div>
            <p className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('sizeFitSummary')}
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label={t('sizeFitSummary')}>
              {SIZE_FEEDBACK_OPTIONS.map((opt) => {
                const labels: Record<SizeFeedback, string> = {
                  SMALL: t('sizeFeedbackSmall'),
                  PERFECT: t('sizeFeedbackPerfect'),
                  LARGE: t('sizeFeedbackLarge'),
                };
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={sizeFeedback === opt}
                    onClick={() => setSizeFeedback(opt)}
                    className={cn(
                      'flex-1 py-2 text-xs font-medium rounded-lg border transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]',
                      sizeFeedback === opt
                        ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
                    )}
                  >
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dog info (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="review-breed"
                className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                {t('dogBreed')}
              </label>
              <input
                id="review-breed"
                type="text"
                value={dogBreed}
                onChange={(e) => setDogBreed(e.target.value)}
                placeholder="예: 말라뮤트"
                maxLength={50}
                className={cn(
                  'w-full px-3 py-2 text-sm border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]',
                  'border-[var(--color-border)] text-[var(--color-text-primary)]',
                  'placeholder:text-[var(--color-text-tertiary)]'
                )}
              />
            </div>
            <div>
              <label
                htmlFor="review-weight"
                className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                {t('dogWeight')}
              </label>
              <div className="relative">
                <input
                  id="review-weight"
                  type="number"
                  value={dogWeightKg}
                  onChange={(e) => setDogWeightKg(e.target.value)}
                  placeholder="0"
                  min={1}
                  max={200}
                  className={cn(
                    'w-full px-3 py-2 pr-8 text-sm border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]',
                    'border-[var(--color-border)] text-[var(--color-text-primary)]',
                    'placeholder:text-[var(--color-text-tertiary)]'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <p className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('images')}
              <span className="ml-2 text-xs font-normal text-[var(--color-text-tertiary)]">
                {t('imagesHint')}
              </span>
            </p>

            {/* Previews grid */}
            {(existingUrls.length > 0 || newPreviews.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingUrls.map((url, idx) => (
                  <ImageThumb
                    key={`existing-${idx}`}
                    src={url}
                    onRemove={() => removeExistingUrl(idx)}
                  />
                ))}
                {newPreviews.map((src, idx) => (
                  <ImageThumb
                    key={`new-${idx}`}
                    src={src}
                    onRemove={() => removeNewFile(idx)}
                  />
                ))}
              </div>
            )}

            {/* Add button — only shown when under limit */}
            {totalImages < MAX_IMAGES && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  multiple
                  className="sr-only"
                  aria-label={t('images')}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-dashed',
                    'border-[var(--color-border)] text-[var(--color-text-secondary)]',
                    'hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]'
                  )}
                >
                  <PlusIcon />
                  <span>
                    {totalImages}/{MAX_IMAGES}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={cn(
              'w-full py-3 text-sm font-semibold rounded-lg transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
              isValid && !isPending
                ? 'bg-[var(--color-brand-primary)] text-white hover:opacity-90'
                : 'bg-[var(--color-neutral-200)] text-[var(--color-text-tertiary)] cursor-not-allowed'
            )}
          >
            {isPending
              ? newFiles.length > 0
                ? t('uploading')
                : isEditMode
                  ? t('submitting')
                  : t('submitting')
              : isEditMode
                ? t('edit')
                : t('submit')}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] group">
      <Image src={src} alt="" fill className="object-cover" sizes="64px" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 제거"
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
        )}
      >
        <XIcon />
      </button>
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? '#F5A623' : 'none'}
      stroke={filled ? '#F5A623' : '#D1D5DB'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
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
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
