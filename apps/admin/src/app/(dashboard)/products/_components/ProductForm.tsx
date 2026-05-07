'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Size, ProductStatus } from '@commerce/types';
import type { ProductDetail } from '@/lib/queries/products';
import type { SaveOptionInput } from '@/lib/actions/products';
import { uploadProductImage, saveProduct, deleteProduct } from '@/lib/actions/products';

// ─── Types ────────────────────────────────────────────────────────────────────

const LANG_TABS = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
  { key: 'de', label: 'Deutsch' },
] as const;
type Lang = (typeof LANG_TABS)[number]['key'];

type NameKey = 'name_ko' | 'name_en' | 'name_ja' | 'name_de';
type DescKey = 'description_ko' | 'description_en' | 'description_ja' | 'description_de';
type PriceKey = 'base_price_krw' | 'base_price_usd' | 'base_price_jpy' | 'base_price_eur';

const LANG_KEYS: Record<Lang, { name: NameKey; desc: DescKey }> = {
  ko: { name: 'name_ko', desc: 'description_ko' },
  en: { name: 'name_en', desc: 'description_en' },
  ja: { name: 'name_ja', desc: 'description_ja' },
  de: { name: 'name_de', desc: 'description_de' },
};

const PRICE_FIELDS: Array<{ key: PriceKey; label: string }> = [
  { key: 'base_price_krw', label: 'KRW (₩)' },
  { key: 'base_price_usd', label: 'USD ($)' },
  { key: 'base_price_jpy', label: 'JPY (¥)' },
  { key: 'base_price_eur', label: 'EUR (€)' },
];

type OptPriceKey =
  | 'additional_price_krw'
  | 'additional_price_usd'
  | 'additional_price_jpy'
  | 'additional_price_eur';

const OPT_PRICE_FIELDS: Array<{ key: OptPriceKey; label: string }> = [
  { key: 'additional_price_krw', label: '+KRW' },
  { key: 'additional_price_usd', label: '+USD' },
  { key: 'additional_price_jpy', label: '+JPY' },
  { key: 'additional_price_eur', label: '+EUR' },
];

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'DRAFT', label: '임시저장' },
  { value: 'ACTIVE', label: '판매중' },
  { value: 'SOLD_OUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김' },
  { value: 'DISCONTINUED', label: '단종' },
];

interface FormState {
  category_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_de: string;
  description_ko: string;
  description_en: string;
  description_ja: string;
  description_de: string;
  base_price_krw: number;
  base_price_usd: number;
  base_price_jpy: number;
  base_price_eur: number;
  material: string;
  care_instruction: string;
  weight_g: number;
  thumbnail_url: string;
  images: string[];
  status: ProductStatus;
  is_featured: boolean;
}

function makeDefault(): FormState {
  return {
    category_id: '',
    slug: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    name_de: '',
    description_ko: '',
    description_en: '',
    description_ja: '',
    description_de: '',
    base_price_krw: 0,
    base_price_usd: 0,
    base_price_jpy: 0,
    base_price_eur: 0,
    material: '',
    care_instruction: '',
    weight_g: 0,
    thumbnail_url: '',
    images: [],
    status: 'DRAFT',
    is_featured: false,
  };
}

function productToForm(p: ProductDetail): FormState {
  return {
    category_id: p.category_id,
    slug: p.slug,
    name_ko: p.name_ko,
    name_en: p.name_en,
    name_ja: p.name_ja,
    name_de: p.name_de,
    description_ko: p.description_ko,
    description_en: p.description_en,
    description_ja: p.description_ja,
    description_de: p.description_de,
    base_price_krw: p.base_price_krw,
    base_price_usd: p.base_price_usd,
    base_price_jpy: p.base_price_jpy,
    base_price_eur: p.base_price_eur,
    material: p.material ?? '',
    care_instruction: p.care_instruction ?? '',
    weight_g: p.weight_g ?? 0,
    thumbnail_url: p.thumbnail_url,
    images: p.images ?? [],
    status: p.status,
    is_featured: p.is_featured,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  product: ProductDetail | null;
  categories: Category[];
  sizes: Size[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ product, categories, sizes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [langTab, setLangTab] = useState<Lang>('ko');
  const [form, setForm] = useState<FormState>(() =>
    product ? productToForm(product) : makeDefault()
  );
  const [options, setOptions] = useState<SaveOptionInput[]>(
    () =>
      product?.options.map((o) => ({
        id: o.id,
        size_id: o.size_id,
        color: o.color,
        color_hex: o.color_hex,
        sku: o.sku,
        additional_price_krw: o.additional_price_krw,
        additional_price_usd: o.additional_price_usd,
        additional_price_jpy: o.additional_price_jpy,
        additional_price_eur: o.additional_price_eur,
        stock: o.stock,
        low_stock_threshold: o.low_stock_threshold,
        is_active: o.is_active,
      })) ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadThumb(file: File) {
    setThumbLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const url = await uploadProductImage(fd);
      patch('thumbnail_url', url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setThumbLoading(false);
    }
  }

  async function uploadGallery(file: File) {
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const url = await uploadProductImage(fd);
      patch('images', [...form.images, url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setImgLoading(false);
    }
  }

  function addOption() {
    setOptions((prev) => [
      ...prev,
      {
        size_id: sizes[0]?.id ?? '',
        color: '',
        color_hex: null,
        sku: '',
        additional_price_krw: 0,
        additional_price_usd: 0,
        additional_price_jpy: 0,
        additional_price_eur: 0,
        stock: 0,
        low_stock_threshold: 5,
        is_active: true,
      },
    ]);
  }

  function patchOption(idx: number, partial: Partial<SaveOptionInput>) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...partial } : o)));
  }

  function removeOption(idx: number) {
    setOptions((prev) =>
      prev
        .map((o, i) => {
          if (i !== idx) return o;
          return o.id ? { ...o, toDelete: true } : null;
        })
        .filter((o): o is SaveOptionInput => o !== null)
    );
  }

  function handleDelete() {
    if (!product) return;
    if (!window.confirm('상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        router.push('/products');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : '삭제 실패');
      }
    });
  }

  function handleSubmit() {
    setError(null);
    if (!form.category_id) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (!form.slug) {
      setError('슬러그를 입력해주세요.');
      return;
    }
    if (!form.name_ko) {
      setError('상품명(한국어)을 입력해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const input = {
          ...form,
          material: form.material || null,
          care_instruction: form.care_instruction || null,
          weight_g: form.weight_g || null,
        };
        const id = await saveProduct(product?.id ?? null, input, options);
        router.push(`/products/${id}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : '저장 실패');
      }
    });
  }

  const visibleOptions = options.filter((o) => !o.toDelete);
  const { name: nameKey, desc: descKey } = LANG_KEYS[langTab];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            ← 상품 목록
          </button>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {product ? '상품 수정' : '상품 등록'}
          </h1>
        </div>
        <div className="flex gap-2">
          {product && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 text-sm font-medium bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic info */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-medium text-[var(--color-text-primary)] mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                카테고리 *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => patch('category_id', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ko}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                슬러그 *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => patch('slug', e.target.value)}
                placeholder="product-slug"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Multilingual content */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-medium text-[var(--color-text-primary)]">상품명 / 설명</h2>
            <div className="ml-auto flex gap-1 p-1 bg-gray-100 rounded-lg">
              {LANG_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLangTab(tab.key)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    langTab === tab.key
                      ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                상품명 ({langTab.toUpperCase()}){langTab === 'ko' && ' *'}
              </label>
              <input
                type="text"
                value={form[nameKey]}
                onChange={(e) => patch(nameKey, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                설명 ({langTab.toUpperCase()})
              </label>
              <textarea
                value={form[descKey]}
                onChange={(e) => patch(descKey, e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-medium text-[var(--color-text-primary)] mb-4">기본 가격</h2>
          <div className="grid grid-cols-4 gap-4">
            {PRICE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => patch(key, Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Images */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-medium text-[var(--color-text-primary)] mb-4">이미지</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                썸네일 *
              </label>
              <div className="flex gap-3 items-start">
                {form.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.thumbnail_url}
                    alt="thumbnail"
                    className="w-20 h-20 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    없음
                  </div>
                )}
                <div className="space-y-2">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadThumb(file);
                        e.target.value = '';
                      }}
                    />
                    <span className="px-3 py-1.5 text-xs border border-[var(--color-border)] rounded-lg hover:bg-gray-50 inline-block">
                      {thumbLoading ? '업로드 중...' : '파일 선택'}
                    </span>
                  </label>
                  {form.thumbnail_url && (
                    <button
                      type="button"
                      onClick={() => patch('thumbnail_url', '')}
                      className="text-xs text-red-500 hover:text-red-700 block"
                    >
                      제거
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                갤러리
              </label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`gallery-${i}`}
                      className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          'images',
                          form.images.filter((_, j) => j !== i)
                        )
                      }
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer w-16 h-16 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xl hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadGallery(file);
                      e.target.value = '';
                    }}
                  />
                  {imgLoading ? '···' : '+'}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-medium text-[var(--color-text-primary)] mb-4">상세 정보</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                소재
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => patch('material', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                세탁 방법
              </label>
              <input
                type="text"
                value={form.care_instruction}
                onChange={(e) => patch('care_instruction', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                무게 (g)
              </label>
              <input
                type="number"
                value={form.weight_g}
                onChange={(e) => patch('weight_g', Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-medium text-[var(--color-text-primary)] mb-4">상태 설정</h2>
          <div className="flex gap-6 items-center">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                판매 상태
              </label>
              <select
                value={form.status}
                onChange={(e) => patch('status', e.target.value as ProductStatus)}
                className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => patch('is_featured', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">추천 상품으로 표시</span>
            </label>
          </div>
        </section>

        {/* Options */}
        <section className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[var(--color-text-primary)]">
              옵션 / 재고
              {visibleOptions.length > 0 && (
                <span className="ml-2 text-xs font-normal text-[var(--color-text-secondary)]">
                  ({visibleOptions.length}개)
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={addOption}
              className="px-3 py-1.5 text-xs border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
            >
              + 옵션 추가
            </button>
          </div>

          {visibleOptions.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)]">
              옵션이 없습니다. 추가해주세요.
            </p>
          ) : (
            <div className="space-y-4">
              {options.map((opt, idx) =>
                opt.toDelete ? null : (
                  <div
                    key={idx}
                    className="border border-[var(--color-border)] rounded-lg p-4 space-y-3"
                  >
                    {/* Row 1: size, color, sku, stock, active, delete */}
                    <div className="grid grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          사이즈
                        </label>
                        <select
                          value={opt.size_id}
                          onChange={(e) => patchOption(idx, { size_id: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded focus:outline-none"
                        >
                          {sizes.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          색상
                        </label>
                        <input
                          type="text"
                          value={opt.color}
                          onChange={(e) => patchOption(idx, { color: e.target.value })}
                          placeholder="Black"
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          색상코드
                        </label>
                        <input
                          type="text"
                          value={opt.color_hex ?? ''}
                          onChange={(e) => patchOption(idx, { color_hex: e.target.value || null })}
                          placeholder="#000000"
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={opt.sku}
                          onChange={(e) => patchOption(idx, { sku: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          재고
                        </label>
                        <input
                          type="number"
                          value={opt.stock}
                          onChange={(e) => patchOption(idx, { stock: Number(e.target.value) })}
                          min="0"
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 pb-1">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={opt.is_active}
                            onChange={(e) => patchOption(idx, { is_active: e.target.checked })}
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-xs text-[var(--color-text-secondary)]">활성</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* Row 2: additional prices + low_stock_threshold */}
                    <div className="grid grid-cols-5 gap-3">
                      {OPT_PRICE_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            value={opt[key]}
                            onChange={(e) =>
                              patchOption(idx, {
                                [key]: Number(e.target.value),
                              } as Partial<SaveOptionInput>)
                            }
                            step="0.01"
                            className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded focus:outline-none"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                          부족 알림 기준
                        </label>
                        <input
                          type="number"
                          value={opt.low_stock_threshold}
                          onChange={(e) =>
                            patchOption(idx, { low_stock_threshold: Number(e.target.value) })
                          }
                          min="0"
                          className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
