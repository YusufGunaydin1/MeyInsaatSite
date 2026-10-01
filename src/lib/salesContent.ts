import { messageScopes } from './salesMessageScopes';
import type { Locale } from './i18n';
import type { Messages } from './translate';

// Loaded on the server. React islands receive only the selected language.
const catalogs = import.meta.glob<{ default: Messages }>('../../content/sales/*.json', { eager: true });

export function salesMessages(locale: Locale): Messages {
  if (locale === 'tr') return {};
  const catalog = catalogs[`../../content/sales/${locale}.json`]?.default;
  if (!catalog) throw new Error(`Missing sales translation catalog: ${locale}`);
  return catalog;
}

/** Avoid serializing a page's full prose catalog into every small React island. */
export function islandMessages(messages: Messages, scope: keyof typeof messageScopes): Messages {
  const keys: readonly string[] = scope === 'listing'
    ? [...messageScopes.listing, ...messageScopes.form, ...messageScopes.maps]
    : messageScopes[scope];
  return Object.fromEntries(keys.filter(key => key in messages).map(key => [key, messages[key]]));
}
