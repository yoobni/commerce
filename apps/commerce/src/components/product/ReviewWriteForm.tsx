'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTrack } from '@/hooks/useTrack';
import { createReviewAction } from '@/lib/reviews/actions';
import type { SizeFeedback } from '@commerce/types';

interface ReviewWriteFormProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  isAuthenticated: boolean;
}

type FormError =
  | 'not_authenticated'
  | 'not_purchased'
  | 'already_reviewed'
  | 'rating_required'
  | 'size_required'
  | 'generic'
  | string;

export function ReviewWriteForm({
  open,
  onClose,
  productId,
  isAuthenticated,
}: ReviewWriteFormProps) {
  const t = useTranslations('review');
  const router = useRouter();
  const track = useTrack();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [sizeFeedback, setSizeFeedback] = useState<SizeFeedback | null>(null);
  const [dogBreed, setDogBreed] = useState('');
  const [dogWeight, setDogWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setContent('');
    setSizeFeedback(null);
    setDogBreed('');
    setDogWeight('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('not_authenticated');
      return;
    }
    if (!rating) {
      setError('rating_required');
      return;
    }
    if (!sizeFeedback) {
      setError('size_required');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createReviewAction({
      product_id: productId,
      rating,
      content,
      images: [],
      dog_weight_kg: dogWeight ? parseFloat(dogWeight) : null,
      dog_breed: dogBreed || null,
      size_feedback: sizeFeedback,
    });

    setLoading(false);

    if (result.success) {
      track('review_create', {
        product_id: productId,
        rating,
        has_photo: false,
        has_text: content.trim().length > 0,
        size_purchased: null,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1600);
    } else {
      setError(result.error ?? 'generic');
    }
  };

  const getErrorMessage = (err: FormError): string => {
    switch (err) {
      case 'not_authenticated':
        return t('loginToReview');
      case 'not_purchased':
        return t('purchaseRequired');
      case 'already_reviewed':
        return t('alreadyReviewed');
      case 'rating_required':
        return t('ratingRequired');
      case 'size_required':
        return t('sizeFeedbackRequired');
      default:
        return t('submitError');
    }
  };

  const activeRating = hoverRating || rating;

  const sizeFeedbackLabels: Record<SizeFeedback, string> = {
    SMALL: t('sizeFeedbackSmall'),
    PERFECT: t('sizeFeedbackPerfect'),
    LARGE: t('sizeFeedbackLarge'),
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('write')} size="md">
      {success ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-4xl" aria-hidden="true">✦</p>
          <p className="font-semibold text-[var(--color-text-primary)]">{t('submitSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Star rating input */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t('ratingLabel')}
              </span>
              <span className="text-xs text-[var(--color-error)]" aria-hidden="true">*</span>
            </div>
            <div
              className="flex items-center gap-0.5"
              role="radiogroup"
              aria-label={t('ratingLabel')}
              aria-required="true"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill={star <= activeRating ? '#F5A623' : 'none'}
                    stroke={star <= activeRating ? '#F5A623' : '#D1D5DB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-all duration-100"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Size feedback — large-dog specific */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t('sizeFeedback')}
              </span>
              <span className="text-xs text-[var(--color-error)]" aria-hidden="true">*</span>
            </div>
            <div
              className="grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label={t('sizeFeedback')}
              aria-required="true"
            >
              {(['SMALL', 'PERFECT', 'LARGE'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  role="radio"
                  aria-checked={sizeFeedback === val}
                  onClick={() => setSizeFeedback(val)}
                  className={cn(
                    'h-10 rounded text-sm font-medium border transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                    sizeFeedback === val
                      ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                      : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
                  )}
                >
                  {sizeFeedbackLabels[val]}
                </button>
              ))}
            </div>
          </div>

          {/* Review content */}
          <div className="space-y-2">
            <label
              htmlFor="review-content"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              {t('content')}
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('contentPlaceholder')}
              rows={4}
              maxLength={1000}
              className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
            />
            <p className="text-right text-xs text-[var(--color-text-tertiary)]">
              {content.length} / 1000
            </p>
          </div>

          {/* Dog info — large-dog specific */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {t('dogInfo')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="review-dog-breed"
                  className="text-xs text-[var(--color-text-secondary)]"
                >
                  {t('dogBreed')}
                </label>
                <input
                  id="review-dog-breed"
                  type="text"
                  value={dogBreed}
                  onChange={(e) => setDogBreed(e.target.value)}
                  placeholder={t('dogBreedPlaceholder')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="review-dog-weight"
                  className="text-xs text-[var(--color-text-secondary)]"
                >
                  {t('dogWeight')}
                </label>
                <input
                  id="review-dog-weight"
                  type="number"
                  min={1}
                  max={200}
                  step={0.1}
                  value={dogWeight}
                  onChange={(e) => setDogWeight(e.target.value)}
                  placeholder={t('dogWeightPlaceholder')}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white focus:outline-none focus:border-[var(--color-brand-primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* TODO: Photo upload
              Integration: Supabase Storage bucket 'review-images'
              Path pattern: `${userId}/${productId}/${Date.now()}-${filename}`
              Use createBrowserClient() + supabase.storage.from('review-images').upload()
              on file select → get public URL → pass in images[] to createReviewAction
              Ref: apps/commerce/src/lib/supabase/client.ts
          */}

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="text-sm text-[var(--color-error)] bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
            >
              {getErrorMessage(error)}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
          >
            {t('submit')}
          </Button>
        </form>
      )}
    </Modal>
  );
}
