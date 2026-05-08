'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

const FALLBACK = '/images/fallback-product.svg';

interface ThumbnailProps {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
  rounded?: boolean;
}

export function Thumbnail({ src, alt, size = 64, className, rounded = false }: ThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK);

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-[var(--mz-bg-deep,#F4F2EE)]',
        rounded && 'rounded-md',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setImgSrc(FALLBACK)}
      />
    </div>
  );
}
