'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import type { Category, Size, ProductStatus } from '@commerce/types';
import type { ProductDetail } from '@/lib/queries/products';
import type { SaveOptionInput } from '@/lib/actions/products';
import { uploadProductImage, saveProduct, deleteProduct } from '@/lib/actions/products';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InfoSection,
  Input,
  Label,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
} from '@/components/ui';

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
type MaterialKey = 'material_ko' | 'material_en' | 'material_ja' | 'material_de';
type PriceKey = 'base_price_krw' | 'base_price_usd' | 'base_price_jpy' | 'base_price_eur';

const LANG_KEYS: Record<Lang, { name: NameKey; desc: DescKey; material: MaterialKey }> = {
  ko: { name: 'name_ko', desc: 'description_ko', material: 'material_ko' },
  en: { name: 'name_en', desc: 'description_en', material: 'material_en' },
  ja: { name: 'name_ja', desc: 'description_ja', material: 'material_ja' },
  de: { name: 'name_de', desc: 'description_de', material: 'material_de' },
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
  material_ko: string;
  material_en: string;
  material_ja: string;
  material_de: string;
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
    material_ko: '',
    material_en: '',
    material_ja: '',
    material_de: '',
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
    material_ko: p.material_ko ?? '',
    material_en: p.material_en ?? '',
    material_ja: p.material_ja ?? '',
    material_de: p.material_de ?? '',
    care_instruction: p.care_instruction ?? '',
    weight_g: p.weight_g ?? 0,
    thumbnail_url: p.thumbnail_url,
    images: p.images ?? [],
    status: p.status,
    is_featured: p.is_featured,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  product: ProductDetail | null;
  categories: Category[];
  sizes: Size[];
}

export function ProductForm({ product, categories, sizes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [langTab, setLangTab] = useState<Lang>('ko');
  const [form, setForm] = useState<FormState>(() =>
    product ? productToForm(product) : makeDefault(),
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
      })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
      const msg = e instanceof Error ? e.message : '업로드 실패';
      setError(msg);
      toast.error(msg);
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
      const msg = e instanceof Error ? e.message : '업로드 실패';
      setError(msg);
      toast.error(msg);
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
        .filter((o): o is SaveOptionInput => o !== null),
    );
  }

  function handleDelete() {
    if (!product) return;
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        toast.success('상품을 삭제했습니다.');
        router.push('/products');
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '삭제 실패';
        setError(msg);
        toast.error(msg);
        setDeleteOpen(false);
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
          material_ko: form.material_ko || null,
          material_en: form.material_en || null,
          material_ja: form.material_ja || null,
          material_de: form.material_de || null,
          care_instruction: form.care_instruction || null,
          weight_g: form.weight_g || null,
        };
        const id = await saveProduct(product?.id ?? null, input, options);
        toast.success(product ? '상품을 수정했습니다.' : '상품을 등록했습니다.');
        router.push(`/products/${id}`);
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '저장 실패';
        setError(msg);
        toast.error(msg);
      }
    });
  }

  const visibleOptions = options.filter((o) => !o.toDelete);
  const { name: nameKey, desc: descKey, material: materialKey } = LANG_KEYS[langTab];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 상품 목록
          </Link>
        </Button>
      </div>

      <PageHeader
        title={product ? '상품 수정' : '상품 등록'}
        description={product ? product.name_ko : '새 상품의 기본 정보와 옵션을 입력합니다.'}
        actions={
          <>
            {product && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                disabled={isPending}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                삭제
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isPending} size="sm">
              {isPending ? '저장 중…' : '저장'}
            </Button>
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Basic info */}
        <InfoSection title="기본 정보">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>카테고리 *</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => patch('category_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_ko}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">슬러그 *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => patch('slug', e.target.value)}
                placeholder="product-slug"
                className="font-mono"
              />
            </div>
          </div>
        </InfoSection>

        {/* Multilingual content */}
        <InfoSection
          title="상품명 / 설명"
          actions={
            <Tabs value={langTab} onValueChange={(v) => setLangTab(v as Lang)}>
              <TabsList className="h-8">
                {LANG_TABS.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="h-6 px-2.5 text-[11px]">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${langTab}`}>
                상품명 ({langTab.toUpperCase()}){langTab === 'ko' && ' *'}
              </Label>
              <Input
                id={`name-${langTab}`}
                value={form[nameKey]}
                onChange={(e) => patch(nameKey, e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`desc-${langTab}`}>설명 ({langTab.toUpperCase()})</Label>
              <Textarea
                id={`desc-${langTab}`}
                value={form[descKey]}
                onChange={(e) => patch(descKey, e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </InfoSection>

        {/* Pricing */}
        <InfoSection title="기본 가격">
          <div className="grid grid-cols-4 gap-4">
            {PRICE_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  value={form[key]}
                  onChange={(e) => patch(key, Number(e.target.value))}
                  min={0}
                  step={0.01}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Images */}
        <InfoSection title="이미지">
          <div className="grid grid-cols-2 gap-6">
            {/* Thumbnail */}
            <div>
              <Label className="mb-2 block">썸네일 *</Label>
              <div className="flex items-start gap-3">
                {form.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.thumbnail_url}
                    alt="thumbnail"
                    className="h-20 w-20 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-input bg-muted text-[11px] text-muted-foreground">
                    없음
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block cursor-pointer">
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
                    <span className="inline-flex h-8 items-center rounded-md border border-input bg-card px-3 text-[12px] hover:bg-secondary">
                      {thumbLoading ? '업로드 중…' : '파일 선택'}
                    </span>
                  </label>
                  {form.thumbnail_url && (
                    <button
                      type="button"
                      onClick={() => patch('thumbnail_url', '')}
                      className="block text-[11px] text-destructive hover:underline"
                    >
                      제거
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <Label className="mb-2 block">갤러리</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`gallery-${i}`}
                      className="h-16 w-16 rounded-md border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          'images',
                          form.images.filter((_, j) => j !== i),
                        )
                      }
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] leading-none text-white"
                      aria-label="이미지 제거"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted text-lg text-muted-foreground hover:bg-secondary">
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
        </InfoSection>

        {/* Details */}
        <InfoSection title="상세 정보">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`material-${langTab}`}>소재 ({langTab.toUpperCase()})</Label>
              <Input
                id={`material-${langTab}`}
                value={form[materialKey]}
                onChange={(e) => patch(materialKey, e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="care">세탁 방법</Label>
              <Input
                id="care"
                value={form.care_instruction}
                onChange={(e) => patch('care_instruction', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">무게 (g)</Label>
              <Input
                id="weight"
                type="number"
                value={form.weight_g}
                onChange={(e) => patch('weight_g', Number(e.target.value))}
                min={0}
                className="font-mono"
              />
            </div>
          </div>
        </InfoSection>

        {/* Status */}
        <InfoSection title="상태 설정">
          <div className="flex items-end gap-6">
            <div className="space-y-1.5">
              <Label>판매 상태</Label>
              <Select
                value={form.status}
                onValueChange={(v) => patch('status', v as ProductStatus)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-2">
              <Checkbox
                checked={form.is_featured}
                onCheckedChange={(c) => patch('is_featured', c === true)}
              />
              <span className="text-[13px] text-foreground">추천 상품으로 표시</span>
            </label>
          </div>
        </InfoSection>

        {/* Options */}
        <InfoSection
          title={
            <span>
              옵션 / 재고
              {visibleOptions.length > 0 && (
                <Badge variant="muted" className="ml-2">
                  {visibleOptions.length}개
                </Badge>
              )}
            </span>
          }
          actions={
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-1 h-3.5 w-3.5" /> 옵션 추가
            </Button>
          }
        >
          {visibleOptions.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">옵션이 없습니다. 추가해주세요.</p>
          ) : (
            <div className="space-y-4">
              {options.map((opt, idx) =>
                opt.toDelete ? null : (
                  <div
                    key={idx}
                    className="space-y-3 rounded-md border border-border bg-muted/30 p-4"
                  >
                    {/* Row 1: size, color, color_hex, sku, stock, active/delete */}
                    <div className="grid grid-cols-6 items-end gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px]">사이즈</Label>
                        <Select
                          value={opt.size_id}
                          onValueChange={(v) => patchOption(idx, { size_id: v })}
                        >
                          <SelectTrigger className="h-8 text-[12px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sizes.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">색상</Label>
                        <Input
                          value={opt.color}
                          onChange={(e) => patchOption(idx, { color: e.target.value })}
                          placeholder="Black"
                          className="h-8 text-[12px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">색상 코드</Label>
                        <Input
                          value={opt.color_hex ?? ''}
                          onChange={(e) =>
                            patchOption(idx, { color_hex: e.target.value || null })
                          }
                          placeholder="#000000"
                          className="h-8 font-mono text-[12px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">SKU</Label>
                        <Input
                          value={opt.sku}
                          onChange={(e) => patchOption(idx, { sku: e.target.value })}
                          className="h-8 font-mono text-[12px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">재고</Label>
                        <Input
                          type="number"
                          value={opt.stock}
                          onChange={(e) =>
                            patchOption(idx, { stock: Number(e.target.value) })
                          }
                          min={0}
                          className="h-8 font-mono text-[12px]"
                        />
                      </div>
                      <div className="flex items-center gap-3 pb-1.5">
                        <label className="flex cursor-pointer items-center gap-1">
                          <Checkbox
                            checked={opt.is_active}
                            onCheckedChange={(c) =>
                              patchOption(idx, { is_active: c === true })
                            }
                          />
                          <span className="text-[11px] text-foreground">활성</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="text-[11px] text-destructive hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* Row 2: additional prices + low_stock_threshold */}
                    <div className="grid grid-cols-5 gap-3">
                      {OPT_PRICE_FIELDS.map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-[11px]">{label}</Label>
                          <Input
                            type="number"
                            value={opt[key]}
                            onChange={(e) =>
                              patchOption(idx, {
                                [key]: Number(e.target.value),
                              } as Partial<SaveOptionInput>)
                            }
                            step={0.01}
                            className="h-8 font-mono text-[12px]"
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <Label className="text-[11px]">부족 알림 기준</Label>
                        <Input
                          type="number"
                          value={opt.low_stock_threshold}
                          onChange={(e) =>
                            patchOption(idx, {
                              low_stock_threshold: Number(e.target.value),
                            })
                          }
                          min={0}
                          className="h-8 font-mono text-[12px]"
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </InfoSection>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => !isPending && setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{product?.name_ko}</strong>을(를) 삭제합니다. 이
              작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? '삭제 중…' : '삭제 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
