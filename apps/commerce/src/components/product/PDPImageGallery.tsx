'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';

interface PDPImageGalleryProps {
  images: string[];
  productName: string;
  productId: string;
}

export function PDPImageGallery({ images, productName, productId }: PDPImageGalleryProps) {
  const track = useTrack();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const allImages = images.length > 0 ? images : ['/placeholder-product.jpg'];

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((Math.max(0, Math.min(index, allImages.length - 1))));
    },
    [allImages.length]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const openZoom = useCallback(
    (index: number) => {
      setZoomOpen(true);
      track('image_zoom', { product_id: productId, image_index: index });
    },
    [productId, track]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!zoomOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [zoomOpen, goPrev, goNext]);

  // Body scroll lock when zoom open
  useEffect(() => {
    if (!zoomOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [zoomOpen]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative aspect-square md:aspect-[4/5] rounded-lg overflow-hidden bg-[var(--color-neutral-100)] group">
          <Image
            src={allImages[activeIndex]}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            priority={activeIndex === 0}
            quality={90}
          />

          {/* Prev / Next arrows (desktop) */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                aria-label="Previous image"
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 z-10',
                  'w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                  'disabled:opacity-0 focus-visible:opacity-100',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]'
                )}
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex === allImages.length - 1}
                aria-label="Next image"
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 z-10',
                  'w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                  'disabled:opacity-0 focus-visible:opacity-100',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]'
                )}
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            type="button"
            onClick={() => openZoom(activeIndex)}
            aria-label="Zoom image"
            className={cn(
              'absolute bottom-3 right-3 z-10',
              'w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
              'focus-visible:opacity-100',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]'
            )}
          >
            <ZoomIcon />
          </button>

          {/* Mobile: dot indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    i === activeIndex ? 'bg-white w-4' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip (desktop only) */}
        {allImages.length > 1 && (
          <div
            className="hidden md:flex gap-2 overflow-x-auto scrollbar-none"
            role="list"
            aria-label="Product images"
          >
            {allImages.map((src, i) => (
              <button
                key={i}
                type="button"
                role="listitem"
                onClick={() => goTo(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                className={cn(
                  'relative shrink-0 w-16 h-16 rounded overflow-hidden bg-[var(--color-neutral-100)]',
                  'border-2 transition-colors duration-150',
                  i === activeIndex
                    ? 'border-[var(--color-brand-primary)]'
                    : 'border-transparent hover:border-[var(--color-neutral-300)]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)]'
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
      </div>

      {/* Zoom modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <CloseIcon />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                disabled={activeIndex === 0}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                disabled={activeIndex === allImages.length - 1}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-3xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[activeIndex]}
              alt={`${productName} zoomed`}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
              quality={100}
            />
          </div>

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm">
              {activeIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
