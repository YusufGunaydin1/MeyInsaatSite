/** Convert a site-absolute route ('/kurumsal', '/ar', '/') into a baseURL-relative
 *  path so the /MeyInsaatSite base path survives Playwright's URL resolution. */
export function u(path: string): string {
  const rel = path.replace(/^\/+/, '');
  return rel === '' ? '.' : rel;
}
