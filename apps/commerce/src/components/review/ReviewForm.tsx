'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { createReviewAction } from '@/lib/reviews/actions';
import type { SizeFeedback } from '@/lib/reviews/queries';
import { RatingInput } from './RatingStars';
import { useTrack } from '@/hooks/useTrack';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 1000;

interface ReviewableItem {
  order_item_id: string;
  product_id: string;
  product_name: string;
  product_thumbnail: string;
  purchased_size: string;
}

interface ReviewFormProps {
  item: ReviewableItem;
  locale: string;
  onSuccess?: () => void;
}

interface ImagePreview {
  file: File;
  previewUrl: string;
}

type FormError =
  | 'ratingRequired'
  | 'sizeFeedbackRequired'
  | 'contentTooShort'
  | 'notAuthenticated'
  | 'notEligible'
  | 'alreadyReviewed'
  | 'imageFileTooLarge'
  | 'imageTypeNotAllowed'
  | 'maxImagesReached'
  | 'generic';

export function ReviewForm({ item, locale, onSuccess }: ReviewFormProps) {
  const t = useTranslations('review');
  const track = useTrack();

  const [rating, setRating] = useState(0);
  const [sizeFeedback, setSizeFeedback] = useState<SizeFeedback | null>(null);
  const [content, setContent] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogWeight, setDogWeight] = useState('');
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormError, true>>>({});
  const [submitError, setSubmitError] = useState<FormError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const remaining = MAX_IMAGES - imagePreviews.length;
      if (remaining <= 0) {
        setFieldErrors((prev) => ({ ...prev, maxImagesReached: true }));
        return;
      }

      const toAdd = files.slice(0, remaining);
      const newPreviews: ImagePreview[] = [];

      for (const file of toAdd) {
        if (file.size > MAX_FILE_SIZE) {
          setFieldErrors((prev) => ({ ...prev, imageFileTooLarge: true }));
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          setFieldErrors((prev) => ({ ...prev, imageTypeNotAllowed: true }));
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        newPreviews.push({ file, previewUrl: URL.createObjectURL(file) });
      }

      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.maxImagesReached;
        delete next.imageFileTooLarge;
        delete next.imageTypeNotAllowed;
        return next;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [imagePreviews.length]
  );

  const removeImage = useCallback((idx: number) => {
    setImagePreviews((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  }, []);

  const validate = (): boolean => {
    const errors: Partial<Record<FormError, true>> = {};
    if (rating === 0) errors.ratingRequired = true;
    if (!sizeFeedback) errors.sizeFeedbackRequired = true;
    if (content.trim().length < MIN_CONTENT_LENGTH) errors.contentTooShort = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload images client-side
      const imageUrls: string[] = [];
      if (imagePreviews.length > 0) {
        const supabase = createClient();
        for (const { file } of imagePreviews) {
          const ext = file.name.split('.').pop() ?? 'jpg';
          const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

          // Get current user id for storage path
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            setSubmitError('notAuthenticated');
            setIsSubmitting(false);
            return;
          }

          const path = `${user.id}/${item.order_item_id}/${filename}`;
          const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(path, file, { contentType: file.type, upsert: false });

          if (uploadError) {
            setSubmitError('generic');
            setIsSubmitting(false);
            return;
          }

          const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      const result = await createReviewAction({
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        rating,
        content: content.trim(),
        size_feedback: sizeFeedback!,
        purchased_size: item.purchased_size,
        dog_weight_kg: dogWeight ? parseFloat(dogWeight) : null,
        dog_breed: dogBreed.trim() || null,
        image_urls: imageUrls,
      });

      if (!result.success) {
        const errMap: Record<string, FormError> = {
          not_authenticated: 'notAuthenticated',
          not_eligible: 'notEligible',
          already_reviewed: 'alreadyReviewed',
          content_too_short: 'contentTooShort',
        };
        setSubmitError(errMap[result.error ?? ''] ?? 'generic');
        setIsSubmitting(false);
        return;
      }

      // Track success
      track('review_create', {
        product_id: item.product_id,
        rating,
        has_photo: imageUrls.length > 0,
        has_text: content.trim().length > 0,
        size_purchased: item.purchased_size || null,
      });

      setIsSuccess(true);
      onSuccess?.();
    } catch {
      setSubmitError('generic');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success state ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">{t('success')}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('successDesc')}</p>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Product summary */}
      <div className="flex gap-3 p-3 bg-[var(--color-neutral-50)] rounded-lg border border-[var(--color-border)]">
        {item.product_thumbnail ? (
          <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-[var(--color-neutral-100)]">
            <Image
              src={item.product_thumbnail}
              alt={item.product_name}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-md bg-[var(--color-neutral-200)] shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug">
            {item.product_name}
          </p>
          {item.purchased_size && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {t('purchasedSize')}: {item.purchased_size}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('rating')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <RatingInput value={rating} onChange={setRating} disabled={isSubmitting} />
        {fieldErrors.ratingRequired && (
          <p className="mt-1 text-xs text-red-500">{t('error.ratingRequired')}</p>
        )}
      </div>

      {/* Size feedback */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('sizeFeedback.title')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="flex gap-2">
          {(['SMALL', 'PERFECT', 'LARGE'] as const).map((fb) => {
            const label = { SMALL: t('sizeFeedback.SMALL'), PERFECT: t('sizeFeedback.PERFECT'), LARGE: t('sizeFeedback.LARGE') }[fb];
            const selected = sizeFeedback === fb;
            return (
              <button
                key={fb}
                type="button"
                disabled={isSubmitting}
                onClick={() => setSizeFeedback(fb)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {fieldErrors.sizeFeedbackRequired && (
          <p className="mt-1 text-xs text-red-500">{t('error.sizeFeedbackRequired')}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          {t('content')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          id="review-content"
          rows={5}
          maxLength={MAX_CONTENT_LENGTH}
          disabled={isSubmitting}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (fieldErrors.contentTooShort && e.target.value.trim().length >= MIN_CONTENT_LENGTH) {
              setFieldErrors((prev) => { const next = { ...prev }; delete next.contentTooShort; return next; });
            }
          }}
          placeholder={t('contentPlaceholder')}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-colors ${
            fieldErrors.contentTooShort
              ? 'border-red-400 focus:ring-red-200'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
          } disabled:opacity-50`}
        />
        <div className="flex items-center justify-between mt-1">
          {fieldErrors.contentTooShort ? (
            <p className="text-xs text-red-500">{t('error.contentTooShort')}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[var(--color-text-secondary)] ml-auto">
            {content.length}/{MAX_CONTENT_LENGTH}
          </p>
        </div>
      </div>

      {/* Dog info (optional) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors list-none flex items-center gap-1">
          <svg
            className="w-4 h-4 transition-transform group-open:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {t('dogInfo')}
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="dog-breed"
              className="block text-xs text-[var(--color-text-secondary)] mb-1"
            >
              {t('dogBreed')}
            </label>
            <input
              id="dog-breed"
              type="text"
              maxLength={50}
              disabled={isSubmitting}
              value={dogBreed}
              onChange={(e) => setDogBreed(e.target.value)}
              placeholder={t('dogBreedPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="dog-weight"
              className="block text-xs text-[var(--color-text-secondary)] mb-1"
            >
              {t('dogWeight')}
            </label>
            <input
              id="dog-weight"
              type="number"
              min="1"
              max="100"
              step="0.1"
              disabled={isSubmitting}
              value={dogWeight}
              onChange={(e) => setDogWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 transition-colors"
            />
          </div>
        </div>
      </details>

      {/* Image upload */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t('images')}
          <span className="text-xs font-normal text-[var(--color-text-secondary)] ml-1.5">
            {t('imagesHint')}
          </span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {imagePreviews.map((preview, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src={preview.previewUrl}
                alt={`Preview ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                aria-label={t('removePhoto')}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {imagePreviews.length < MAX_IMAGES && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px]">{t('addPhotos')}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {(fieldErrors.imageFileTooLarge || fieldErrors.imageTypeNotAllowed || fieldErrors.maxImagesReached) && (
          <p className="mt-1 text-xs text-red-500">
            {fieldErrors.imageFileTooLarge && t('error.imageFileTooLarge')}
            {fieldErrors.imageTypeNotAllowed && t('error.imageTypeNotAllowed')}
            {fieldErrors.maxImagesReached && t('error.maxImagesReached')}
          </p>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">
            {t(`error.${submitError}`)}
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary)]/90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
