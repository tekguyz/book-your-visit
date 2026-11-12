// The marks, drawn once. The favicon (app/icon.svg), the home-screen icon,
// the link preview, the README banner and the logo on the page all use these.
//
// An SVG string cannot read CSS variables, so these hex values copy the
// tokens in app/globals.css. Change both together.

export const colors = {
  paper: "#F7F4EE",
  surface: "#FFFFFF",
  line: "#DCD5C7",
  ink: "#1B2232",
  inkMuted: "#586073",
  brand: "#2B4C9B",
  brandSoft: "#E4EAF6",
  accent: "#B45A0C",
  accentSoft: "#F8E6D2",
} as const;

/** Product mark, "Booked at home": a house with a check, on heron blue. */
export const PRODUCT_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${colors.brand}"/><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 15 16 7.5l9.5 7.5"/><path d="M9.5 13v11h13V13"/><path d="m12.5 18.5 2.5 2.5 4.5-4.5"/></g></svg>`;

/** The Sample Business's own mark: a small sparkle on ink. Shown only in the demo. */
export const TIDY_HERON_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${colors.ink}"/><path d="M14 7c.7 4.4 2.3 6 6.7 6.7-4.4.7-6 2.3-6.7 6.7-.7-4.4-2.3-6-6.7-6.7C11.7 13 13.3 11.4 14 7Z" fill="#fff"/><path d="M22 18.5c.4 2.2 1.1 2.9 3.3 3.3-2.2.4-2.9 1.1-3.3 3.3-.4-2.2-1.1-2.9-3.3-3.3 2.2-.4 2.9-1.1 3.3-3.3Z" fill="${colors.accentSoft}"/></svg>`;
