/*
  "Hızlı Bilgi Alın" mini formu — VİTRİN sürümü: gerçek gönderim yok; doğrulama,
  gönderim, başarı ve hata durumları canlandırılır. Sonuç, formun üstündeki
  açıkça işaretli vitrin kontrolüyle seçilir (shared/ViewingForm ile aynı disiplin,
  ray/band için sıkılaştırılmış alan seti).
*/
import { useState } from 'react';

interface Props {
  /** hangi daire hakkında — konu satırına yazılır */
  konu: string;
  /** geniş (iki sütun) yerleşim — vitrin B bandı */
  wide?: boolean;
}

type Status = 'idle' | 'sending' | 'success' | 'failure';

export default function RailForm({ konu, wide = false }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [demo, setDemo] = useState<'success' | 'failure'>('success');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Lütfen adınızı yazın.';
    if (!contact.trim()) next.contact = 'Telefon ya da e-posta gerekli.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStatus('sending');
    window.setTimeout(() => setStatus(demo), 800);
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
      <fieldset className="kcf-demo" data-testid="kcf-demo">
        <legend className="t-tech">VİTRİN KONTROLÜ — sonucu seç:</legend>
        {(['success', 'failure'] as const).map((k) => (
          <label key={k} className="t-tech kcf-demo-opt">
            <input type="radio" name={`kcf-demo-${konu}`} checked={demo === k} onChange={() => setDemo(k)} data-testid={`kcf-demo-${k}`} />
            {k === 'success' ? 'Başarılı' : 'Hatalı'}
          </label>
        ))}
      </fieldset>

      {status === 'failure' && (
        <div className="kcf-failure" role="alert" data-testid="kcf-failure">
          <p className="kcf-panel-title">Gönderilemedi</p>
          <p className="kcf-panel-text">Bağlantı sorunu canlandırıldı — tekrar deneyin.</p>
        </div>
      )}

      <div className="kcf-fields">
        <div className="kcf-row">
          <label htmlFor={`kcf-name-${wide}`}>Ad Soyad</label>
          <input
            id={`kcf-name-${wide}`}
            type="text"
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

      <button type="submit" className="kcf-submit" disabled={status === 'sending'} data-testid="kcf-submit">
        {status === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
      </button>
      <p className="kcf-privacy">Bilgileriniz yalnız dönüş için kullanılır.</p>
    </form>
  );
}
