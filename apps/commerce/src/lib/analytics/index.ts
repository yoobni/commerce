import type {
  GlobalEventProperties,
  EventName,
  EventProperties,
  DeviceType,
  UserType,
  Currency,
  Locale,
} from './types';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0';
const ANONYMOUS_ID_KEY = 'ravi_anon_id';
const SESSION_ID_KEY = 'ravi_session_id';

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreate(storageKey: string, storage: Storage): string {
  const existing = storage.getItem(storageKey);
  if (existing) return existing;
  const id = uuid();
  storage.setItem(storageKey, id);
  return id;
}

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPod/.test(ua)) return 'mobile';
  if (/iPad|Tablet/.test(ua)) return 'tablet';
  return 'desktop';
}

function detectOS(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua) && !/Mobile/.test(ua)) return 'macOS';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Linux/.test(ua)) return 'Linux';
  return 'unknown';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Chrome/.test(ua) && !/Chromium|Edg/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Firefox/.test(ua)) return 'Firefox';
  if (/Edg/.test(ua)) return 'Edge';
  return 'other';
}

function getUTMParams(): Pick<
  GlobalEventProperties,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'
> {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };
}

export interface AnalyticsConfig {
  locale: Locale;
  currency: Currency;
  userId: string | null;
  userType: UserType;
  country: string | null;
}

class AnalyticsManager {
  private config: AnalyticsConfig = {
    locale: 'en',
    currency: 'USD',
    userId: null,
    userType: 'guest',
    country: null,
  };

  private anonymousId = '';
  private sessionId = '';

  init(config: AnalyticsConfig) {
    this.config = config;
    if (typeof window !== 'undefined') {
      this.anonymousId = getOrCreate(ANONYMOUS_ID_KEY, localStorage);
      this.sessionId = getOrCreate(SESSION_ID_KEY, sessionStorage);
    }
  }

  setUser(userId: string | null, userType: UserType) {
    this.config.userId = userId;
    this.config.userType = userType;
  }

  setLocale(locale: Locale, currency: Currency) {
    this.config.locale = locale;
    this.config.currency = currency;
  }

  private buildGlobalProperties(): GlobalEventProperties {
    const utmParams = getUTMParams();
    return {
      event_id: uuid(),
      event_timestamp: new Date().toISOString(),
      user_id: this.config.userId,
      anonymous_id: this.anonymousId,
      session_id: this.sessionId,
      language: this.config.locale,
      country: this.config.country,
      currency: this.config.currency,
      device_type: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      screen_resolution:
        typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      ...utmParams,
      page_url: typeof window !== 'undefined' ? window.location.pathname : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      user_type: this.config.userType,
      app_version: APP_VERSION,
    };
  }

  track<T extends EventName>(event: T, properties: EventProperties<T>): void {
    if (typeof window === 'undefined') return;

    const payload = {
      event,
      ...this.buildGlobalProperties(),
      ...properties,
    };

    // TODO: Replace with actual analytics provider (Mixpanel / GA4 / Amplitude)
    // Integration point: send to analytics SDK or internal ingest endpoint
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, payload);
    }

    // Example: window.gtag?.('event', event, payload);
    // Example: mixpanel.track(event, payload);
  }

  page(properties?: Partial<{ title: string; url: string }>) {
    const payload = {
      event: 'page_view',
      ...this.buildGlobalProperties(),
      ...properties,
    };

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[analytics:page]', payload);
    }
  }
}

// Singleton
export const analytics = new AnalyticsManager();
