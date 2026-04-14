'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { Modal } from '@/components/ui/Modal';

interface PDPGalleryProps {
  images: string[];
  productName: string;
  productId: string;
}

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlNWUwIi8+PC9zdmc+';

export function PDPGallery({ images, productName, productId }: PDPGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const track = useTrack();

  const safeImages = images.length > 0 ? images : ['/placeholder.jpg'];
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleZoomOpen = useCallback(() => {
    setZoomOpen(true);
    track('image_zoom', { product_id: productId, image_index: activeIndex });
  }, [track, productId, activeIndex]);

  const handleZoomClose = useCallback(() => {
    setZoomOpen(false);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-4">
        {/* Main image */}
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={handleZoomOpen}
            className={cn(
              'relative block w-full aspect-square overflow-hidden rounded-lg bg-[var(--color-neutral-100)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
              'cursor-zoom-in group'
            )}
            aria-label={`Zoom image: ${productName}`}
          >
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
            {/* Zoom icon overlay */}
            <span className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" aria-hidden="true">
              <ZoomIcon />
            </span>
          </button>

          {/* Image counter (mobile) */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1 md:hidden" aria-hidden="true">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i === activeIndex ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {safeImages.length > 1 && (
          <div
            className="flex flex-row gap-2 overflow-x-auto scrollbar-none md:flex-col md:w-[72px] md:overflow-y-auto md:overflow-x-visible md:max-h-[480px]"
            aria-label="Product image thumbnails"
          >
            {safeImages.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleThumbnailClick(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                className={cn(
                  'relative shrink-0 w-16 h-16 md:w-full md:h-[72px] rounded overflow-hidden',
                  'transition-all duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)]',
                  i === activeIndex
                    ? 'ring-2 ring-[var(--color-brand-primary)]'
                    : 'ring-1 ring-[var(--color-border)] opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={src}
                  alt={`${productName} view ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <Modal
        open={zoomOpen}
        onClose={handleZoomClose}
        size="xl"
        title={productName}
      >
        <div className="relative w-full aspect-square rounded overflow-hidden bg-[var(--color-neutral-100)]">
          <Image
            src={activeImage}
            alt={productName}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-contain"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        </div>

        {/* Modal thumbnail strip */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-none justify-center">
            {safeImages.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleThumbnailClick(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'relative shrink-0 w-14 h-14 rounded overflow-hidden transition-all',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)]',
                  i === activeIndex
                    ? 'ring-2 ring-[var(--color-brand-primary)]'
                    : 'ring-1 ring-[var(--color-border)] opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={src}
                  alt={`${productName} view ${i + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}
