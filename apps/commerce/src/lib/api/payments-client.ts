'use client';

// Client-side payment helpers. createIntent runs from the browser at checkout;
// capture is invoked from the order pipeline after the PG callback fires.

import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { apiPost } from './client';

async function browserToken(): Promise<string | undefined> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface IntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(input: {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}): Promise<IntentResult> {
  return apiPost('/payments/intents', {
    accessToken: await browserToken(),
    body: input,
  });
}

export interface CaptureResult {
  paymentId: string;
  status: string;
}

export async function capturePayment(input: {
  paymentIntentId: string;
  orderId: string;
  method: string;
  amount: number;
  currency: string;
}): Promise<CaptureResult> {
  return apiPost('/payments/captures', {
    accessToken: await browserToken(),
    body: {
      payment_intent_id: input.paymentIntentId,
      order_id: input.orderId,
      method: input.method,
      amount: input.amount,
      currency: input.currency,
    },
  });
}
