import { useEffect, useRef, useState } from 'react';

type DemoScenario = 'success' | 'error';
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface Props {
  initialApartment?: string;
}

interface FormValues {
  apartment: string;
  name: string;
  contact: string;
  method: string;
  availability: string;
  date: string;
  message: string;
  acknowledgement: boolean;
}

const initialValues: FormValues = {
  apartment: '',
  name: '',
  contact: '',
  method: '',
  availability: '',
  date: '',
  message: '',
  acknowledgement: false,
};

export default function ViewingForm({ initialApartment = '' }: Props) {
  const [values, setValues] = useState<FormValues>({ ...initialValues, apartment: initialApartment });
  const [scenario, setScenario] = useState<DemoScenario>('success');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const summary = useRef<HTMLDivElement | null>(null);
  const result = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('daire');
    if (requested === 'daire-1' || requested === 'daire-2') {
      setValues((current) => ({ ...current, apartment: requested }));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) summary.current?.focus();
  }, [errors]);

  useEffect(() => {
    if (status === 'success' || status === 'error') result.current?.focus();
  }, [status]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.apartment) next.apartment = 'İlgilendiğiniz daireyi seçin.';
    if (values.name.trim().length < 2) next.name = 'Adınızı en az 2 karakterle yazın.';
    if (!values.method) next.method = 'Tercih ettiğiniz iletişim yöntemini seçin.';
    if (!values.contact.trim()) {
      next.contact = 'Telefon veya e-posta bilginizi yazın.';
    } else if (values.method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)) {
      next.contact = 'Geçerli bir e-posta adresi yazın.';
    } else if (values.method === 'phone' && values.contact.replace(/\D/g, '').length < 10) {
      next.contact = 'En az 10 haneli bir telefon numarası yazın.';
    }
    if (!values.availability) next.availability = 'Genel uygunluğunuzu belirtin.';
    if (values.availability === 'specific' && !values.date) next.date = 'Tercih ettiğiniz tarihi seçin.';
    if (!values.acknowledgement) next.acknowledgement = 'Gösterim notunu onaylayın.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    window.setTimeout(() => setStatus(scenario), 700);
  };

  const startAgain = () => {
    setStatus('idle');
    setErrors({});
    window.requestAnimationFrame(() => document.getElementById('sd-form-apartment')?.focus());
  };

  if (status === 'success') {
    return (
      <div className="sd-form-result is-success" role="status" tabIndex={-1} ref={result} data-testid="sd-form-success">
        <span aria-hidden="true">✓</span>
        <p className="sd-eyebrow">Demo başarı durumu</p>
        <h2>Talep demo olarak hazırlandı.</h2>
        <p>Herhangi bir veri gönderilmedi. Üretim sürümünde onaylı iletişim akışı bu adımda devreye girecektir.</p>
        <button type="button" className="sd-button sd-button-secondary" onClick={startAgain}>Yeni demo talebi</button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="sd-form-result is-error" role="alert" tabIndex={-1} ref={result} data-testid="sd-form-error-state">
        <span aria-hidden="true">!</span>
        <p className="sd-eyebrow">Kontrollü hata durumu</p>
        <h2>Demo gönderimi tamamlanamadı.</h2>
        <p>Bu yalnız arayüz incelemesi için oluşturulan hata durumudur. Hiçbir bilgi gönderilmedi.</p>
        <button type="button" className="sd-button sd-button-secondary" onClick={startAgain}>Forma geri dön</button>
      </div>
    );
  }

  return (
    <form className="sd-viewing-form" onSubmit={submit} noValidate data-testid="sd-viewing-form">
      {Object.values(errors).filter(Boolean).length > 0 && (
        <div className="sd-form-summary" role="alert" tabIndex={-1} ref={summary} data-testid="sd-form-summary">
          <strong>Devam etmeden önce şu alanları düzeltin:</strong>
          <ul>{Object.values(errors).filter(Boolean).map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      <div className="sd-field sd-field-wide">
        <label htmlFor="sd-form-apartment">İlgilendiğiniz daire <span>*</span></label>
        <select
          id="sd-form-apartment"
          value={values.apartment}
          aria-invalid={Boolean(errors.apartment)}
          aria-describedby={errors.apartment ? 'sd-error-apartment' : undefined}
          onChange={(event) => update('apartment', event.target.value)}
        >
          <option value="">Seçin</option>
          <option value="daire-1">Daire 1</option>
          <option value="daire-2">Daire 2</option>
          <option value="both">İki daire</option>
          <option value="undecided">Henüz karar vermedim</option>
        </select>
        {errors.apartment && <small className="sd-field-error" id="sd-error-apartment">{errors.apartment}</small>}
      </div>

      <div className="sd-field">
        <label htmlFor="sd-form-name">Adınız <span>*</span></label>
        <input
          id="sd-form-name"
          type="text"
          autoComplete="name"
          value={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'sd-error-name' : undefined}
          onChange={(event) => update('name', event.target.value)}
        />
        {errors.name && <small className="sd-field-error" id="sd-error-name">{errors.name}</small>}
      </div>

      <div className="sd-field">
        <label htmlFor="sd-form-contact">İletişim bilgisi <span>*</span></label>
        <input
          id="sd-form-contact"
          type="text"
          inputMode={values.method === 'phone' ? 'tel' : 'email'}
          autoComplete={values.method === 'phone' ? 'tel' : 'email'}
          value={values.contact}
          placeholder="Telefon veya e-posta"
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? 'sd-error-contact' : 'sd-help-contact'}
          onChange={(event) => update('contact', event.target.value)}
        />
        <small id="sd-help-contact">Seçtiğiniz yönteme uygun bilgiyi yazın.</small>
        {errors.contact && <small className="sd-field-error" id="sd-error-contact">{errors.contact}</small>}
      </div>

      <fieldset className="sd-field sd-field-wide sd-choice-field">
        <legend>Tercih edilen iletişim yöntemi <span>*</span></legend>
        <div className="sd-choice-row">
          <label className={values.method === 'phone' ? 'is-selected' : ''}>
            <input type="radio" name="method" value="phone" checked={values.method === 'phone'} onChange={() => update('method', 'phone')} />
            Telefon
          </label>
          <label className={values.method === 'email' ? 'is-selected' : ''}>
            <input type="radio" name="method" value="email" checked={values.method === 'email'} onChange={() => update('method', 'email')} />
            E-posta
          </label>
        </div>
        {errors.method && <small className="sd-field-error">{errors.method}</small>}
      </fieldset>

      <div className="sd-field">
        <label htmlFor="sd-form-availability">Uygunluk <span>*</span></label>
        <select
          id="sd-form-availability"
          value={values.availability}
          aria-invalid={Boolean(errors.availability)}
          onChange={(event) => update('availability', event.target.value)}
        >
          <option value="">Seçin</option>
          <option value="specific">Belirli bir tarih</option>
          <option value="weekday">Hafta içi</option>
          <option value="weekend">Hafta sonu</option>
          <option value="flexible">Esneğim</option>
        </select>
        {errors.availability && <small className="sd-field-error">{errors.availability}</small>}
      </div>

      <div className="sd-field">
        <label htmlFor="sd-form-date">Tercih edilen tarih {values.availability === 'specific' ? <span>*</span> : <small>(isteğe bağlı)</small>}</label>
        <input
          id="sd-form-date"
          type="date"
          value={values.date}
          aria-invalid={Boolean(errors.date)}
          onChange={(event) => update('date', event.target.value)}
        />
        {errors.date && <small className="sd-field-error">{errors.date}</small>}
      </div>

      <div className="sd-field sd-field-wide">
        <label htmlFor="sd-form-message">Mesajınız <small>(isteğe bağlı)</small></label>
        <textarea
          id="sd-form-message"
          rows={4}
          value={values.message}
          placeholder="Fiyat, alan, teknik detaylar veya görmek istediğiniz bölümler…"
          onChange={(event) => update('message', event.target.value)}
        />
      </div>

      <fieldset className="sd-field sd-field-wide sd-demo-field">
        <legend>Vitrin gönderim senaryosu</legend>
        <p>Bu kontrol yalnız başarı ve hata tasarımlarını incelemek içindir.</p>
        <div className="sd-choice-row">
          <label className={scenario === 'success' ? 'is-selected' : ''}>
            <input type="radio" name="scenario" checked={scenario === 'success'} onChange={() => setScenario('success')} />
            Başarıyı göster
          </label>
          <label className={scenario === 'error' ? 'is-selected' : ''}>
            <input type="radio" name="scenario" checked={scenario === 'error'} onChange={() => setScenario('error')} />
            Hatayı göster
          </label>
        </div>
      </fieldset>

      <label className="sd-consent sd-field-wide">
        <input
          type="checkbox"
          checked={values.acknowledgement}
          onChange={(event) => update('acknowledgement', event.target.checked)}
        />
        <span>Bu formun gösterim amaçlı olduğunu ve gerçek veri göndermediğini anlıyorum. <b>*</b></span>
      </label>
      {errors.acknowledgement && <small className="sd-field-error sd-field-wide">{errors.acknowledgement}</small>}

      <div className="sd-form-actions sd-field-wide">
        <button type="submit" className="sd-button sd-button-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Demo hazırlanıyor…' : 'Demo talebi hazırla'}
        </button>
        <p>Gönderim sırasında hiçbir API çağrısı yapılmaz.</p>
      </div>
    </form>
  );
}
