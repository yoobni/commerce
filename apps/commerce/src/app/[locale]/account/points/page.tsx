import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getUserPoints, getUserPointTransactions } from '@/lib/points/queries';
import { cn } from '@/lib/cn';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.points' });
  return { title: t('title') };
}

const TYPE_LABELS: Record<string, { ko: string; sign: '+' | '-' }> = {
  EARN:         { ko: '적립',         sign: '+' },
  USE:          { ko: '사용',         sign: '-' },
  EXPIRE:       { ko: '소멸',         sign: '-' },
  CANCEL_EARN:  { ko: '적립 취소',    sign: '-' },
  CANCEL_USE:   { ko: '사용 취소',    sign: '+' },
  ADMIN_GRANT:  { ko: '관리자 지급',  sign: '+' },
  ADMIN_DEDUCT: { ko: '관리자 차감',  sign: '-' },
};

export default async function AccountPointsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const t = await getTranslations({ locale, namespace: 'account.points' });

  const [points, transactions] = await Promise.all([
    getUserPoints(user.id),
    getUserPointTransactions(user.id, 30),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('title')}</h2>

      {/* 잔액 카드 */}
      <div className="rounded-xl border border-[var(--mz-line)] bg-[var(--mz-surface)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[13px] text-[var(--mz-ink-mute)] mb-1">{t('balance')}</p>
          <p className="font-serif text-[32px] font-[700] text-[var(--mz-ink)] leading-none">
            {points.balance.toLocaleString()}
            <span className="text-[18px] font-[400] ml-1">P</span>
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-[11px] text-[var(--mz-ink-mute)] mb-0.5">{t('earned')}</p>
            <p className="text-[15px] font-semibold text-[var(--mz-ink)]">
              +{points.total_earned.toLocaleString()}P
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-[var(--mz-ink-mute)] mb-0.5">{t('used')}</p>
            <p className="text-[15px] font-semibold text-[var(--mz-ink)]">
              -{points.total_used.toLocaleString()}P
            </p>
          </div>
        </div>
      </div>

      {/* 내역 */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--mz-ink)] mb-3">{t('history')}</h3>
        {transactions.length === 0 ? (
          <p className="text-[14px] text-[var(--mz-ink-mute)] py-8 text-center">
            포인트 내역이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--mz-line)] border border-[var(--mz-line)] rounded-xl overflow-hidden">
            {transactions.map((tx) => {
              const meta = TYPE_LABELS[tx.type] ?? { ko: tx.type, sign: '+' as const };
              const isPlus = meta.sign === '+';
              const date = new Date(tx.created_at).toLocaleDateString(
                locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US',
                { year: 'numeric', month: '2-digit', day: '2-digit' }
              );
              return (
                <li key={tx.id} className="flex items-center justify-between px-4 py-3 bg-[var(--mz-surface)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--mz-ink)] truncate">
                      {tx.reason}
                    </p>
                    <p className="text-[11px] text-[var(--mz-ink-mute)] mt-0.5">
                      {meta.ko} · {date}
                    </p>
                  </div>
                  <div className="ml-4 text-right shrink-0">
                    <p
                      className={cn(
                        'text-[14px] font-semibold',
                        isPlus ? 'text-[var(--color-success)]' : 'text-red-500'
                      )}
                    >
                      {meta.sign}{tx.amount.toLocaleString()}P
                    </p>
                    <p className="text-[11px] text-[var(--mz-ink-mute)]">
                      잔액 {tx.balance_after.toLocaleString()}P
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
