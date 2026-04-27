// ─── Stripe PaymentIntent 생성 예시 (주석 처리 — 실제 연동 전) ───────────────
//
// 활성화 방법:
//   1. npm i stripe
//   2. .env.local에 STRIPE_SECRET_KEY 추가
//   3. 아래 주석 해제 후 더미 응답 제거
//
// import Stripe from 'stripe';
//
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-01-27.acacia',
// });
//
// interface CreateIntentBody {
//   amount: number;
//   currency: 'krw' | 'usd' | 'jpy' | 'eur';
//   metadata?: Record<string, string>;
// }
//
// export async function POST(request: Request) {
//   try {
//     const body: CreateIntentBody = await request.json();
//
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: body.currency === 'krw' || body.currency === 'jpy'
//         ? Math.round(body.amount)        // zero-decimal currencies
//         : Math.round(body.amount * 100), // USD/EUR in cents
//       currency: body.currency,
//       automatic_payment_methods: { enabled: true },
//       metadata: body.metadata ?? {},
//     });
//
//     return Response.json({
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : 'Payment intent creation failed';
//     return Response.json({ error: message }, { status: 500 });
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

// 결제 모듈 미연동 상태 — 더미 응답
export async function POST() {
  return Response.json(
    { error: 'Payment module not connected yet. See comments above for Stripe integration.' },
    { status: 501 }
  );
}
