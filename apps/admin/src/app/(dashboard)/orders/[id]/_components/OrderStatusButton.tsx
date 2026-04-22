'use client';

import { useTransition } from 'react';

interface Props {
  label: string;
  confirmMessage: string;
  action: () => Promise<void>;
  variant?: 'primary' | 'danger' | 'warning';
}

const VARIANT_CLASS: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-orange-500 hover:bg-orange-600 text-white',
};

export function OrderStatusButton({ label, confirmMessage, action, variant = 'primary' }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(() => {
      void action().catch((e: unknown) => {
        alert(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.');
      });
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`w-full py-2 text-sm font-medium rounded-lg disabled:opacity-60 transition-colors ${VARIANT_CLASS[variant]}`}
    >
      {pending ? '처리 중...' : label}
    </button>
  );
}
