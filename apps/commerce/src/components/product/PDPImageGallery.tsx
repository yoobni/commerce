'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { Modal } from '@/components/ui/Modal';

interface PDPImageGalleryProps {
  images: string[];
  productName: string;
  productId: string;
}

export function PDPImageGallery({ images, productName, productId }: PDPImageGalleryProps) {
  const t = useTranslations('common');
  const track = useTrack();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleZoomOpen = useCallback(() => {
    track('image_zoom', { product_id: productId, image_index: activeIndex });
    setZoomOpen(true);
  }, [activeIndex, productId, track]);

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative group">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[var(--color-neutral-100)] cursor-zoom-in"
          onClick={handleZoomOpen}
        >
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${productName} ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            priority={activeIndex === 0}
          />

          {/* Zoom hint */}
          <div
            className={cn(
              'absolute bottom-3 right-3 flex items-center gap-1.5',
              'bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5',
              'text-xs font-medium text-[var(--color-text-secondary)]',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none'
            )}
            aria-hidden="true"
          >
            <ZoomIcon />
            {t('zoom', { defaultValue: 'Zoom' })}
          </div>

          {/* Zoom button (always accessible) */}
          <button
            type="button"
            onClick={handleZoomOpen}
            className={cn(
              'absolute bottom-3 right-3',
              'bg-white/90 backdrop-blur-sm rounded-full p-2',
              'text-[var(--color-text-secondary)]',
              'opacity-0 focus-visible:opacity-100',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]',
              'transition-opacity'
            )}
            aria-label="Zoom image"
          >
            <ZoomIcon />
          </button>
        </div>

        {/* Arrow nav (shown if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm',
                'flex items-center justify-center shadow-sm',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                'transition-opacity duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]'
              )}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm',
                'flex items-center justify-center shadow-sm',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                'transition-opacity duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]'
              )}
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Image ${i + 1}`}
              onClick={() => handleThumbnailClick(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-20 rounded overflow-hidden',
                'border-2 transition-all duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                i === activeIndex
                  ? 'border-[var(--color-brand-primary)]'
                  : 'border-transparent opacity-60 hover:opacity-90'
              )}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile, when no thumbnails visible) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-200',
                i === activeIndex
                  ? 'bg-[var(--color-brand-primary)] w-3'
                  : 'bg-[var(--color-neutral-300)]'
              )}
            />
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} size="xl" className="bg-black">
        <div className="relative w-full aspect-square md:aspect-auto md:h-[70vh]">
          <Image
            src={activeImage}
            alt={productName}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-contain"
          />
        </div>

        {/* Zoom nav */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-white/70 text-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ZoomIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
