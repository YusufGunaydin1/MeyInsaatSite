import { company } from '../../../lib/content';
import { contactNumber, telHref } from '../../../lib/contact';
import { localePath } from '../../../lib/i18n';

const phone = contactNumber(company.contact.phone);
const phoneHref = telHref(company.contact.phone);
const email = company.contact.email;
const address = company.contact.address;

if (!phone?.display || !phoneHref || !email || !address) {
  throw new Error('[iletisim-lab] Doğrulanmış genel iletişim bilgileri eksik.');
}

export const contactFacts = {
  phone: phone.display,
  phoneHref,
  email,
  emailHref: `mailto:${email}`,
  address,
};

export const inquiryRoutes = [
  {
    number: '01',
    title: 'Satılık daire',
    text: 'Güncel daireleri, fiyatları ve satış danışmanı kanalını inceleyin.',
    href: localePath('tr', '/satilik-daireler'),
    action: 'Satılıkları gör',
  },
  {
    number: '02',
    title: 'Projeler',
    text: 'Tamamlanan ve devam eden yapıların detaylarına geçin.',
    href: localePath('tr', '/projeler'),
    action: 'Projeleri incele',
  },
  {
    number: '03',
    title: 'Kurumsal konu',
    text: 'İş birliği ve şirket konuları için genel e-posta kanalını kullanın.',
    href: `mailto:${email}`,
    action: 'E-posta gönder',
  },
] as const;
