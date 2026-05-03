import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getUserPoints, listPointTransactions } from '@/lib/queries/points';
import type { PointTransactionType } from '@commerce/types';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.points' });
  return { title: t('title') };
}

const TRANSACTION_TYPE_SIGN: Record<PointTransactionType, '+' | '-'> = {
  EARN: '+',
  USE: '-',
  EXPIRE: '-',
  CANCEL_EARN: '-',
  CANCEL_USE: '+',
  ADMIN_GRANT: '+',
  ADMIN_DEDUCT: '-',
};

const TRANSACTION_TYPE_COLOR: Record<PointTransactionType, string> = {
  EARN: 'text-green-600',
  USE: 'text-[var(--color-text-secondary)]',
  EXPIRE: 'text-red-500',
  CANCEL_EARN: 'text-red-500',
  CANCEL_USE: 'text-green-600',
  ADMIN_GRANT: 'text-green-600',
  ADMIN_DEDUCT: 'text-red-500',
};

export default async function PointsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.points' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [points, { data: transactions }] = await Promise.all([
    getUserPoints(user.id),
    listPointTransactions(user.id),
  ]);

  const balance = points?.balance ?? 0;
  const totalEarned = points?.total_earned ?? 0;
  const totalUsed = points?.total_used ?? 0;

  // Points expiring within 30 days
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringAmount = transactions
    .filter(
      (tx) =>
        tx.type === 'EARN' &&
        tx.expires_at != null &&
        new Date(tx.expires_at) <= in30Days &&
        new Date(tx.expires_at) > now
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('title')}</h2>

      {/* Balance card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-brand-primary)] p-6 text-white">
        <p className="text-sm opacity-80 mb-1">{t('balance')}</p>
        <p className="text-3xl font-bold">
          {balance.toLocaleString()} <span className="text-lg font-normal">P</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{t('earned')}</p>
          <p className="text-base font-semibold text-green-600">
            +{totalEarned.toLocaleString()} P
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{t('used')}</p>
          <p className="text-base font-semibold text-[var(--color-text-secondary)]">
            -{totalUsed.toLocaleString()} P
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{t('expires')}</p>
          <p className="text-base font-semibold text-orange-500">
            {expiringAmount.toLocaleString()} P
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('history')}</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
            {t('noHistory')}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {transactions.map((tx) => {
              const sign = TRANSACTION_TYPE_SIGN[tx.type];
              const colorClass = TRANSACTION_TYPE_COLOR[tx.type];
              const typeLabel = t(`type.${tx.type.toLowerCase() as Lowercase<PointTransactionType>}`);
              return (
                <li key={tx.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {tx.reason || typeLabel}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString(
                        locale === 'ko' ? 'ko-KR' : locale
                      )}
                      {tx.expires_at && (
                        <span className="ml-2">
                          {t('expiresOn')}{' '}
                          {new Date(tx.expires_at).toLocaleDateString(
                            locale === 'ko' ? 'ko-KR' : locale
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-sm font-semibold ${colorClass}`}>
                      {sign}
                      {tx.amount.toLocaleString()} P
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                      {t('balanceAfter')} {tx.balance_after.toLocaleString()} P
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
