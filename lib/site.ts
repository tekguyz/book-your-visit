// The product's public address and the words every link preview uses.
// The product has a plain name, never TEKGUYZ (DEMO-STANDARD.md). The demo
// plays a made-up Sample Business: see lib/demo/business.ts.

export const siteName = "Book Your Visit";
export const siteTagline = "Customers pick a time themselves.";
export const siteDescription =
  "An online booking page for home-service businesses. Customers pick a service, see only the times you are free, book in a minute, and change or cancel without a call. Try the one-click demo.";

/**
 * The address search engines and link previews should use. On Vercel this is
 * the project's production domain (or SITE_URL when the domain differs);
 * locally it is localhost.
 */
export function siteUrl(): URL {
  if (process.env.SITE_URL) return new URL(process.env.SITE_URL);
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(production ? `https://${production}` : "http://localhost:3000");
}
