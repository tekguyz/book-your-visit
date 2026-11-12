---
name: Book Your Visit
description: A calm paper desk in heron blue. The customer's booking page and the owner's day sit side by side, and one warm marigold only ever means "booked online, just now".
colors:
  paper: "#F7F4EE"
  surface: "#FFFFFF"
  sunk: "#EEE9DF"
  line: "#DCD5C7"
  ink: "#1B2232"
  ink-muted: "#586073"
  brand: "#2B4C9B"
  brand-deep: "#1F3A7A"
  brand-soft: "#E4EAF6"
  accent: "#B45A0C"
  accent-soft: "#F8E6D2"
  danger: "#A3271D"
  night: "#1B2232"
  on-night: "#F7F4EE"
  on-night-muted: "#AEB5C6"
typography:
  display: { fontFamily: "Young Serif", fontSize: "2.625rem (3.75rem from 1024px)", fontWeight: 400, lineHeight: 1.05 }
  headline: { fontFamily: "Young Serif", fontSize: "1.75rem", fontWeight: 400, lineHeight: 1.15 }
  title: { fontFamily: "Young Serif", fontSize: "1.1875rem", fontWeight: 400, lineHeight: 1.3 }
  body: { fontFamily: "Onest", fontSize: "1rem", fontWeight: 400, lineHeight: 1.55 }
  label: { fontFamily: "Onest", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4 }
  micro: { fontFamily: "Onest", fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.35 }
---

# Design rules

The rulebook for every screen. Tokens live in `app/globals.css`; hex copies for drawn images live in `lib/brand.ts`. Change this file first.

## The idea

A home-service business runs on a paper calendar and a phone. So the page is warm paper and ink, with a friendly serif for headings, the way a printed appointment card looks. Heron blue is the business's hand: every open time, every button, every confirmed visit. The customer's page and the owner's day use the same parts, so a visit booked on one side is plainly the same thing that lands on the other.

## Color

1. **Heron blue** (`brand`) means "you can act" or "this is booked": open times, the main button, the confirmation check.
2. **Marigold** (`accent`) means one thing: a visit booked online. The new row on the owner's day, its badge, and the dot on the "Owner's day" tab. Never decoration.
3. **Blocked time is hatched**, not colored (`.hatch`): it reads as "not open" without a new hue. Free time is a dashed outline.
4. `danger` only on the cancel confirmation and error lines.
5. Light theme only. The one dark band on the landing page is the closing call to try the demo.

## Type

Young Serif for display, headline and title (one weight). Onest for everything else. Six sizes only, as tokens: `text-display`, `text-headline`, `text-title`, `text-body`, `text-label`, `text-micro`. Tailwind's own sizes are off. Times use tabular figures.

## Layout

- Landing page: one column up to 1024px, a max width of 72rem. 16px side gutter on phones.
- Demo: from 1024px, the booking page (26rem, drawn in a small browser frame with a `.example` address) on the left, and the owner's day plus "What would go out" on the right. Below 1024px, two tabs, "Booking page" and "Owner's day"; the owner tab shows a marigold dot when something lands there.
- A "Things to try" row of four chips ticks off as the visitor goes: book, see it on the owner's day, block off time, change or cancel.
- Touch targets are at least 44px.

## Logo

**"Booked at home"**: a house outline with a check inside, white on a heron-blue rounded square. Drawn once as `PRODUCT_MARK_SVG` in `lib/brand.ts`; `app/icon.svg` (favicon), `app/apple-icon.tsx` (home-screen icon), `app/opengraph-image.tsx` (link preview), the landing page header and `docs/banner.svg` all use it. Claude's own design for the Opus build of the model comparison (issue #1); by the brief, no options page this time.

The Sample Business, Tidy Heron Home Cleaning, has its own mark (`TIDY_HERON_MARK_SVG`): two sparkles on ink. It shows only inside the demo.

## Motion

Motion shows a change of state, nothing else:

1. A new step, message or row arrives: a 280ms rise and fade in (`.arrive`).
2. A visit booked online lands on the owner's day: a marigold hairline draws from the left under the row, once.

Under `prefers-reduced-motion: reduce` both are off and nothing is hidden. Content is visible by default.

## Demo banner

A thin ink-on-sunk bar at the top of every demo screen: "You are in the demo. Nothing is sent to anyone." with Reset demo, Leave the demo and "Built by TEKGUYZ". It carries `data-demo-banner` so `tools/capture` hides it.
