export interface ContactNumber {
  display: string;
  e164: string;
}

const E164 = /^\+[1-9]\d{7,14}$/;

export function contactNumber(value: unknown): ContactNumber | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<ContactNumber>;
  const display = typeof candidate.display === 'string' ? candidate.display.trim() : '';
  const e164 = typeof candidate.e164 === 'string' ? candidate.e164.trim() : '';

  return display && E164.test(e164) ? { display, e164 } : null;
}

export function telHref(value: unknown): string | null {
  const number = contactNumber(value);
  return number ? `tel:${number.e164}` : null;
}

/** `message` verilirse sohbet o cümleyle açılır: ziyaretçi ilk satırı yazmak
    zorunda kalmaz ve talep, hangi daire için geldiği belli olarak düşer. */
export function whatsappHref(value: unknown, message?: string): string | null {
  const number = contactNumber(value);
  if (!number) return null;
  const base = `https://wa.me/${number.e164.slice(1)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/*
  Lead delivery — the site is static (GitHub Pages) with a public repo, so it
  can hold no mail credentials. Web3Forms relays a browser POST to the verified
  inbox (company.contact.email); its access key is public by design and only
  ever sends to that one address. No submission data is stored in this repo.
*/
export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/** Web3Forms her gönderimde geçerli bir `email` ister; ziyaretçi yalnız telefon
    bıraktıysa gönderen olarak bu adres kullanılır, telefon gövdede tam durur. */
const NO_EMAIL_SENDER = 'bildirim@meyinsaat.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/*
  Türkiye numaraları elle çok farklı yazılır: "0532 625 68 12", "532 625 68 12",
  "+90 532 625 68 12", "+90-532-625-68-12". Biçimi dayatmak yerine yalnız rakam
  sayısına bakılır — geçerli bir numarayı reddetmek satış kaybıdır.
*/
export function isValidTrPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export interface LeadFields {
  accessKey: string;
  /** e-posta konu satırının tamamı — sayfaya göre çağıran belirler */
  subject: string;
  /** hangi daire hakkında; talebin bağlamı */
  daire: string;
  /** formun gönderildiği tam adres */
  sayfa: string;
  name: string;
  phone: string;
  /** isteğe bağlı */
  email: string;
  message: string;
}

/*
  Web3Forms gövdesi. `access_key`, `subject`, `from_name`, `botcheck` ayrılmış
  alanlardır; `telefon`, `daire`, `sayfa` özel alan olarak e-postaya tabloda düşer.
*/
export function leadPayload({
  accessKey,
  subject,
  daire,
  sayfa,
  name,
  phone,
  email,
  message,
}: LeadFields) {
  const trimmedEmail = email.trim();
  const hasEmail = isValidEmail(trimmedEmail);
  const trimmedPhone = phone.trim();
  return {
    access_key: accessKey,
    subject,
    from_name: 'meyinsaat.com',
    name: name.trim(),
    // e-posta verildiyse yanıt doğrudan ziyaretçiye gider
    email: hasEmail ? trimmedEmail : NO_EMAIL_SENDER,
    telefon: trimmedPhone,
    daire,
    sayfa,
    // Gönderen adresi vekil olabildiği için telefon/e-posta gövdede de yazılır.
    message: [
      message.trim(),
      `Telefon: ${trimmedPhone}`,
      hasEmail ? `E-posta: ${trimmedEmail}` : 'E-posta: verilmedi',
    ]
      .filter(Boolean)
      .join('\n'),
    botcheck: '',
  };
}
