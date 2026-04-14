'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getNextSortOrder(parentId: string | null): Promise<number> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('categories') as any).select('sort_order');
  if (parentId) {
    q = q.eq('parent_id', parentId);
  } else {
    q = q.is('parent_id', null);
  }
  const { data } = await q.order('sort_order', { ascending: false }).limit(1);
  const last = data?.[0]?.sort_order as number | undefined;
  return last != null ? last + 1 : 0;
}

export async function createCategory(formData: FormData): Promise<void> {
  const name_ko = (formData.get('name_ko') as string).trim();
  const name_en = (formData.get('name_en') as string).trim();
  const name_ja = ((formData.get('name_ja') as string) ?? '').trim();
  const name_de = ((formData.get('name_de') as string) ?? '').trim();
  const slugRaw = ((formData.get('slug') as string) ?? '').trim();
  const slug = slugRaw || toSlug(name_en || name_ko);
  const parent_id = (formData.get('parent_id') as string) || null;
  const is_active = formData.get('is_active') === 'on';

  if (!name_ko || !name_en) {
    redirect(`/categories?error=${encodeURIComponent('한국어, 영어 이름은 필수입니다.')}`);
  }

  const sort_order = await getNextSortOrder(parent_id);

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('categories') as any).insert({
    name_ko,
    name_en,
    name_ja: name_ja || name_en,
    name_de: name_de || name_en,
    slug,
    parent_id,
    is_active,
    sort_order,
  });

  if (error) {
    redirect(`/categories?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/categories');
  redirect('/categories');
}

export async function updateCategory(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  const name_ko = (formData.get('name_ko') as string).trim();
  const name_en = (formData.get('name_en') as string).trim();
  const name_ja = ((formData.get('name_ja') as string) ?? '').trim();
  const name_de = ((formData.get('name_de') as string) ?? '').trim();
  const slugRaw = ((formData.get('slug') as string) ?? '').trim();
  const slug = slugRaw || toSlug(name_en || name_ko);
  const is_active = formData.get('is_active') === 'on';

  if (!name_ko || !name_en) {
    redirect(`/categories?error=${encodeURIComponent('한국어, 영어 이름은 필수입니다.')}`);
  }

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('categories') as any)
    .update({
      name_ko,
      name_en,
      name_ja: name_ja || name_en,
      name_de: name_de || name_en,
      slug,
      is_active,
    })
    .eq('id', id);

  if (error) {
    redirect(`/categories?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/categories');
  redirect('/categories');
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  const supabase = createServiceClient();

  // Block deletion if children exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: children } = await (supabase.from('categories') as any)
    .select('id')
    .eq('parent_id', id)
    .limit(1);

  if (children && children.length > 0) {
    redirect(`/categories?error=${encodeURIComponent('하위 카테고리가 있어 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제해주세요.')}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('categories') as any).delete().eq('id', id);

  if (error) {
    redirect(`/categories?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/categories');
  redirect('/categories');
}

export async function reorderCategory(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  const direction = formData.get('direction') as 'up' | 'down';
  const parent_id = (formData.get('parent_id') as string) || null;

  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('categories') as any).select('id, sort_order');
  if (parent_id) {
    q = q.eq('parent_id', parent_id);
  } else {
    q = q.is('parent_id', null);
  }
  const { data: siblings } = await q.order('sort_order', { ascending: true });

  if (!siblings || siblings.length < 2) {
    redirect('/categories');
  }

  type SiblingRow = { id: string; sort_order: number };
  const idx = (siblings as SiblingRow[]).findIndex((s) => s.id === id);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;

  if (idx < 0 || swapIdx < 0 || swapIdx >= siblings.length) {
    redirect('/categories');
  }

  const current = siblings[idx] as SiblingRow;
  const swapWith = siblings[swapIdx] as SiblingRow;

  const [r1, r2] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('categories') as any)
      .update({ sort_order: swapWith.sort_order })
      .eq('id', current.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('categories') as any)
      .update({ sort_order: current.sort_order })
      .eq('id', swapWith.id),
  ]);

  if (r1.error || r2.error) {
    redirect(`/categories?error=${encodeURIComponent('순서 변경 중 오류가 발생했습니다.')}`);
  }

  revalidatePath('/categories');
  redirect('/categories');
}
