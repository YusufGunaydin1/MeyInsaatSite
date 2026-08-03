/*
  Talep formu — sitenin TEK lead formu. Üç yüzeyde aynı bileşen çalışır:
  daire detay rayı, satılık liste rayı ve /iletisim panosu; fark yalnız
  props'ta (konu, subject, hangi kanallar geri düşüş olarak gösterilecek).

  Gönderim GERÇEK: alanlar Web3Forms üzerinden şirketin doğrulanmış gelen
  kutusuna e-posta olarak iletilir (statik site, arka uç yok). Erişim anahtarı
  yoksa ya da ağ hatasında dürüst panel ziyaretçiyi telefon/e-posta/WhatsApp'a
  yönlendirir; hiçbir zaman sahte başarı gösterilmez, hiçbir zaman çıkmaz sokak
  bırakılmaz.
*/
import { useEffect, useId, useRef, useState } from 'react';
import { WEB3FORMS_ENDPOINT, isValidEmail, isValidTrPhone, leadPayload } from '../../../../lib/contact';
import { trackFormLead } from '../../../../lib/leadEvents';

export interface FallbackChannel {
  kind: 'call' | 'whatsapp' | 'email';
  label: string;
  href: string;
}

interface Props {
  /** hangi daire/konu hakkında — mesaj yer tutucusunda ve panellerde görünür */
  konu: string;
  /** e-posta konu satırı, ör. "Web Formu · D-12 · 3+2 Dubleks · El Ele Apartmanı" */
  subject: string;
  /** ölçümde sayfa kırılımı, ör. "daire-detay-d12" */
  formLocation: string;
  /** başarı ve hata panellerinde gösterilecek kanallar; ilki birincil düğme */
  fallback: FallbackChannel[];
  /** KVKK onay metnindeki politika bağlantısı */
  privacyHref: string;
  /** gizli `daire` alanı; verilmezse konu kullanılır */
  daire?: string;
  /** Web3Forms erişim anahtarı (public); boşsa form yerine dürüst not */
  accessKey?: string;
  /** geniş (iki sütun) yerleşim — /iletisim panosu */
  wide?: boolean;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const SUCCESS_TEXT = 'Teşekkürler! Mesajınız bize ulaştı. Aynı gün içinde size dönüş yapacağız.';

/** Hata cümlesi sayfada GERÇEKTEN sunulan kanalları söyler — /iletisim'de WhatsApp yok. */
function failureText(fallback: FallbackChannel[]): string {
  const kinds = new Set(fallback.map((channel) => channel.kind));
  const phrase = kinds.has('whatsapp')
    ? 'telefon veya WhatsApp'
    : kinds.has('email')
      ? 'telefon veya e-posta'
      : 'telefon';
  return `Mesaj gönderilemedi. Lütfen ${phrase} ile ulaşın.`;
}

/** `where` testid'leri ayırır: aynı kanallar başarı, hata ve JS'siz panelde
    birlikte DOM'da durur, testler tekini hedefleyebilmeli. */
function Channels({ fallback, where }: { fallback: FallbackChannel[]; where: string }) {
  if (fallback.length === 0) return null;
  return (
    <div className="kcf-fallback" data-testid={`kcf-${where}-fallback`}>
      {fallback.map((channel, index) => (
        <a
          key={channel.href}
          className={index === 0 ? 'kcf-channel is-primary' : 'kcf-channel'}
          href={channel.href}
          data-testid={`kcf-${where}-${channel.kind}`}
        >
          {channel.label}
        </a>
      ))}
    </div>
  );
}

export default function RailForm({
  konu,
  subject,
  formLocation,
  fallback,
  privacyHref,
  daire,
  accessKey = '',
  wide = false,
}: Props) {
  const uid = useId();
  const id = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    email: `${uid}-email`,
    message: `${uid}-message`,
    consent: `${uid}-consent`,
  };
  const errId = {
    name: `${uid}-name-err`,
    phone: `${uid}-phone-err`,
    email: `${uid}-email-err`,
    consent: `${uid}-consent-err`,
  };

  const [values, setValues] = useState({ name: '', phone: '', email: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sayfa, setSayfa] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);

  /*
    Ada bağlanana kadar Gönder KAPALI durur. Sunucudan gelen HTML'de düğme
    etkinse ve ziyaretçi hidrasyondan önce basarsa tarayıcı formu KENDİ gönderir:
    action olmadığı için sayfa, ad ve telefon sorgu dizesinde olacak şekilde
    yeniden yüklenir — hem talep kaybolur hem kişisel veri adrese/geçmişe yazılır.
    Sunucuda adres de bilinemez; ikisi de aynı bağlanma anında kurulur.
  */
  useEffect(() => {
    setSayfa(window.location.href);
    setHydrated(true);
  }, []);

  const set = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  /*
    Tarayıcının kendi doğrulama balonları İNGİLİZCE çıkar ve dili değiştirilemez;
    bu yüzden form noValidate, mesajlar Türkçe ve alanın altında satır içi verilir.
    `required` yine durur — ekran okuyucular alanı zorunlu olarak duyurur.
  */
  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = 'Lütfen adınızı ve soyadınızı yazın.';
    if (!values.phone.trim()) next.phone = 'Lütfen telefon numaranızı yazın.';
    else if (!isValidTrPhone(values.phone)) next.phone = 'Telefon numarası eksik görünüyor — örn. 0532 625 68 12.';
    if (values.email.trim() && !isValidEmail(values.email)) next.email = 'E-posta adresi geçerli görünmüyor.';
    if (!consent) next.consent = 'Devam etmek için onay kutusunu işaretleyin.';
    return next;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === 'sending') return; // çift gönderim koruması (disabled'a ek)

    const next = validate();
    setErrors(next);
    const firstInvalid = (['name', 'phone', 'email', 'consent'] as const).find((field) => next[field]);
    if (firstInvalid) {
      document.getElementById(id[firstInvalid])?.focus();
      return;
    }

    // bal küpü işaretliyse bot — sessizce başarı göster, hiçbir şey gönderme
    if (honeypot.current?.checked) {
      setStatus('success');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          leadPayload({
            accessKey,
            subject,
            daire: daire ?? konu,
            sayfa: sayfa || window.location.href,
            name: values.name,
            phone: values.phone,
            email: values.email,
            message: values.message,
          })
        ),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.success) {
        setStatus('success');
        trackFormLead(formLocation);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  // Web3Forms anahtarı yoksa form e-posta gönderemez. Ölü bir "Gönder" düğmesi
  // göstermek yerine dürüstçe telefon/WhatsApp'a yönlendiren bir not göster;
  // anahtar company.json'a eklenince form otomatik olarak geri gelir.
  if (!accessKey.trim()) {
    return (
      <div className="kcf kcf-offline" role="note" data-testid="kcf-offline">
        <p className="t-tech kcf-kicker">HIZLI İLETİŞİM</p>
        <p className="kcf-panel-title">Formu kısa süre içinde açıyoruz</p>
        <p className="kcf-panel-text">
          {konu} için şimdi telefon veya WhatsApp ile ulaşın — aynı gün dönüş yapalım.
        </p>
      </div>
    );
  }

  const statusText =
    status === 'sending' ? 'Gönderiliyor…' : status === 'success' ? SUCCESS_TEXT : status === 'error' ? failureText(fallback) : '';

  return (
    <div className={wide ? 'kcf kcf-wide' : 'kcf'} data-testid="kcf">
      {/* Canlı bölge her durumda DOM'da durur; boşken CSS gizler. Sonradan
          eklenen bir aria-live kutusu okunmaz, o yüzden kaldırılmaz. */}
      <p className="kcf-status" role="status" aria-live="polite" data-testid="kcf-status">
        {statusText}
      </p>

      {status === 'success' ? (
        <div className="kcf-panel kcf-success" data-testid="kcf-success">
          <p className="t-tech kcf-kicker">TALEP ALINDI</p>
          <p className="kcf-panel-title">{SUCCESS_TEXT}</p>
          <p className="kcf-panel-text">Hemen konuşmak isterseniz:</p>
          <Channels fallback={fallback} where="success" />
          <button
            type="button"
            className="kcf-again"
            data-testid="kcf-again"
            onClick={() => {
              setValues({ name: '', phone: '', email: '', message: '' });
              setConsent(false);
              setErrors({});
              setStatus('idle');
            }}
          >
            Yeni talep oluştur
          </button>
        </div>
      ) : (
        <form className="kcf-body" onSubmit={submit} noValidate data-testid="kcf-form">
          {/* Gövdeye girmeyen ayrılmış alanlar; JSON gövdesi bunlardan değil
              state'ten kurulur, ama talebin ne taşıdığı DOM'da da görünür. */}
          <input type="hidden" name="access_key" value={accessKey} readOnly />
          <input type="hidden" name="subject" value={subject} readOnly />
          <input type="hidden" name="from_name" value="meyinsaat.com" readOnly />
          <input type="hidden" name="daire" value={daire ?? konu} readOnly />
          <input type="hidden" name="sayfa" value={sayfa} readOnly />

          {status === 'error' && (
            <div className="kcf-panel kcf-failure" data-testid="kcf-error">
              <p className="kcf-panel-title">{failureText(fallback)}</p>
              <Channels fallback={fallback} where="error" />
            </div>
          )}

          <div className="kcf-fields">
            <div className="kcf-row">
              <label htmlFor={id.name}>Ad Soyad</label>
              <input
                id={id.name}
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={set('name')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? errId.name : undefined}
                data-testid="kcf-name"
              />
              {errors.name && (
                <p className="kcf-err" id={errId.name} data-testid="kcf-err-name">{errors.name}</p>
              )}
            </div>

            <div className="kcf-row">
              <label htmlFor={id.phone}>Telefon</label>
              <input
                id={id.phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={values.phone}
                onChange={set('phone')}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? errId.phone : undefined}
                data-testid="kcf-phone"
              />
              {errors.phone && (
                <p className="kcf-err" id={errId.phone} data-testid="kcf-err-phone">{errors.phone}</p>
              )}
            </div>

            <div className="kcf-row kcf-row-email">
              <label htmlFor={id.email}>E-posta <span className="kcf-optional">(isteğe bağlı)</span></label>
              <input
                id={id.email}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={set('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? errId.email : undefined}
                data-testid="kcf-email"
              />
              {errors.email && (
                <p className="kcf-err" id={errId.email} data-testid="kcf-err-email">{errors.email}</p>
              )}
            </div>

            <div className="kcf-row kcf-row-msg">
              <label htmlFor={id.message}>Mesaj <span className="kcf-optional">(isteğe bağlı)</span></label>
              <textarea
                id={id.message}
                rows={3}
                value={values.message}
                placeholder="Örn. Daireyi hafta sonu görebilir miyim?"
                onChange={set('message')}
                data-testid="kcf-message"
              />
            </div>
          </div>

          <div className="kcf-consent">
            <input
              id={id.consent}
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? errId.consent : undefined}
              data-testid="kcf-consent"
            />
            <label htmlFor={id.consent}>
              Kişisel verilerimin iletişim amacıyla işlenmesini kabul ediyorum.{' '}
              <a href={privacyHref} target="_blank" rel="noopener noreferrer" data-testid="kcf-privacy-link">
                Gizlilik ve Çerez Politikası
              </a>
            </label>
          </div>
          {errors.consent && (
            <p className="kcf-err" id={errId.consent} data-testid="kcf-err-consent">{errors.consent}</p>
          )}

          {/* bal küpü — insanlara görünmez, botları yakalar. Gövde elle kurulduğu
              için Web3Forms'un botcheck denetimi gizleme yönteminden etkilenmez. */}
          <input
            ref={honeypot}
            type="checkbox"
            name="botcheck"
            className="kcf-hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <button
            type="submit"
            className="kcf-submit"
            disabled={!hydrated || status === 'sending'}
            data-testid="kcf-submit"
          >
            {status === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
          </button>
          <p className="kcf-privacy">Bilgileriniz yalnız size dönüş için kullanılır.</p>
        </form>
      )}

      {/* JS kapalıysa ada hidratlanmaz ve Gönder ölü kalır: formu gizleyip
          kanalları göster (Base.astro <html>'e .js sınıfını ekler). */}
      <div className="kcf-nojs">
        <p className="kcf-panel-title">Formu açmak için JavaScript gerekiyor</p>
        <p className="kcf-panel-text">{konu} için doğrudan ulaşın:</p>
        <Channels fallback={fallback} where="nojs" />
      </div>
    </div>
  );
}
