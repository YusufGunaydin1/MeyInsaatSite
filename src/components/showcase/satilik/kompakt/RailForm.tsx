/*
  "Hızlı Bilgi Alın" mini formu — gönderim GERÇEK: alanlar Web3Forms üzerinden
  şirketin doğrulanmış gelen kutusuna e-posta olarak iletilir (statik site,
  arka uç yok). Erişim anahtarı yoksa ya da ağ hatasında dürüst hata paneli
  ziyaretçiyi telefon/WhatsApp'a yönlendirir; hiçbir zaman sahte başarı gösterilmez.
*/
import { useRef, useState } from 'react';
import { WEB3FORMS_ENDPOINT, leadPayload } from '../../../../lib/contact';

interface Props {
  /** hangi daire hakkında — konu satırına yazılır */
  konu: string;
  /** Web3Forms erişim anahtarı (public); boşsa form hata paneline düşer */
  accessKey?: string;
  /** geniş (iki sütun) yerleşim */
  wide?: boolean;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function RailForm({ konu, accessKey = '', wide = false }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const honeypot = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Lütfen adınızı yazın.';
    if (!contact.trim()) next.contact = 'Telefon ya da e-posta gerekli.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // bal küpü doluysa bot — sessizce başarı göster, hiçbir şey gönderme
    if (honeypot.current?.value) {
      setStatus('success');
      return;
    }

    // anahtar yoksa/hatalıysa Web3Forms success:false döner → dürüst hata paneli
    setStatus('sending');
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(leadPayload({ accessKey, konu, name, contact, message })),
      });
      const data = await res.json();
      setStatus(data?.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="kcf kcf-success" role="status" data-testid="kcf-success">
        <p className="t-tech kcf-kicker">TALEP ALINDI</p>
        <p className="kcf-panel-title">Bilgi talebiniz iletildi</p>
        <p className="kcf-panel-text">{name} — {konu} hakkında en kısa sürede size dönüş yapılacak.</p>
        <button type="button" className="kcf-again" data-testid="kcf-again" onClick={() => setStatus('idle')}>
          Yeni talep oluştur
        </button>
      </div>
    );
  }

  return (
    <form className={wide ? 'kcf kcf-wide' : 'kcf'} onSubmit={submit} noValidate data-testid="kcf-form">
      {status === 'error' && (
        <div className="kcf-failure" role="alert" data-testid="kcf-error">
          <p className="kcf-panel-title">Şu an gönderilemedi</p>
          <p className="kcf-panel-text">Lütfen tekrar deneyin ya da aşağıdaki telefon/WhatsApp ile ulaşın.</p>
        </div>
      )}

      <div className="kcf-fields">
        <div className="kcf-row">
          <label htmlFor={`kcf-name-${wide}`}>Ad Soyad</label>
          <input
            id={`kcf-name-${wide}`}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            data-testid="kcf-name"
          />
          {errors.name && <p className="kcf-err" data-testid="kcf-err-name">{errors.name}</p>}
        </div>
        <div className="kcf-row">
          <label htmlFor={`kcf-contact-${wide}`}>Telefon veya e-posta</label>
          <input
            id={`kcf-contact-${wide}`}
            type="text"
            inputMode="email"
            autoComplete="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            aria-invalid={!!errors.contact}
            data-testid="kcf-contact"
          />
          {errors.contact && <p className="kcf-err" data-testid="kcf-err-contact">{errors.contact}</p>}
        </div>
        <div className="kcf-row kcf-row-msg">
          <label htmlFor={`kcf-msg-${wide}`}>Mesajınız (isteğe bağlı)</label>
          <textarea
            id={`kcf-msg-${wide}`}
            rows={2}
            value={message}
            placeholder={`${konu} hakkında bilgi almak istiyorum.`}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      {/* bal küpü — insanlara görünmez, botları yakalar */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        className="kcf-hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" className="kcf-submit" disabled={status === 'sending'} data-testid="kcf-submit">
        {status === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
      </button>
      <p className="kcf-privacy">Bilgileriniz yalnız size dönüş için kullanılır.</p>
    </form>
  );
}
