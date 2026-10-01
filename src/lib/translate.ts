export type Messages = Record<string, string>;

/** Source-language messages stay readable at the call site; values hold translations. */
export function translator(messages: Messages = {}) {
  return (source: string, values: Record<string, string | number> = {}) => {
    const text = (messages[source] ?? source).replace(/\{(\w+)\}/g, (match, key) =>
      values[key] === undefined ? match : String(values[key])
    );
    // Keep apartment layouts such as 3+2 in their source order in Arabic prose.
    return /[\u0600-\u06ff]/.test(text)
      ? text.replace(/\d+(?:\+\d+)+/g, '\u2066$&\u2069')
      : text;
  };
}
