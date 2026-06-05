'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import type { PostImage } from '@commerce/types';

interface PostImageInputProps {
  value: PostImage[];
  onChange: (next: PostImage[]) => void;
  /** Max images per post. Default 10. */
  max?: number;
  /** Max file size in bytes. Default 5MB (matches storage bucket limit). */
  maxBytes?: number;
  /** Required for storage path scoping. */
  userId: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX = 10;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Multi-image picker for community post create/edit. Uploads to the
 * `community` storage bucket scoped to user_id (RLS enforces it). Each image
 * also accepts an alt-text input — a11y + SEO requirement.
 *
 * EXIF strip + dimension cap: every uploaded file is re-encoded through a
 * canvas before upload. This both removes location/device metadata and
 * downscales oversize images to 2048px on the longest edge.
 */
export function PostImageInput({
  value,
  onChange,
  max = DEFAULT_MAX,
  maxBytes = DEFAULT_MAX_BYTES,
  userId,
  disabled,
}: PostImageInputProps) {
  const t = useTranslations('community');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = value.length >= max;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = max - value.length;
    const picked = Array.from(files).slice(0, room);

    // Client-side validation pass
    for (const file of picked) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t('imageError.type'));
        return;
      }
      if (file.size > maxBytes) {
        setError(t('imageError.size', { mb: Math.round(maxBytes / 1024 / 1024) }));
        return;
      }
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: PostImage[] = [];
      for (const file of picked) {
        const stripped = await sanitizeAndDownscale(file);
        const ext = mimeToExt(stripped.type) ?? 'jpg';
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('community')
          .upload(path, stripped, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('community').getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, alt: '' });
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('imageError.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function updateAlt(index: number, alt: string) {
    onChange(value.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((img, idx) => {
            const src = safeImageSrc(img.url);
            return (
              <li
                key={idx}
                className="relative border border-[var(--color-border)] rounded-lg overflow-hidden bg-white"
              >
                <div className="relative aspect-square bg-[var(--color-neutral-100)]">
                  <Image
                    src={src}
                    alt={img.alt || `image ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized={isFallback(src)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    disabled={disabled}
                    aria-label={t('imageRemove')}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-40"
                  >
                    <CloseIcon />
                  </button>
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={disabled || idx === 0}
                      aria-label={t('imageMoveLeft')}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-40"
                    >
                      <ChevronIcon dir="left" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={disabled || idx === value.length - 1}
                      aria-label={t('imageMoveRight')}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-40"
                    >
                      <ChevronIcon dir="right" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateAlt(idx, e.target.value)}
                  placeholder={t('imageAltPlaceholder')}
                  maxLength={120}
                  disabled={disabled}
                  className="w-full px-2 py-1.5 text-xs border-t border-[var(--color-border)] bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:bg-[var(--color-neutral-50)]"
                />
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || atLimit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-[var(--color-border)] bg-white text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlusIcon />
          {uploading
            ? t('imageUploading')
            : atLimit
              ? t('imageMaxReached', { max })
              : t('imageAdd')}
        </button>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {value.length} / {max}
        </p>
      </div>

      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mimeToExt(mime: string): string | null {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}

/**
 * Re-encode the file through a canvas to (a) strip EXIF metadata and
 * (b) cap dimensions. Returns a Blob suitable for upload.
 */
async function sanitizeAndDownscale(file: File): Promise<Blob> {
  const MAX_EDGE = 2048;
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('decode failed'));
      i.src = imageUrl;
    });

    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d unavailable');
    ctx.drawImage(img, 0, 0, w, h);

    // Re-encode. PNG with transparency keeps PNG; everything else → JPEG @0.9.
    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), outType, 0.9),
    );
    if (!blob) throw new Error('canvas encode failed');
    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
