/*
  Ölçümleme yapılandırması — content/analytics.json tek kaynaktır.

  Kimlikler boşken hiçbir script yüklenmez: site bugünkü haliyle çerezsiz ve
  ek istek üretmeden çalışır. Sahibi kimlikleri yapıştırdığı anda GA4 + Google
  Ads dönüşümleri (arama / WhatsApp / form) devreye girer.
*/
import analyticsJson from '../../content/analytics.json';

export type LeadMethod = 'call' | 'whatsapp' | 'form';

export interface AnalyticsConfig {
  googleSiteVerification: string;
  ga4MeasurementId: string;
  adsConversionId: string;
  adsConversionLabels: Record<LeadMethod, string>;
  consentBanner: boolean;
}

const raw = analyticsJson as Partial<AnalyticsConfig>;

const GA4_RE = /^G-[A-Z0-9]{6,}$/i;
const ADS_RE = /^AW-\d{6,}$/i;

const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Search Console 'HTML etiketi' doğrulama jetonu — boşsa meta basılmaz. */
export const siteVerification = clean(raw.googleSiteVerification);

/** Geçersiz biçimli kimlik = yok sayılır; yanlış yapıştırma sessizce ölçüm bozmasın. */
export const ga4Id = GA4_RE.test(clean(raw.ga4MeasurementId)) ? clean(raw.ga4MeasurementId) : '';
export const adsId = ADS_RE.test(clean(raw.adsConversionId)) ? clean(raw.adsConversionId) : '';

export const conversionLabels: Record<LeadMethod, string> = {
  call: clean(raw.adsConversionLabels?.call),
  whatsapp: clean(raw.adsConversionLabels?.whatsapp),
  form: clean(raw.adsConversionLabels?.form),
};

/** Ads'e gönderilecek send_to hedefi; kimlik veya etiket eksikse null. */
export function conversionTarget(method: LeadMethod): string | null {
  const label = conversionLabels[method];
  return adsId && label ? `${adsId}/${label}` : null;
}

export const analyticsEnabled = Boolean(ga4Id || adsId);

/** gtag.js hangi kimlikle yüklenecek — GA4 varsa o, yoksa Ads. */
export const loaderId = ga4Id || adsId;

export const consentBannerEnabled = raw.consentBanner !== false;

/** localStorage anahtarı — onay bandı ile Analytics.astro'nun tek buluşma noktası. */
export const CONSENT_KEY = 'mey-consent';
