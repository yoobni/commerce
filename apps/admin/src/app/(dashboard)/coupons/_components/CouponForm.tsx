'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import type { Coupon, CouponType, Currency } from '@commerce/types';
import type { SaveCouponInput } from '@/lib/actions/coupons';
import { saveCoupon } from '@/lib/actions/coupons';
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  toast,
} from '@/components/ui';
import { cn } from '@/lib/cn';

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

function fromDatetimeLocal(val: string): string {
  if (!val) return '';
  return new Date(val).toISOString();
}

function makeDefault(): SaveCouponInput {
  const now = new Date();
  const starts = new Date(now);
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  return {
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    name_de: '',
    type: 'FIXED_AMOUNT',
    discount_value: 0,
    max_discount_amount: null,
    min_order_amount: null,
    currency: 'KRW',
    max_issuance_count: null,
    max_use_per_user: 1,
    is_combinable: false,
    starts_at: starts.toISOString(),
    expires_at: expires.toISOString(),
  };
}

function couponToInput(c: Coupon): SaveCouponInput {
  return {
    code: c.code,
    name_ko: c.name_ko,
    name_en: c.name_en,
    name_ja: c.name_ja,
    name_de: c.name_de,
    type: c.type,
    discount_value: c.discount_value,
    max_discount_amount: c.max_discount_amount,
    min_order_amount: c.min_order_amount,
    currency: c.currency,
    max_issuance_count: c.max_issuance_count,
    max_use_per_user: c.max_use_per_user,
    is_combinable: c.is_combinable,
    starts_at: c.starts_at,
    expires_at: c.expires_at,
  };
}

const CURRENCY_OPTIONS: Currency[] = ['KRW', 'USD', 'JPY', 'EUR'];

const NAME_FIELDS = [
  { key: 'name_ko' as const, label: '이름 (KO) *' },
  { key: 'name_en' as const, label: '이름 (EN)' },
  { key: 'name_ja' as const, label: '이름 (JA)' },
  { key: 'name_de' as const, label: '이름 (DE)' },
];

interface Props {
  coupon: Coupon | null;
}

export function CouponForm({ coupon }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SaveCouponInput>(() =>
    coupon ? couponToInput(coupon) : makeDefault(),
  );
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof SaveCouponInput>(key: K, value: SaveCouponInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: CouponType) {
    setForm((prev) => ({
      ...prev,
      type,
      currency: type === 'FIXED_AMOUNT' ? (prev.currency ?? 'KRW') : null,
      max_discount_amount: type === 'FIXED_AMOUNT' ? null : prev.max_discount_amount,
    }));
  }

  function handleSubmit() {
    setError(null);

    if (!form.code.trim()) {
      setError('쿠폰 코드를 입력해주세요.');
      return;
    }
    if (!form.name_ko.trim()) {
      setError('쿠폰명(한국어)을 입력해주세요.');
      return;
    }
    if (form.discount_value <= 0) {
      setError('할인 값은 0보다 커야 합니다.');
      return;
    }
    if (form.type === 'FIXED_AMOUNT' && !form.currency) {
      setError('정액 할인은 통화를 선택해야 합니다.');
      return;
    }
    if (!form.starts_at || !form.expires_at) {
      setError('유효기간을 입력해주세요.');
      return;
    }
    if (new Date(form.starts_at) >= new Date(form.expires_at)) {
      setError('종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    startTransition(async () => {
      try {
        const id = await saveCoupon(coupon?.id ?? null, form);
        toast.success(coupon ? '쿠폰을 수정했습니다.' : '쿠폰을 생성했습니다.');
        if (!coupon) {
          router.push(`/coupons/${id}`);
        }
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '저장 실패';
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Code */}
      <div className="space-y-1.5">
        <Label htmlFor="coupon-code">쿠폰 코드 *</Label>
        <Input
          id="coupon-code"
          value={form.code}
          onChange={(e) => patch('code', e.target.value.toUpperCase())}
          placeholder="SUMMER2024"
          disabled={!!coupon}
          className={cn('font-mono uppercase', !!coupon && 'cursor-not-allowed bg-muted')}
        />
        {!coupon && (
          <p className="text-[11px] text-muted-foreground">
            영문 대문자, 숫자, 하이픈 사용 권장
          </p>
        )}
      </div>

      {/* Names (KO/EN/JA/DE) */}
      <div className="grid grid-cols-2 gap-3">
        {NAME_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`coupon-${key}`}>{label}</Label>
            <Input
              id={`coupon-${key}`}
              value={form[key]}
              onChange={(e) => patch(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Discount type */}
      <div className="space-y-2">
        <Label>할인 종류</Label>
        <Tabs value={form.type} onValueChange={(v) => handleTypeChange(v as CouponType)}>
          <TabsList>
            <TabsTrigger value="FIXED_AMOUNT">정액 할인</TabsTrigger>
            <TabsTrigger value="PERCENTAGE">정률 할인 (%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Discount value + currency/max */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="discount-value">
            {form.type === 'PERCENTAGE' ? '할인율 (%) *' : '할인 금액 *'}
          </Label>
          <Input
            id="discount-value"
            type="number"
            value={form.discount_value}
            onChange={(e) => patch('discount_value', Number(e.target.value))}
            min={0}
            max={form.type === 'PERCENTAGE' ? 100 : undefined}
            step={0.01}
            className="font-mono"
          />
        </div>

        {form.type === 'FIXED_AMOUNT' ? (
          <div className="space-y-1.5">
            <Label>통화 *</Label>
            <Select
              value={form.currency ?? 'KRW'}
              onValueChange={(v) => patch('currency', v as Currency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="max-discount">최대 할인 금액 (KRW, 선택)</Label>
            <Input
              id="max-discount"
              type="number"
              value={form.max_discount_amount ?? ''}
              onChange={(e) =>
                patch('max_discount_amount', e.target.value ? Number(e.target.value) : null)
              }
              min={0}
              placeholder="제한 없음"
              className="font-mono"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="min-order">최소 주문 금액 (선택)</Label>
          <Input
            id="min-order"
            type="number"
            value={form.min_order_amount ?? ''}
            onChange={(e) =>
              patch('min_order_amount', e.target.value ? Number(e.target.value) : null)
            }
            min={0}
            placeholder="제한 없음"
            className="font-mono"
          />
        </div>
      </div>

      {/* Issuance limits */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="max-issuance">총 발급 한도 (선택)</Label>
          <Input
            id="max-issuance"
            type="number"
            value={form.max_issuance_count ?? ''}
            onChange={(e) =>
              patch('max_issuance_count', e.target.value ? Number(e.target.value) : null)
            }
            min={1}
            placeholder="무제한"
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max-per-user">1인당 발급 한도</Label>
          <Input
            id="max-per-user"
            type="number"
            value={form.max_use_per_user}
            onChange={(e) => patch('max_use_per_user', Number(e.target.value))}
            min={1}
            className="font-mono"
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="starts-at">시작일 *</Label>
          <Input
            id="starts-at"
            type="datetime-local"
            value={toDatetimeLocal(form.starts_at)}
            onChange={(e) => patch('starts_at', fromDatetimeLocal(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expires-at">종료일 *</Label>
          <Input
            id="expires-at"
            type="datetime-local"
            value={toDatetimeLocal(form.expires_at)}
            onChange={(e) => patch('expires_at', fromDatetimeLocal(e.target.value))}
          />
        </div>
      </div>

      {/* Combinable */}
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={form.is_combinable}
          onCheckedChange={(c) => patch('is_combinable', c === true)}
        />
        <span className="text-[13px] text-foreground">다른 쿠폰과 중복 사용 허용</span>
      </label>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={isPending} className="w-full" size="md">
        {isPending ? '저장 중…' : coupon ? '수정 저장' : '쿠폰 생성'}
      </Button>
    </div>
  );
}
