'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Coupon, CouponType, Currency } from '@commerce/types';
import type { SaveCouponInput } from '@/lib/actions/coupons';
import { saveCoupon } from '@/lib/actions/coupons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert ISO timestamp to datetime-local input value (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

/** Convert datetime-local value to ISO string */
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  coupon: Coupon | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CouponForm({ coupon }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SaveCouponInput>(() =>
    coupon ? couponToInput(coupon) : makeDefault()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

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
        if (!coupon) {
          router.push(`/coupons/${id}`);
          router.refresh();
        } else {
          setSuccess(true);
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '저장 실패');
      }
    });
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          저장되었습니다.
        </p>
      )}

      {/* Code & names */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            쿠폰 코드 *
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => patch('code', e.target.value.toUpperCase())}
            placeholder="SUMMER2024"
            disabled={!!coupon}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-[var(--color-text-secondary)]"
          />
          {!coupon && (
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              영문 대문자, 숫자, 하이픈 사용 권장
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'name_ko' as const, label: '이름 (KO) *' },
              { key: 'name_en' as const, label: '이름 (EN)' },
              { key: 'name_ja' as const, label: '이름 (JA)' },
              { key: 'name_de' as const, label: '이름 (DE)' },
            ] as Array<{ key: keyof SaveCouponInput; label: string }>
          ).map(({ key, label }) => (
            <div key={String(key)}>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                {label}
              </label>
              <input
                type="text"
                value={form[key] as string}
                onChange={(e) => patch(key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Discount settings */}
      <div className="space-y-3 pt-1">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coupon-type"
              checked={form.type === 'FIXED_AMOUNT'}
              onChange={() => handleTypeChange('FIXED_AMOUNT')}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--color-text-primary)]">정액 할인</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coupon-type"
              checked={form.type === 'PERCENTAGE'}
              onChange={() => handleTypeChange('PERCENTAGE')}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--color-text-primary)]">정률 할인 (%)</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              {form.type === 'PERCENTAGE' ? '할인율 (%) *' : '할인 금액 *'}
            </label>
            <input
              type="number"
              value={form.discount_value}
              onChange={(e) => patch('discount_value', Number(e.target.value))}
              min="0"
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
              step="0.01"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {form.type === 'FIXED_AMOUNT' ? (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                통화 *
              </label>
              <select
                value={form.currency ?? ''}
                onChange={(e) => patch('currency', e.target.value as Currency)}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                최대 할인 금액 (KRW, 선택)
              </label>
              <input
                type="number"
                value={form.max_discount_amount ?? ''}
                onChange={(e) =>
                  patch('max_discount_amount', e.target.value ? Number(e.target.value) : null)
                }
                min="0"
                placeholder="제한 없음"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              최소 주문 금액 (선택)
            </label>
            <input
              type="number"
              value={form.min_order_amount ?? ''}
              onChange={(e) =>
                patch('min_order_amount', e.target.value ? Number(e.target.value) : null)
              }
              min="0"
              placeholder="제한 없음"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Issuance limits */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            총 발급 한도 (선택)
          </label>
          <input
            type="number"
            value={form.max_issuance_count ?? ''}
            onChange={(e) =>
              patch('max_issuance_count', e.target.value ? Number(e.target.value) : null)
            }
            min="1"
            placeholder="무제한"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            1인당 발급 한도
          </label>
          <input
            type="number"
            value={form.max_use_per_user}
            onChange={(e) => patch('max_use_per_user', Number(e.target.value))}
            min="1"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            시작일 *
          </label>
          <input
            type="datetime-local"
            value={toDatetimeLocal(form.starts_at)}
            onChange={(e) => patch('starts_at', fromDatetimeLocal(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            종료일 *
          </label>
          <input
            type="datetime-local"
            value={toDatetimeLocal(form.expires_at)}
            onChange={(e) => patch('expires_at', fromDatetimeLocal(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Options */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_combinable}
            onChange={(e) => patch('is_combinable', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            다른 쿠폰과 중복 사용 허용
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-2.5 text-sm font-medium bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? '저장 중...' : coupon ? '수정 저장' : '쿠폰 생성'}
      </button>
    </div>
  );
}
