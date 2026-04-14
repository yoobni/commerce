'use client';

import type { Size } from '@commerce/types';
import type { OptionInput } from '@/lib/actions/products';

interface ProductOptionEditorProps {
  sizes: Size[];
  options: OptionInput[];
  onChange: (options: OptionInput[]) => void;
}

function makeEmptyOption(): OptionInput {
  return {
    id: null,
    size_id: '',
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
    _delete: false,
  };
}

export function ProductOptionEditor({
  sizes,
  options,
  onChange,
}: ProductOptionEditorProps) {
  const visible = options.filter((o) => !o._delete);

  function updateOption(key: number, updates: Partial<OptionInput>) {
    // key is the index into the full options array (including _delete ones)
    const next = options.map((o, i) => (i === key ? { ...o, ...updates } : o));
    onChange(next);
  }

  function addOption() {
    onChange([...options, makeEmptyOption()]);
  }

  function removeOption(fullIdx: number) {
    const opt = options[fullIdx];
    if (!opt) return;
    if (opt.id) {
      // existing: mark for deletion
      const next = options.map((o, i) => (i === fullIdx ? { ...o, _delete: true } : o));
      onChange(next);
    } else {
      // new: just remove
      onChange(options.filter((_, i) => i !== fullIdx));
    }
  }

  // Build array of [fullIndex, option] for visible rows
  const rows = options
    .map((o, i) => ({ fullIdx: i, opt: o }))
    .filter(({ opt }) => !opt._delete);

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-[var(--color-text-tertiary)] py-4 text-center border border-dashed border-[var(--color-border)] rounded-lg">
          옵션이 없습니다. 아래 버튼으로 추가해주세요.
        </p>
      )}

      {rows.map(({ fullIdx, opt }, rowIdx) => (
        <div
          key={fullIdx}
          className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              옵션 #{rowIdx + 1}
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.is_active}
                  onChange={(e) => updateOption(fullIdx, { is_active: e.target.checked })}
                  className="accent-[var(--color-brand-accent)]"
                />
                활성
              </label>
              <button
                type="button"
                onClick={() => removeOption(fullIdx)}
                className="text-xs text-[var(--color-error)] hover:underline"
              >
                삭제
              </button>
            </div>
          </div>

          {/* Row 1: Size, Color, Color Hex, SKU */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                사이즈 <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                value={opt.size_id}
                onChange={(e) => updateOption(fullIdx, { size_id: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-white"
                required
              >
                <option value="">선택</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                색상명 <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                value={opt.color}
                onChange={(e) => updateOption(fullIdx, { color: e.target.value })}
                placeholder="예: Black"
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                색상 HEX
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={opt.color_hex ?? '#000000'}
                  onChange={(e) =>
                    updateOption(fullIdx, { color_hex: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer border border-[var(--color-border)]"
                />
                <input
                  type="text"
                  value={opt.color_hex ?? ''}
                  onChange={(e) =>
                    updateOption(fullIdx, { color_hex: e.target.value || null })
                  }
                  placeholder="#000000"
                  className="flex-1 px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                SKU <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                value={opt.sku}
                onChange={(e) => updateOption(fullIdx, { sku: e.target.value })}
                placeholder="예: RV-JKT-BLK-M"
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md font-mono"
                required
              />
            </div>
          </div>

          {/* Row 2: Stock, Threshold */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                재고 수량
              </label>
              <input
                type="number"
                min={0}
                value={opt.stock}
                onChange={(e) =>
                  updateOption(fullIdx, { stock: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                부족 임계값
              </label>
              <input
                type="number"
                min={0}
                value={opt.low_stock_threshold}
                onChange={(e) =>
                  updateOption(fullIdx, {
                    low_stock_threshold: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md"
              />
            </div>
          </div>

          {/* Row 3: Additional prices */}
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">추가 가격</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { key: 'additional_price_krw', label: 'KRW', placeholder: '0' },
                  { key: 'additional_price_usd', label: 'USD', placeholder: '0.00' },
                  { key: 'additional_price_jpy', label: 'JPY', placeholder: '0' },
                  { key: 'additional_price_eur', label: 'EUR', placeholder: '0.00' },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-[var(--color-text-tertiary)] mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={key.includes('usd') || key.includes('eur') ? '0.01' : '1'}
                    value={opt[key]}
                    onChange={(e) =>
                      updateOption(fullIdx, { [key]: Number(e.target.value) })
                    }
                    placeholder={placeholder}
                    className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dashed border-[var(--color-brand-accent)] text-[var(--color-brand-accent)] rounded-lg hover:bg-[var(--color-brand-accent)]/5 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        옵션 추가
      </button>
    </div>
  );
}
