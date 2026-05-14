'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/cn';

const FALLBACK = '/images/fallback-product.svg';

interface ProductImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined;
  containerClassName?: string;
}

export function ProductImage({ src, alt, className, containerClassName, fill, ...props }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK);

  return (
    <div className={cn('relative overflow-hidden bg-[var(--mz-bg-deep,#F4F2EE)]', containerClassName)}>
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        fill={fill}
        className={cn('object-cover', className)}
        onError={() => setImgSrc(FALLBACK)}
      />
    </div>
  );
}
