/*
  Randevu talep formu — VİTRİN sürümü: gerçek gönderim yok, API yok. Doğrulama,
  yükleniyor, başarı ve hata durumları tasarım incelemesi için canlandırılır;
  sonuç, formun üstündeki açıkça işaretli "vitrin kontrolü" ile seçilir.
*/
import { useRef, useState } from 'react';
import { form as copy } from '../data';
import './form.css';

interface Props {
  /** sayfadan gelen ön seçim (örn. Daire 2 detayından) */
  initialApartment?: string;
}

type Status = 'idle' | 'sending' | 'success' | 'failure';

export default function ViewingForm({ initialApartment = '' }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState(copy.fields.channel.options[0]);
  // Derin bağlantı: /iletisim?daire=daire-2 ilgili daireyi istemcide ön-seçer
  const [apartment, setApartment] = useState(() => {
    if (typeof window === 'undefined') return initialApartment;
    const q = new URLSearchParams(window.location.search).get('daire');
    if (q === 'daire-1') return 'Daire 1';
    if (q === 'daire-2') return 'Daire 2';
    return initialApartment;
  });
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [demo, setDemo] = useState<'success' | 'failure'>('success');
  const region = useRef<HTMLDivElement | null>(null);

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = copy.fields.name.error;
    if (!contact.trim()) next.contact = copy.fields.contact.error;
    if (!apartment) next.apartment = copy.fields.apartment.error;
    setErrors(next);
    return next;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      const firstKey = ['name', 'contact', 'apartment'].find((k) => next[k]);
      if (firstKey) document.getElementById(`svf-${firstKey}`)?.focus();
      return;
    }
    setStatus('sending');
    // Vitrin: ağ çağrısı yok — kısa bekleme, seçilen demo sonucu
    window.setTimeout(() => setStatus(demo), 900);
  }

  if (status === 'success') {
    return (
      <div className="svf-panel svf-success" role="status" data-testid="svf-success" ref={region}>
        <p className="t-tech svf-panel-kicker">TALEP ALINDI</p>
        <h3 className="svf-panel-title">{copy.success.title}</h3>
        <p>{copy.success.text}</p>
        <p className="svf-recap t-caption">
          {name} · {apartment} · {channel}
        </p>
        <button
          type="button"
          className="svf-again"
          onClick={() => { setStatus('idle'); }}
          data-testid="svf-again"
        >
          {copy.success.again}
        </button>
      </div>
    );
  }

  return (
    <form className="svf" onSubmit={submit} noValidate data-testid="svf-form">
      <fieldset className="svf-demo" data-testid="svf-demo">
        <legend className="t-tech">{copy.demoNote}</legend>
        {(['success', 'failure'] as const).map((k) => (
          <label key={k} className="t-tech svf-demo-opt">
            <input
              type="radio"
              name="svf-demo"
              checked={demo === k}
              onChange={() => setDemo(k)}
            />
            {copy.demoOptions[k]}
          </label>
        ))}
      </fieldset>

      {status === 'failure' && (
        <div className="svf-panel svf-failure" role="alert" data-testid="svf-failure">
          <h3 className="svf-panel-title">{copy.failure.title}</h3>
          <p>{copy.failure.text}</p>
        </div>
      )}

      <div className="svf-row">
        <label htmlFor="svf-name">{copy.fields.name.label}</label>
        <input
          id="svf-name"
          type="text"
          value={name}
          placeholder={copy.fields.name.placeholder}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'svf-name-err' : undefined}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="svf-err" id="svf-name-err" data-testid="svf-err-name">{errors.name}</p>}
      </div>

      <div className="svf-row">
        <label htmlFor="svf-contact">{copy.fields.contact.label}</label>
        <input
          id="svf-contact"
          type="text"
          inputMode="email"
          value={contact}
          placeholder={copy.fields.contact.placeholder}
          aria-invalid={!!errors.contact}
          aria-describedby={errors.contact ? 'svf-contact-err' : undefined}
          onChange={(e) => setContact(e.target.value)}
        />
        {errors.contact && <p className="svf-err" id="svf-contact-err" data-testid="svf-err-contact">{errors.contact}</p>}
      </div>

      <fieldset className="svf-row svf-choice">
        <legend>{copy.fields.channel.label}</legend>
        <div className="svf-opts">
          {copy.fields.channel.options.map((opt) => (
            <label key={opt} className={channel === opt ? 'is-active' : ''}>
              <input
                type="radio"
                name="svf-channel"
                checked={channel === opt}
                onChange={() => setChannel(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="svf-row svf-choice" aria-describedby={errors.apartment ? 'svf-apartment-err' : undefined}>
        <legend id="svf-apartment">{copy.fields.apartment.label}</legend>
        <div className="svf-opts">
          {copy.fields.apartment.options.map((opt) => (
            <label key={opt} className={apartment === opt ? 'is-active' : ''}>
              <input
                type="radio"
                name="svf-apartment"
                checked={apartment === opt}
                onChange={() => setApartment(opt)}
                data-testid={`svf-apartment-${opt.replace(/\s/g, '').toLowerCase()}`}
              />
              {opt}
            </label>
          ))}
        </div>
        {errors.apartment && (
          <p className="svf-err" id="svf-apartment-err" data-testid="svf-err-apartment">{errors.apartment}</p>
        )}
      </fieldset>

      <div className="svf-row">
        <label htmlFor="svf-date">{copy.fields.date.label}</label>
        <input
          id="svf-date"
          type="text"
          value={date}
          placeholder={copy.fields.date.placeholder}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="svf-hint t-caption">{copy.fields.date.hint}</p>
      </div>

      <div className="svf-row">
        <label htmlFor="svf-message">{copy.fields.message.label}</label>
        <textarea
          id="svf-message"
          rows={4}
          value={message}
          placeholder={copy.fields.message.placeholder}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button type="submit" className="svf-submit" disabled={status === 'sending'} data-testid="svf-submit">
        {status === 'sending' ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
