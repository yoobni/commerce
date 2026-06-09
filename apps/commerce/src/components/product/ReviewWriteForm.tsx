'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { submitReview } from '@/lib/api/reviews-client';

interface ReviewWriteFormProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  isAuthenticated: boolean;
}

const SIZE_FEEDBACK_OPTIONS = ['SMALL', 'PERFECT', 'LARGE'] as const;
type SizeFeedback = (typeof SIZE_FEEDBACK_OPTIONS)[number];

export function ReviewWriteForm({
  open,
  onClose,
  productId,
  isAuthenticated,
}: ReviewWriteFormProps) {
  const t = useTranslations('review');
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [purchasedSize, setPurchasedSize] = useState('');
  const [sizeFeedback, setSizeFeedback] = useState<SizeFeedback>('PERFECT');
  const [dogBreed, setDogBreed] = useState('');
  const [dogWeightKg, setDogWeightKg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isValid = rating > 0 && content.trim().length >= 10 && purchasedSize.trim().length > 0;

  function handleClose() {
    if (isPending) return;
    setRating(0);
    setHoverRating(0);
    setContent('');
    setPurchasedSize('');
    setSizeFeedback('PERFECT');
    setDogBreed('');
    setDogWeightKg('');
    setSubmitted(false);
    setError('');
    onClose();
  }

  function handleSubmit() {
    if (!isValid || isPending) return;
    setError('');

    startTransition(async () => {
      try {
        await submitReview({
          productId,
          rating,
          content: content.trim(),
          purchasedSize: purchasedSize.trim(),
          sizeFeedback,
          dogBreed: dogBreed.trim() || undefined,
          dogWeightKg: dogWeightKg ? Number(dogWeightKg) : undefined,
        });
        setSubmitted(true);
      } catch {
        setError(t('submitError'));
      }
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('write')} size="md">
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
      ) : submitted ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-3" aria-hidden="true">
            ✦
          </p>
          <p className="font-medium text-[var(--color-text-primary)] mb-1">{t('submitSuccess')}</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 text-sm font-medium text-[var(--color-brand-primary)] underline underline-offset-2"
          >
            {t('close')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('rating')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1" role="radiogroup" aria-label={t('rating')}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star}점`}
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
              {t('content')} <span className="text-red-500">*</span>
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
              {t('purchasedSize')} <span className="text-red-500">*</span>
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
            {isPending ? t('submitting') : t('submit')}
          </button>
        </div>
      )}
    </Modal>
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
