// The product's public address and the words every link preview uses.
// The product has a plain name, never TEKGUYZ (DEMO-STANDARD.md). The demo
// plays a made-up Sample Business: see lib/demo/business.ts.

export const siteName = "Book Your Visit";
export const siteTagline = "Customers pick their own time.";
export const siteDescription =
  "An online booking page for a home-service business: customers pick a service, see open times, book, change or cancel on their own. The owner sees the day and blocks off time. Try the one-click demo.";

/**
 * The address search engines and link previews should use. On Vercel this is
 * the project's production domain; locally it is localhost.
 */
export function siteUrl(): URL {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(production ? `https://${production}` : "http://localhost:3000");
}
