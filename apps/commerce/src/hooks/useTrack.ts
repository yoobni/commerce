'use client';

import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';
import type { EventName, EventProperties } from '@/lib/analytics/types';

/**
 * useTrack — analytics event tracking hook
 *
 * Usage:
 *   const track = useTrack();
 *   track('add_to_cart', { product_id: '...', ... });
 *
 * The hook is stable (same reference across renders) and safe to call
 * inside event handlers, effects, and async callbacks.
 */
export function useTrack() {
  const track = useCallback(<T extends EventName>(event: T, properties: EventProperties<T>) => {
    analytics.track(event, properties);
  }, []);

  return track;
}
