'use client';

import { useState, useTransition } from 'react';
import { issueCoupon } from '@/lib/actions/coupons';

interface IssueFormProps {
  couponId: string;
  adminId: string;
  couponExpiresAt: string; // ISO — default expires_at for issuance
}

export function IssueForm({ couponId, adminId, couponExpiresAt }: IssueFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(couponExpiresAt.slice(0, 16));
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setResult(null);

    startTransition(async () => {
      const res = await issueCoupon(adminId, {
        couponId,
        userEmail: email.trim(),
        expiresAt: new Date(expiresAt).toISOString(),
      });

      if (res.ok) {
        setResult({ ok: true, message: '쿠폰이 발급되었습니다.' });
        setEmail('');
      } else {
        setResult({ ok: false, message: res.error });
      }
    });
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        회원에게 발급
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
            회원 이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
            발급 만료일
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {result && (
          <p
            className={`text-xs ${
              result.ok
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-error)]'
            }`}
          >
            {result.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !email.trim()}
          className="w-full px-4 py-2 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? '발급 중…' : '발급'}
        </button>
      </form>
    </div>
  );
}
