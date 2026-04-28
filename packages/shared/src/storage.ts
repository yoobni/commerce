import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Bucket Types & Constraints ───────────────────────────────────────────────

export type StorageBucket = 'products' | 'reviews' | 'avatars' | 'posts';

const FILE_SIZE_LIMITS: Record<StorageBucket, number> = {
  products: 10 * 1024 * 1024, // 10 MB
  reviews: 5 * 1024 * 1024, //  5 MB
  avatars: 2 * 1024 * 1024, //  2 MB
  posts: 5 * 1024 * 1024, //  5 MB
};

const ALLOWED_MIME_TYPES: Record<StorageBucket, readonly string[]> = {
  products: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  reviews: ['image/jpeg', 'image/png', 'image/webp'],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  posts: ['image/jpeg', 'image/png', 'image/webp'],
};

// ─── Error ────────────────────────────────────────────────────────────────────

export type StorageErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME_TYPE'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED';

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: StorageErrorCode
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// ─── Internal Validation ──────────────────────────────────────────────────────

function validateFile(bucket: StorageBucket, file: File): void {
  const limitBytes = FILE_SIZE_LIMITS[bucket];
  if (file.size > limitBytes) {
    throw new StorageError(
      `File size ${file.size} exceeds ${limitBytes / 1024 / 1024}MB limit for "${bucket}" bucket`,
      'FILE_TOO_LARGE'
    );
  }
  if (!ALLOWED_MIME_TYPES[bucket].includes(file.type)) {
    throw new StorageError(
      `MIME type "${file.type}" is not allowed in "${bucket}" bucket. Allowed: ${ALLOWED_MIME_TYPES[bucket].join(', ')}`,
      'INVALID_MIME_TYPE'
    );
  }
}

// ─── Upload Utilities ─────────────────────────────────────────────────────────

/**
 * Upload a product image.
 * Requires service_role client (admin only — RLS blocks authenticated writes).
 * Path: products/{productId}/{filename}
 * Returns the storage path (not the public URL).
 */
export async function uploadProductImage(
  client: SupabaseClient,
  file: File,
  productId: string,
  filename: string
): Promise<string> {
  validateFile('products', file);
  const path = `${productId}/${filename}`;
  const { error } = await client.storage
    .from('products')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new StorageError(error.message, 'UPLOAD_FAILED');
  return path;
}

/**
 * Upload a review image.
 * Requires authenticated client. userId must match auth.uid().
 * Path: reviews/{userId}/{reviewId}/{filename}
 * Returns the storage path.
 */
export async function uploadReviewImage(
  client: SupabaseClient,
  file: File,
  userId: string,
  reviewId: string,
  filename: string
): Promise<string> {
  validateFile('reviews', file);
  const path = `${userId}/${reviewId}/${filename}`;
  const { error } = await client.storage
    .from('reviews')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new StorageError(error.message, 'UPLOAD_FAILED');
  return path;
}

/**
 * Upload a community post image.
 * Requires authenticated client. userId must match auth.uid().
 * Path: posts/{userId}/{postId}/{filename}
 * Returns the storage path.
 */
export async function uploadPostImage(
  client: SupabaseClient,
  file: File,
  userId: string,
  postId: string,
  filename: string
): Promise<string> {
  validateFile('posts', file);
  const path = `${userId}/${postId}/${filename}`;
  const { error } = await client.storage
    .from('posts')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new StorageError(error.message, 'UPLOAD_FAILED');
  return path;
}

/**
 * Upload or replace a user avatar.
 * Requires authenticated client. userId must match auth.uid().
 * Path: avatars/{userId}/{filename}
 * Returns the storage path.
 */
export async function uploadAvatar(
  client: SupabaseClient,
  file: File,
  userId: string,
  filename: string
): Promise<string> {
  validateFile('avatars', file);
  const path = `${userId}/${filename}`;
  const { error } = await client.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new StorageError(error.message, 'UPLOAD_FAILED');
  return path;
}

// ─── Delete / URL Utilities ───────────────────────────────────────────────────

/**
 * Delete one or more objects from a storage bucket.
 */
export async function deleteStorageObjects(
  client: SupabaseClient,
  bucket: StorageBucket,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await client.storage.from(bucket).remove(paths);
  if (error) throw new StorageError(error.message, 'DELETE_FAILED');
}

/**
 * Get the public URL for a storage object.
 * All three buckets are public — no auth required.
 */
export function getStoragePublicUrl(
  client: SupabaseClient,
  bucket: StorageBucket,
  path: string
): string {
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
