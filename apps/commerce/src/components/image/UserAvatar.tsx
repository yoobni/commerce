'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

const FALLBACK = '/images/fallback-avatar.svg';

interface UserAvatarProps {
  src: string | null | undefined;
  name?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, name, size = 36, className }: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK);
  const alt = name ? `${name} 프로필` : '프로필 이미지';

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full bg-[#EAE7E2]', className)}
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
