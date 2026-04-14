'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTrack } from '@/hooks/useTrack';
import { formatPrice } from '@commerce/shared';

interface PaymentResult {
  order_id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
}

type PageState = 'loading' | 'success' | 'error';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SuccessSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm animate-pulse">
        <div className="w-16 h-16 rounded-full bg-stone-200 mx-auto mb-6" />
        <div className="h-6 bg-stone-200 rounded w-3/4 mx-auto mb-3" />
        <div className="h-4 bg-stone-100 rounded w-1/2 mx-auto mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-stone-100 rounded w-1/3" />
              <div className="h-4 bg-stone-100 rounded w-1/4" />
            </div>
          ))}
        </div>
        <div className="h-12 bg-stone-200 rounded-xl mt-8" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const track = useTrack();

  const [state, setState] = useState<PageState>('loading');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');

    if (!paymentKey || !orderId || !amountStr) {
      setState('error');
      setErrorMsg(t('success.missingParams'));
      return;
    }

    const amount = Number(amountStr);
    if (Number.isNaN(amount) || amount <= 0) {
      setState('error');
      setErrorMsg(t('success.invalidAmount'));
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const json = (await res.json()) as {
          data?: {
            orderId: string;
            totalAmount: number;
            method: string;
          };
          error?: { code: string; message: string };
        };

        if (!res.ok || json.error) {
          throw new Error(json.error?.message ?? t('success.confirmFailed'));
        }

        const paymentData = json.data!;

        const resultData: PaymentResult = {
          order_id: paymentData.orderId,
          order_number: paymentData.orderId,
          total_amount: paymentData.totalAmount,
          payment_method: paymentData.method,
        };

        setResult(resultData);
        setState('success');

        // purchase 이벤트 트래킹
        track('purchase', {
          order_id: resultData.order_id,
          total_value: resultData.total_amount,
          tax: 0,
          shipping_cost: 0,
          coupon_code: null,
          point_used: 0,
          items: [],
          is_first_purchase: false,
          payment_method: resultData.payment_method,
        });
      } catch (err: unknown) {
        console.error('[checkout/success] confirm error:', err);
        setState('error');
        setErrorMsg(
          err instanceof Error ? err.message : t('success.confirmFailed')
        );
      }
    })();
  }, [searchParams, t, track]);

  if (state === 'loading') return <SuccessSkeleton />;

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm text-center">
          {/* Error icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-stone-900 mb-2">{t('success.errorTitle')}</h1>
          <p className="text-sm text-stone-500 mb-8">{errorMsg ?? t('success.confirmFailed')}</p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/checkout`)}
              className="w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              {t('success.retryPayment')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="w-full h-12 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              {t('success.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-stone-900 mb-1">{t('success.title')}</h1>
        <p className="text-sm text-stone-500 mb-8">{t('success.subtitle')}</p>

        {/* Order details */}
        {result && (
          <div className="bg-stone-50 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t('success.orderNumber')}</span>
              <span className="font-mono text-stone-900 font-medium">{result.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t('success.paymentMethod')}</span>
              <span className="text-stone-900">{result.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t('success.totalAmount')}</span>
              <span className="font-semibold text-stone-900">
                {formatPrice(result.total_amount, 'KRW')}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/orders`)}
            className="w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            {t('success.viewOrders')}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            className="w-full h-12 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            {t('success.continueShopping')}
          </button>
        </div>
      </div>
    </div>
  );
}
