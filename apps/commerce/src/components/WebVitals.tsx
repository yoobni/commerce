'use client';

import { useReportWebVitals } from 'next/dist/client/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[web-vitals] ${metric.name}`, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        rating: metric.rating,
        navigationType: metric.navigationType,
      });
    }

    // Production: forward to analytics ingest
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
        page: window.location.pathname,
      });
      // Use sendBeacon for non-blocking delivery
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/vitals', body);
      }
    }
  });

  return null;
}
