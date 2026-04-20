'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { useTrack } from '@/hooks/useTrack';
import type { Size } from '@commerce/types';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  sizes: Size[];
  productId: string;
}

export function SizeGuideModal({ open, onClose, sizes, productId }: SizeGuideModalProps) {
  const t = useTranslations('sizeGuide');
  const track = useTrack();

  function handleOpen() {
    if (open) return;
    track('size_guide_view', { product_id: productId, breed_type: null });
  }

  // Track when it opens
  if (open) {
    handleOpen();
  }

  const sorted = [...sizes].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Modal open={open} onClose={onClose} title={t('title')} size="lg">
      <div className="space-y-6">
        {/* Measurement note */}
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('howToMeasure')}
        </p>

        {/* Size table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  t('size'),
                  t('chest'),
                  t('backLength'),
                  t('neck'),
                  t('weight'),
                  t('breedExamples'),
                ].map((header) => (
                  <th
                    key={header}
                    className="py-2.5 px-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((size, i) => (
                <tr
                  key={size.id}
                  className={i % 2 === 0 ? 'bg-[var(--color-neutral-50)]' : 'bg-white'}
                >
                  <td className="py-3 px-3 font-semibold text-[var(--color-brand-primary)]">
                    {size.label}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                    {size.chest_cm_min}–{size.chest_cm_max}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                    {size.back_length_cm_min}–{size.back_length_cm_max}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                    {size.neck_cm_min}–{size.neck_cm_max}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                    {size.weight_kg_min}–{size.weight_kg_max}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)] text-xs leading-relaxed">
                    {size.breed_examples.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[var(--color-text-tertiary)] border-t border-[var(--color-border-subtle)] pt-4">
          {t('note')}
        </p>
      </div>
    </Modal>
  );
}
