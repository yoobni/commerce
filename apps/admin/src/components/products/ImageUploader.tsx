'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadProductImage } from '@/lib/actions/products';

// ─── Single Image Uploader ────────────────────────────────────────────────────

interface SingleImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function SingleImageUploader({ label, value, onChange }: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadProductImage(fd);
    setUploading(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      onChange(result.url);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      <div
        className="relative border-2 border-dashed border-[var(--color-border)] rounded-lg overflow-hidden"
        style={{ width: 160, height: 160 }}
      >
        {value ? (
          <Image
            src={value}
            alt="thumbnail"
            fill
            className="object-cover"
            sizes="160px"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-tertiary)] text-xs text-center px-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-8 h-8 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            이미지 업로드
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[var(--color-brand-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-1 text-xs text-[var(--color-error)] hover:underline"
        >
          제거
        </button>
      )}
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

// ─── Multi Image Uploader ─────────────────────────────────────────────────────

interface MultiImageUploaderProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function MultiImageUploader({
  label,
  values,
  onChange,
  max = 10,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    if (values.length + files.length > max) {
      setError(`최대 ${max}장까지 업로드 가능합니다.`);
      return;
    }
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadProductImage(fd);
      if ('error' in result) {
        setError(result.error);
        break;
      }
      uploaded.push(result.url);
    }
    setUploading(false);
    if (uploaded.length > 0) onChange([...values, ...uploaded]);
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        {label}
        <span className="ml-1 text-[var(--color-text-tertiary)] font-normal">
          ({values.length}/{max})
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {values.map((url, idx) => (
          <div
            key={url}
            className="relative rounded-lg overflow-hidden border border-[var(--color-border)]"
            style={{ width: 100, height: 100 }}
          >
            <Image
              src={url}
              alt={`image-${idx}`}
              fill
              className="object-cover"
              sizes="100px"
              unoptimized
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70"
              aria-label="이미지 제거"
            >
              ×
            </button>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="relative flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-tertiary)] text-xs hover:border-[var(--color-brand-accent)] transition-colors disabled:opacity-50"
            style={{ width: 100, height: 100 }}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[var(--color-brand-accent)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                추가
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
