'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useTranslations } from 'next-intl';
import { logError } from '@/lib/errors';

type Props = {
  children: ReactNode;
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
};

type State = {
  error: Error | null;
};

function DefaultFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations('error');
  return (
    <div className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
      <p>{t('description')}</p>
      <button onClick={onReset} className="mt-3 underline text-[var(--color-brand-primary)]">
        {t('retry')}
      </button>
    </div>
  );
}

/**
 * ErrorBoundary — catches render errors in the React tree.
 * Use for sections that should fail gracefully without breaking the full page.
 *
 * For page-level errors, prefer Next.js error.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, {
      context: 'error-boundary',
      extra: { componentStack: info.componentStack },
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) {
        return fallback({ error, reset: this.reset });
      }
      return <DefaultFallback onReset={this.reset} />;
    }

    return children;
  }
}
