'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { useTrack } from '@/hooks/useTrack';
import { SizeGuideModal } from './SizeGuideModal';
import { createBrowserClient } from '@supabase/ssr';
import type { ProductWithDetails, ProductOption, Size, Locale } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PDPOptionsLabels {
  selectColor: string;
  selectSize: string;
  sizeGuide: string;
  addToCart: string;
  addingToCart: string;
  addToWishlist: string;
  removeFromWishlist: string;
  outOfStock: string;
  inStock: string;
  lowStock: string;
  selectOptionFirst: string;
  errorAddToCart: string;
  loginRequired: string;
  sizeGuideTitle: string;
  sizeLabel: string;
  chest: string;
  backLength: string;
  neck: string;
  weight: string;
  breedExamples: string;
  close: string;
}

interface PDPOptionsProps {
  product: ProductWithDetails;
  options: ProductOption[];
  sizes: Size[];
  locale: Locale;
  labels: PDPOptionsLabels;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── PDPOptions ───────────────────────────────────────────────────────────────

export function PDPOptions({ product, options, sizes, locale, labels }: PDPOptionsProps) {
  const router = useRouter();
  const track = useTrack();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ── Derive unique colors ──────────────────────────────────────────────────
  const uniqueColors = useMemo((): Array<{ color: string; hex: string }> => {
    const seen = new Set<string>();
    const result: Array<{ color: string; hex: string }> = [];
    for (const opt of options) {
      if (!seen.has(opt.color)) {
        seen.add(opt.color);
        result.push({ color: opt.color, hex: opt.color_hex ?? '#cccccc' });
      }
    }
    return result;
  }, [options]);

  // Auto-select color if only one
  useEffect(() => {
    if (uniqueColors.length === 1) {
      setSelectedColor(uniqueColors[0].color);
    }
  }, [uniqueColors]);

  // ── Options available for selected color ──────────────────────────────────
  const optionsForColor = useMemo((): ProductOption[] => {
    if (!selectedColor) return [];
    return options.filter((o) => o.color === selectedColor);
  }, [options, selectedColor]);

  // ── Selected option object ─────────────────────────────────────────────────
  const selectedOption = useMemo(
    () => options.find((o) => o.id === selectedOptionId) ?? null,
    [options, selectedOptionId]
  );

  // ── Stock status of selected option ──────────────────────────────────────
  const stockStatus = useMemo(() => {
    if (!selectedOption) return null;
    if (selectedOption.stock === 0) return 'out' as const;
    if (selectedOption.stock <= selectedOption.low_stock_threshold) return 'low' as const;
    return 'ok' as const;
  }, [selectedOption]);

  // ── Check wishlist status on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkWishlist() {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('wishlists') as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (!cancelled) {
        setIsWishlisted(!!data);
      }
    }
    checkWishlist();
    return () => { cancelled = true; };
  }, [product.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setSelectedOptionId(null); // reset size when color changes
    setCartError(null);
    setCartSuccess(false);
  }, []);

  const handleSizeSelect = useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
    setCartError(null);
    setCartSuccess(false);
  }, []);

  const handleSizeGuideOpen = useCallback(() => {
    setSizeGuideOpen(true);
    track('size_guide_view', { product_id: product.id, breed_type: null });
  }, [track, product.id]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedOptionId) {
      setCartError(labels.selectOptionFirst);
      return;
    }
    if (stockStatus === 'out') return;

    setCartLoading(true);
    setCartError(null);
    setCartSuccess(false);

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_option_id: selectedOptionId, quantity: 1 }),
      });

      if (res.status === 401) {
        router.push(`/${locale}/auth/login?next=/${locale}/products/${product.slug}`);
        return;
      }

      const json = (await res.json()) as { data: unknown; error: { code: string; message: string } | null };

      if (!res.ok || json.error) {
        setCartError(labels.errorAddToCart);
        return;
      }

      setCartSuccess(true);

      // Track add_to_cart
      const opt = options.find((o) => o.id === selectedOptionId);
      track('add_to_cart', {
        product_id: product.id,
        product_name: product[`name_${locale}` as keyof typeof product] as string ?? product.name_en,
        price: product.base_price_krw,
        quantity: 1,
        size: opt?.size?.label ?? null,
        variant_id: selectedOptionId,
        category: product.category?.slug ?? '',
        list_name: null,
      });

      // Auto-clear success state
      setTimeout(() => setCartSuccess(false), 3000);
    } catch {
      setCartError(labels.errorAddToCart);
    } finally {
      setCartLoading(false);
    }
  }, [selectedOptionId, stockStatus, locale, product, options, labels, router, track]);

  const handleWishlistToggle = useCallback(async () => {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/auth/login?next=/${locale}/products/${product.slug}`);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('wishlists') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsWishlisted(false);
        track('wishlist_toggled', {
          product_id: product.id,
          product_name: product[`name_${locale}` as keyof typeof product] as string ?? product.name_en,
          price: product.base_price_krw,
          category: product.category?.slug ?? '',
          action: 'remove',
          source_position: null,
          source_section: 'pdp',
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('wishlists') as any)
          .insert({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
        track('wishlist_toggled', {
          product_id: product.id,
          product_name: product[`name_${locale}` as keyof typeof product] as string ?? product.name_en,
          price: product.base_price_krw,
          category: product.category?.slug ?? '',
          action: 'add',
          source_position: null,
          source_section: 'pdp',
        });
      }
    } finally {
      setWishlistLoading(false);
    }
  }, [isWishlisted, product, locale, router, track]);

  const isSoldOut = product.status === 'SOLD_OUT';

  return (
    <>
      <div className="space-y-5">
        {/* ── Color selection ─────────────────────────────────────────── */}
        {uniqueColors.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {labels.selectColor}
              {selectedColor && (
                <span className="ml-2 font-normal text-[var(--color-text-secondary)]">
                  — {selectedColor}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={labels.selectColor}>
              {uniqueColors.map(({ color, hex }) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={color}
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      'relative w-8 h-8 rounded-full transition-all duration-150',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[var(--color-brand-primary)]'
                        : 'ring-1 ring-[var(--color-border)] hover:ring-[var(--color-brand-primary)]'
                    )}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Size selection ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {labels.selectSize}
            </p>
            <button
              type="button"
              onClick={handleSizeGuideOpen}
              className="text-xs text-[var(--color-text-tertiary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)] rounded"
            >
              {labels.sizeGuide}
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={labels.selectSize}>
            {optionsForColor.length === 0 && !selectedColor && (
              // Show placeholder size buttons (no color selected yet)
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {uniqueColors.length > 0 ? labels.selectColor : labels.selectSize}
              </p>
            )}
            {optionsForColor.map((opt) => {
              const sizeLabel = opt.size?.label ?? opt.size_id;
              const isOutOfStock = opt.stock === 0;
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isOutOfStock}
                  onClick={() => !isOutOfStock && handleSizeSelect(opt.id)}
                  className={cn(
                    'relative min-w-[52px] h-11 px-4 text-sm font-medium rounded border transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                    isSelected
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white'
                      : isOutOfStock
                        ? 'border-[var(--color-border)] text-[var(--color-neutral-300)] cursor-not-allowed'
                        : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)]'
                  )}
                >
                  {/* Out-of-stock strikethrough */}
                  {isOutOfStock && (
                    <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-neutral-300)] -translate-y-1/2 -rotate-[25deg]" aria-hidden="true" />
                  )}
                  {sizeLabel}
                </button>
              );
            })}
          </div>

          {/* Stock status */}
          {selectedOption && stockStatus && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                stockStatus === 'out' && 'text-[var(--color-error,#ef4444)]',
                stockStatus === 'low' && 'text-[var(--color-brand-accent)]',
                stockStatus === 'ok' && 'text-[var(--color-text-tertiary)]'
              )}
            >
              {stockStatus === 'out' && labels.outOfStock}
              {stockStatus === 'low' &&
                labels.lowStock.replace('{count}', String(selectedOption.stock))}
              {stockStatus === 'ok' && labels.inStock}
            </p>
          )}
        </div>

        {/* ── Error / Success feedback ────────────────────────────────── */}
        {cartError && (
          <p role="alert" className="text-xs text-[var(--color-error,#ef4444)]">
            {cartError}
          </p>
        )}
        {cartSuccess && (
          <p role="status" className="text-xs text-[var(--color-brand-primary)] font-medium">
            ✓ Added to cart
          </p>
        )}

        {/* ── CTA row ────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            loading={cartLoading}
            disabled={isSoldOut || stockStatus === 'out'}
            onClick={handleAddToCart}
            aria-label={isSoldOut ? labels.outOfStock : labels.addToCart}
          >
            {isSoldOut || stockStatus === 'out' ? labels.outOfStock : labels.addToCart}
          </Button>

          {/* Wishlist toggle button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            aria-label={isWishlisted ? labels.removeFromWishlist : labels.addToWishlist}
            aria-pressed={isWishlisted}
            className={cn(
              'flex items-center justify-center w-[52px] h-[52px] rounded border transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
              isWishlisted
                ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]',
              wishlistLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <HeartIcon filled={isWishlisted} />
          </button>
        </div>
      </div>

      {/* Size guide modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizes={sizes}
        productId={product.id}
        labels={labels}
      />
    </>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
