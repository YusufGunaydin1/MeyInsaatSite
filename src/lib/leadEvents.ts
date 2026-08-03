/*
  Form dönüşümü — tarayıcı tarafı.

  Telefon ve WhatsApp dokunuşları zaten Analytics.astro'daki tek delege edilmiş
  yakalama dinleyicisinden geçiyor; form bir bağlantı olmadığı için oraya
  düşmez ve aynı ortak kancaya (window.meyTrackLead) buradan bağlanır. İkinci
  bir dinleyici EKLENMEZ — aksi hâlde dönüşüm iki kez sayılır.

  content/analytics.json'daki kimlikler boşken hiçbir script yüklenmez, yani
  window.dataLayer ve window.meyTrackLead HİÇ var olmaz: her çağrı korumalıdır.
*/
declare global {
  interface Window {
    dataLayer?: unknown[];
    meyTrackLead?: (method: 'call' | 'whatsapp' | 'form', where: string, isSales: boolean) => void;
  }
}

/**
 * Formun başarıyla iletildiğini ölçüme bildirir.
 * @param formLocation hangi sayfadaki form — GA4/GTM'de kırılım anahtarı
 */
export function trackFormLead(formLocation: string): void {
  if (typeof window === 'undefined') return;

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'form_submit_lead', form_location: formLocation });
  }

  // generate_lead + Ads conversion (send_to: adsConversionLabels.form) buradan gider.
  // Doldurulup gönderilen form bilinçli bir taleptir: footer'a yanlışlıkla dokunmanın
  // aksine hangi sayfadan gelirse gelsin Ads dönüşümü olarak sayılır.
  if (typeof window.meyTrackLead === 'function') {
    window.meyTrackLead('form', formLocation, true);
  }
}
