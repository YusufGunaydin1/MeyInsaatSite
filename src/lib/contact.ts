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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadFields {
  accessKey: string;
  /** hangi daire/konu hakkında */
  konu: string;
  name: string;
  /** ziyaretçinin telefonu VEYA e-postası */
  contact: string;
  message: string;
}

/** Web3Forms gövdesi. `contact` telefon da olabilir e-posta da; ikisini de korur. */
export function leadPayload({ accessKey, konu, name, contact, message }: LeadFields) {
  const trimmedContact = contact.trim();
  const isEmail = EMAIL_RE.test(trimmedContact);
  return {
    access_key: accessKey,
    subject: `Web sitesi talebi — ${konu}`,
    name: name.trim(),
    // e-posta verildiyse yanıt adresi olur; telefonsa gövdede tam olarak durur
    email: isEmail ? trimmedContact : 'bildirim@meyinsaat.com',
    message: [message.trim(), `Konu: ${konu}`, `İletişim: ${trimmedContact}`]
      .filter(Boolean)
      .join('\n'),
    botcheck: '',
  };
}
