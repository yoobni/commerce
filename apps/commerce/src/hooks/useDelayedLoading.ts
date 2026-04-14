'use client';

import { useState, useEffect } from 'react';

/**
 * Delays showing loading state to prevent skeleton flicker
 * on very fast loads (< delayMs).
 *
 * Usage:
 *   const showSkeleton = useDelayedLoading(isLoading);
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 100): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return delayed;
}
