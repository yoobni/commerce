import { getPaymentProvider } from '@/lib/payment';

interface CreateIntentBody {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const body: CreateIntentBody = await request.json();

    if (!body.amount || !body.currency) {
      return Response.json({ error: 'amount and currency are required' }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const result = await provider.createIntent({
      amount: body.amount,
      currency: body.currency,
      metadata: body.metadata,
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment intent creation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
