'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTrack } from '@/hooks/useTrack';
import { Modal } from '@/components/ui/Modal';
import type { Size } from '@commerce/types';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  sizes: Size[];
  productId: string;
}

export function SizeGuideModal({ open, onClose, sizes, productId }: SizeGuideModalProps) {
  const t = useTranslations('product');
  const track = useTrack();
  const trackedOpen = useRef(false);

  useEffect(() => {
    if (open && !trackedOpen.current) {
      trackedOpen.current = true;
      track('size_guide_view', { product_id: productId, breed_type: null });
    }
    if (!open) {
      trackedOpen.current = false;
    }
  }, [open, productId, track]);

  return (
    <Modal open={open} onClose={onClose} title={t('sizeGuide')} size="lg">
      <div className="space-y-6">
        {/* Size chart table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 pr-4 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {t('sizeLabel')}
                </th>
                <th className="text-center py-2 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {t('sizeChest')}
                </th>
                <th className="text-center py-2 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {t('sizeBack')}
                </th>
                <th className="text-center py-2 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {t('sizeNeck')}
                </th>
                <th className="text-center py-2 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {t('sizeWeight')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size, i) => (
                <tr
                  key={size.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-neutral-50)]'}
                >
                  <td className="py-2.5 pr-4 font-semibold text-[var(--color-brand-primary)]">
                    {size.label}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--color-text-secondary)]">
                    {size.chest_cm_min}–{size.chest_cm_max}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--color-text-secondary)]">
                    {size.back_length_cm_min}–{size.back_length_cm_max}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--color-text-secondary)]">
                    {size.neck_cm_min}–{size.neck_cm_max}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--color-text-secondary)]">
                    {size.weight_kg_min}–{size.weight_kg_max} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Unit note */}
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {t('sizeUnit')}
        </p>

        {/* Breed examples */}
        {sizes.some((s) => s.breed_examples.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {t('sizeBreedExamples')}
            </h3>
            <div className="space-y-2">
              {sizes
                .filter((s) => s.breed_examples.length > 0)
                .map((size) => (
                  <div key={size.id} className="flex gap-3 text-sm">
                    <span className="font-semibold text-[var(--color-brand-primary)] w-10 shrink-0">
                      {size.label}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                      {size.breed_examples.join(', ')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Measure tip */}
        <div className="rounded-lg bg-[var(--color-neutral-50)] border border-[var(--color-border)] p-4 space-y-1">
          <p className="text-xs font-semibold text-[var(--color-text-primary)]">
            {t('sizeTipTitle')}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {t('sizeTip')}
          </p>
        </div>
      </div>
    </Modal>
  );
}
