'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Size, ProductStatus } from '@commerce/types';
import type { OptionInput, ProductInput } from '@/lib/actions/products';
import { createProduct, updateProduct } from '@/lib/actions/products';
import { SingleImageUploader, MultiImageUploader } from './ImageUploader';
import { ProductOptionEditor } from './ProductOptionEditor';
import { cn } from '@/lib/cn';
import type { AdminProductDetail } from '@/lib/queries/products';

// ─── Types ─────────────────────────────────────────────────────────────────────

type MainTab = 'basic' | 'pricing' | 'media' | 'options';
type LangTab = 'ko' | 'en' | 'ja' | 'de';

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'basic', label: '기본 정보' },
  { key: 'pricing', label: '가격' },
  { key: 'media', label: '미디어' },
  { key: 'options', label: '옵션/재고' },
];

const LANG_TABS: { key: LangTab; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
  { key: 'de', label: 'Deutsch' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'DRAFT', label: 'DRAFT — 임시저장' },
  { value: 'ACTIVE', label: 'ACTIVE — 판매중' },
  { value: 'SOLD_OUT', label: 'SOLD_OUT — 품절' },
  { value: 'HIDDEN', label: 'HIDDEN — 숨김' },
  { value: 'DISCONTINUED', label: 'DISCONTINUED — 판매종료' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  adminId: string;
  categories: Category[];
  sizes: Size[];
  initialData?: AdminProductDetail;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toOptionInputs(
  options: AdminProductDetail['options']
): OptionInput[] {
  return options.map((o) => ({
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
    _delete: false,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({
  adminId,
  categories,
  sizes,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('basic');
  const [activeLang, setActiveLang] = useState<LangTab>('ko');

  const isEdit = !!initialData;

  // ── Form state ──────────────────────────────────────────────────────────────

  const [category_id, setCategoryId] = useState(initialData?.category_id ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [status, setStatus] = useState<ProductStatus>(initialData?.status ?? 'DRAFT');
  const [is_featured, setIsFeatured] = useState(initialData?.is_featured ?? false);

  const [name_ko, setNameKo] = useState(initialData?.name_ko ?? '');
  const [name_en, setNameEn] = useState(initialData?.name_en ?? '');
  const [name_ja, setNameJa] = useState(initialData?.name_ja ?? '');
  const [name_de, setNameDe] = useState(initialData?.name_de ?? '');

  const [description_ko, setDescKo] = useState(initialData?.description_ko ?? '');
  const [description_en, setDescEn] = useState(initialData?.description_en ?? '');
  const [description_ja, setDescJa] = useState(initialData?.description_ja ?? '');
  const [description_de, setDescDe] = useState(initialData?.description_de ?? '');

  const [weight_g, setWeightG] = useState<string>(
    initialData?.weight_g != null ? String(initialData.weight_g) : ''
  );
  const [material, setMaterial] = useState(initialData?.material ?? '');
  const [care_instruction, setCareInstruction] = useState(
    initialData?.care_instruction ?? ''
  );

  const [base_price_krw, setPriceKrw] = useState(
    String(initialData?.base_price_krw ?? 0)
  );
  const [base_price_usd, setPriceUsd] = useState(
    String(initialData?.base_price_usd ?? 0)
  );
  const [base_price_jpy, setPriceJpy] = useState(
    String(initialData?.base_price_jpy ?? 0)
  );
  const [base_price_eur, setPriceEur] = useState(
    String(initialData?.base_price_eur ?? 0)
  );

  const [thumbnail_url, setThumbnailUrl] = useState(initialData?.thumbnail_url ?? '');
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);

  const [options, setOptions] = useState<OptionInput[]>(
    initialData?.options ? toOptionInputs(initialData.options) : []
  );

  // ── Submit ──────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category_id) { setError('카테고리를 선택해주세요.'); setActiveTab('basic'); return; }
    if (!name_ko.trim()) { setError('한국어 상품명을 입력해주세요.'); setActiveTab('basic'); setActiveLang('ko'); return; }
    if (!name_en.trim()) { setError('영어 상품명을 입력해주세요.'); setActiveTab('basic'); setActiveLang('en'); return; }
    if (!slug.trim()) { setError('슬러그를 입력해주세요.'); setActiveTab('basic'); return; }
    if (!thumbnail_url) { setError('대표 이미지를 업로드해주세요.'); setActiveTab('media'); return; }

    const activeOptions = options.filter((o) => !o._delete);
    for (const o of activeOptions) {
      if (!o.size_id || !o.sku || !o.color) {
        setError('옵션의 사이즈, SKU, 색상명은 필수입니다.');
        setActiveTab('options');
        return;
      }
    }

    const input: ProductInput = {
      category_id,
      slug: slug.trim(),
      name_ko: name_ko.trim(),
      name_en: name_en.trim(),
      name_ja: name_ja.trim(),
      name_de: name_de.trim(),
      description_ko: description_ko.trim(),
      description_en: description_en.trim(),
      description_ja: description_ja.trim(),
      description_de: description_de.trim(),
      base_price_krw: Number(base_price_krw) || 0,
      base_price_usd: Number(base_price_usd) || 0,
      base_price_jpy: Number(base_price_jpy) || 0,
      base_price_eur: Number(base_price_eur) || 0,
      weight_g: weight_g ? Number(weight_g) : null,
      material: material.trim() || null,
      care_instruction: care_instruction.trim() || null,
      thumbnail_url,
      images,
      status,
      is_featured,
      options,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(initialData.id, adminId, input)
        : await createProduct(adminId, input);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/products');
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Main tabs */}
      <div className="border-b border-[var(--color-border)]">
        <nav className="flex gap-0" aria-label="폼 섹션">
          {MAIN_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === key
                  ? 'border-[var(--color-brand-accent)] text-[var(--color-brand-accent)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── 기본 정보 ─────────────────────────────────────────────────────────── */}
      {activeTab === 'basic' && (
        <div className="space-y-5">
          {/* Category + Status + Featured */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                카테고리 <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                value={category_id}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white"
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ko}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm py-2">
                <input
                  type="checkbox"
                  checked={is_featured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-brand-accent)]"
                />
                <span className="font-medium text-[var(--color-text-primary)]">
                  추천 상품
                </span>
              </label>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              슬러그 <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                placeholder="product-slug"
                className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg font-mono"
                required
              />
              {name_en && (
                <button
                  type="button"
                  onClick={() => setSlug(slugify(name_en))}
                  className="px-3 py-2 text-xs border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-50"
                >
                  자동생성
                </button>
              )}
            </div>
          </div>

          {/* Multilingual name + description */}
          <div>
            <div className="flex border-b border-[var(--color-border)] mb-4">
              {LANG_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveLang(key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors',
                    activeLang === key
                      ? 'border-[var(--color-brand-primary)] text-[var(--color-text-primary)]'
                      : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeLang === 'ko' && (
              <LangFields
                nameValue={name_ko} onNameChange={setNameKo}
                descValue={description_ko} onDescChange={setDescKo}
                required
              />
            )}
            {activeLang === 'en' && (
              <LangFields
                nameValue={name_en} onNameChange={setNameEn}
                descValue={description_en} onDescChange={setDescEn}
                required
              />
            )}
            {activeLang === 'ja' && (
              <LangFields
                nameValue={name_ja} onNameChange={setNameJa}
                descValue={description_ja} onDescChange={setDescJa}
              />
            )}
            {activeLang === 'de' && (
              <LangFields
                nameValue={name_de} onNameChange={setNameDe}
                descValue={description_de} onDescChange={setDescDe}
              />
            )}
          </div>

          {/* Physical attributes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                무게 (g)
              </label>
              <input
                type="number"
                min={0}
                value={weight_g}
                onChange={(e) => setWeightG(e.target.value)}
                placeholder="예: 250"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                소재
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="예: 100% Cotton"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                세탁 방법
              </label>
              <input
                type="text"
                value={care_instruction}
                onChange={(e) => setCareInstruction(e.target.value)}
                placeholder="예: Hand wash only"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 가격 ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            기준 가격 (옵션별 추가 가격은 옵션/재고 탭에서 설정)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { label: 'KRW (₩)', key: 'krw', value: base_price_krw, onChange: setPriceKrw, step: '1', placeholder: '0' },
                { label: 'USD ($)', key: 'usd', value: base_price_usd, onChange: setPriceUsd, step: '0.01', placeholder: '0.00' },
                { label: 'JPY (¥)', key: 'jpy', value: base_price_jpy, onChange: setPriceJpy, step: '1', placeholder: '0' },
                { label: 'EUR (€)', key: 'eur', value: base_price_eur, onChange: setPriceEur, step: '0.01', placeholder: '0.00' },
              ] as const
            ).map(({ label, key, value, onChange, step, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  {label}
                </label>
                <input
                  type="number"
                  min={0}
                  step={step}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 미디어 ────────────────────────────────────────────────────────────── */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <SingleImageUploader
            label="대표 이미지 *"
            value={thumbnail_url}
            onChange={setThumbnailUrl}
          />
          <MultiImageUploader
            label="추가 이미지"
            values={images}
            onChange={setImages}
            max={10}
          />
        </div>
      )}

      {/* ─── 옵션/재고 ─────────────────────────────────────────────────────────── */}
      {activeTab === 'options' && (
        <ProductOptionEditor
          sizes={sizes}
          options={options}
          onChange={setOptions}
        />
      )}

      {/* ─── Actions ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-brand-primary)' }}
        >
          {isPending ? '저장 중...' : isEdit ? '수정 완료' : '상품 등록'}
        </button>
      </div>
    </form>
  );
}

// ─── Sub-component: LangFields ────────────────────────────────────────────────

interface LangFieldsProps {
  nameValue: string;
  onNameChange: (v: string) => void;
  descValue: string;
  onDescChange: (v: string) => void;
  required?: boolean;
}

function LangFields({
  nameValue,
  onNameChange,
  descValue,
  onDescChange,
  required = false,
}: LangFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          상품명{required && <span className="ml-1 text-[var(--color-error)]">*</span>}
        </label>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg"
          placeholder="상품명 입력"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          상품 설명
        </label>
        <textarea
          value={descValue}
          onChange={(e) => onDescChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-y"
          placeholder="상품 설명 입력"
        />
      </div>
    </div>
  );
}
