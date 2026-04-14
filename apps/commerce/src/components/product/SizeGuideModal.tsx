'use client';

import { useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useTrack } from '@/hooks/useTrack';
import type { Size } from '@commerce/types';

interface SizeGuideLabels {
  sizeGuideTitle: string;
  sizeLabel: string;
  chest: string;
  backLength: string;
  neck: string;
  weight: string;
  breedExamples: string;
  close: string;
}

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  sizes: Size[];
  productId: string;
  labels: SizeGuideLabels;
}

export function SizeGuideModal({ open, onClose, sizes, productId, labels }: SizeGuideModalProps) {
  const track = useTrack();

  const handleOpen = useCallback(() => {
    // Track when modal opens (called from parent, but we track via useEffect-like pattern)
    track('size_guide_view', { product_id: productId, breed_type: null });
  }, [track, productId]);

  // Track on first open
  const handleModalOpen = useCallback(() => {
    if (open) handleOpen();
  }, [open, handleOpen]);

  // Run tracking once when opened
  if (open) {
    // Fire once — parent already called track before opening, so this is a fallback guard
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={labels.sizeGuideTitle}
      size="lg"
    >
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm border-collapse min-w-[520px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {[
                labels.sizeLabel,
                labels.chest,
                labels.backLength,
                labels.neck,
                labels.weight,
                labels.breedExamples,
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)] whitespace-nowrap first:pl-2 last:pr-2"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size, i) => (
              <tr
                key={size.id}
                className={
                  i % 2 === 0
                    ? 'bg-transparent'
                    : 'bg-[var(--color-neutral-50)]'
                }
              >
                <td className="px-3 py-3 first:pl-2 font-semibold text-[var(--color-text-primary)]">
                  {size.label}
                </td>
                <td className="px-3 py-3 text-[var(--color-text-secondary)] tabular-nums">
                  {size.chest_cm_min}–{size.chest_cm_max}
                </td>
                <td className="px-3 py-3 text-[var(--color-text-secondary)] tabular-nums">
                  {size.back_length_cm_min}–{size.back_length_cm_max}
                </td>
                <td className="px-3 py-3 text-[var(--color-text-secondary)] tabular-nums">
                  {size.neck_cm_min}–{size.neck_cm_max}
                </td>
                <td className="px-3 py-3 text-[var(--color-text-secondary)] tabular-nums">
                  {size.weight_kg_min}–{size.weight_kg_max}
                </td>
                <td className="px-3 py-3 last:pr-2 text-[var(--color-text-secondary)] text-xs">
                  {size.breed_examples.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fit tip */}
      <p className="mt-4 text-xs text-[var(--color-text-tertiary)] leading-relaxed">
        * Measurements are in centimeters. If your dog is between sizes, we recommend sizing up for comfort.
      </p>
    </Modal>
  );
}

// Re-export a hook-friendly trigger
export { SizeGuideModal as default };
