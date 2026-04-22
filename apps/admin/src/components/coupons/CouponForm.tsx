'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Coupon, CouponType, Currency } from '@commerce/types';
import type { CouponInput } from '@/lib/actions/coupons';
import { createCoupon, updateCoupon } from '@/lib/actions/coupons';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CouponFormProps {
  adminId: string;
  initialData?: Coupon;
}

const CURRENCY_OPTIONS: Currency[] = ['KRW', 'USD', 'JPY', 'EUR'];

// Convert ISO string to datetime-local input value (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

// Convert datetime-local value to ISO string
function toISO(local: string): string {
  if (!local) return '';
  return new Date(local).toISOString();
}

function buildDefault(coupon?: Coupon): CouponInput & { code: string } {
  if (coupon) {
    return {
      code: coupon.code,
      name_ko: coupon.name_ko,
      name_en: coupon.name_en,
      name_ja: coupon.name_ja,
      name_de: coupon.name_de,
      type: coupon.type,
      discount_value: coupon.discount_value,
      max_discount_amount: coupon.max_discount_amount,
      min_order_amount: coupon.min_order_amount,
      currency: coupon.currency,
      max_issuance_count: coupon.max_issuance_count,
      max_use_per_user: coupon.max_use_per_user,
      is_combinable: coupon.is_combinable,
      starts_at: toDatetimeLocal(coupon.starts_at),
      expires_at: toDatetimeLocal(coupon.expires_at),
    };
  }
  return {
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    name_de: '',
    type: 'PERCENTAGE',
    discount_value: 10,
    max_discount_amount: null,
    min_order_amount: null,
    currency: null,
    max_issuance_count: null,
    max_use_per_user: 1,
    is_combinable: false,
    starts_at: '',
    expires_at: '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CouponForm({ adminId, initialData }: CouponFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialData;
  const [form, setForm] = useState(buildDefault(initialData));

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.starts_at || !form.expires_at) {
      setError('유효 시작일과 만료일을 입력해주세요.');
      return;
    }
    if (new Date(form.expires_at) <= new Date(form.starts_at)) {
      setError('만료일은 시작일보다 이후여야 합니다.');
      return;
    }
    if (form.discount_value <= 0) {
      setError('할인값은 0보다 커야 합니다.');
      return;
    }
    if (form.type === 'PERCENTAGE' && form.discount_value > 100) {
      setError('퍼센트 할인은 100%를 초과할 수 없습니다.');
      return;
    }
    if (form.type === 'FIXED_AMOUNT' && !form.currency) {
      setError('정액 할인 쿠폰은 통화를 선택해야 합니다.');
      return;
    }

    const input: CouponInput = {
      code: form.code,
      name_ko: form.name_ko,
      name_en: form.name_en,
      name_ja: form.name_ja,
      name_de: form.name_de,
      type: form.type,
      discount_value: form.discount_value,
      max_discount_amount:
        form.type === 'PERCENTAGE' ? form.max_discount_amount : null,
      min_order_amount: form.min_order_amount,
      currency: form.type === 'FIXED_AMOUNT' ? form.currency : null,
      max_issuance_count: form.max_issuance_count,
      max_use_per_user: form.max_use_per_user,
      is_combinable: form.is_combinable,
      starts_at: toISO(form.starts_at),
      expires_at: toISO(form.expires_at),
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateCoupon(initialData!.id, adminId, input)
        : await createCoupon(adminId, input);

      if (result.ok) {
        router.push(`/coupons/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="px-4 py-3 text-sm text-[var(--color-error)] bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          쿠폰 코드 <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => update('code', e.target.value.toUpperCase())}
          disabled={isEdit}
          required
          placeholder="SUMMER2026"
          className={cn(
            'w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'font-mono tracking-wider',
            isEdit && 'bg-gray-50 cursor-not-allowed'
          )}
        />
        {isEdit && (
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            쿠폰 코드는 생성 후 변경할 수 없습니다.
          </p>
        )}
      </div>

      {/* Names */}
      <fieldset>
        <legend className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          쿠폰명 <span className="text-[var(--color-error)]">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'name_ko', label: '한국어' },
              { key: 'name_en', label: 'English' },
              { key: 'name_ja', label: '日本語' },
              { key: 'name_de', label: 'Deutsch' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Type + Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            할인 유형 <span className="text-[var(--color-error)]">*</span>
          </label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value as CouponType)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PERCENTAGE">퍼센트 할인 (%)</option>
            <option value="FIXED_AMOUNT">정액 할인</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            할인값 <span className="text-[var(--color-error)]">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
              step={form.type === 'PERCENTAGE' ? 1 : 100}
              value={form.discount_value}
              onChange={(e) => update('discount_value', Number(e.target.value))}
              required
              className="w-full px-3 py-2 pr-10 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)]">
              {form.type === 'PERCENTAGE' ? '%' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* FIXED: Currency | PERCENTAGE: Max discount amount */}
      {form.type === 'FIXED_AMOUNT' ? (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            통화 <span className="text-[var(--color-error)]">*</span>
          </label>
          <select
            value={form.currency ?? ''}
            onChange={(e) =>
              update('currency', e.target.value ? (e.target.value as Currency) : null)
            }
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">통화 선택</option>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            최대 할인 상한 (선택)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={form.max_discount_amount ?? ''}
            onChange={(e) =>
              update('max_discount_amount', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="예: 10000 (원화 기준, 비워두면 무제한)"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Min order amount */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          최소 주문 금액 (선택)
        </label>
        <input
          type="number"
          min={0}
          step={1000}
          value={form.min_order_amount ?? ''}
          onChange={(e) =>
            update('min_order_amount', e.target.value ? Number(e.target.value) : null)
          }
          placeholder="비워두면 조건 없음"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Valid period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            유효 시작일 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => update('starts_at', e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            만료일 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => update('expires_at', e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            최대 발급 수 (선택)
          </label>
          <input
            type="number"
            min={1}
            value={form.max_issuance_count ?? ''}
            onChange={(e) =>
              update('max_issuance_count', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="비워두면 무제한"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            1인당 최대 사용 수 <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={form.max_use_per_user}
            onChange={(e) => update('max_use_per_user', Number(e.target.value))}
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Combinable */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_combinable"
          checked={form.is_combinable}
          onChange={(e) => update('is_combinable', e.target.checked)}
          className="w-4 h-4 rounded border-[var(--color-border)] accent-blue-600"
        />
        <label htmlFor="is_combinable" className="text-sm text-[var(--color-text-primary)]">
          다른 쿠폰과 중복 사용 허용 (MVP 기본: 불허)
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? '저장 중…' : isEdit ? '수정 저장' : '쿠폰 생성'}
        </button>
      </div>
    </form>
  );
}
