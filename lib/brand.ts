// The marks, drawn once. The favicon (app/icon.svg), the home-screen icon,
// the link preview and the logo on the page all use these.
//
// An SVG string cannot read CSS variables, so these hex values copy the
// tokens in app/globals.css. Change both together.

export const colors = {
  paper: "#FBF6EE",
  ink: "#1F2A37",
  inkMuted: "#5A6270",
  brand: "#B8431F",
  sea: "#1F6F78",
} as const;

/**
 * Product mark, "Door open at four": a house with a clock face in the door,
 * hands set to four. Coral square, white line art.
 */
export const PRODUCT_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${colors.brand}"/><g fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 15.5 16 7l9.5 8.5"/><path d="M9 14v11h14V14"/><path d="M16 17.5V21l2.4 1.4"/></g></svg>`;

/** The Sample Business's own mark: a small coquina shell on sea green. */
export const COQUINA_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${colors.sea}"/><g fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 22.5C6.5 14.5 10.5 8.5 16 8.5s9.5 6 9.5 14Z"/><path d="M16 8.5v14M11.5 10.5l1.5 12M20.5 10.5 19 22.5"/></g></svg>`;
