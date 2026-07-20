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

export function whatsappHref(value: unknown): string | null {
  const number = contactNumber(value);
  return number ? `https://wa.me/${number.e164.slice(1)}` : null;
}
