---
name: Book Your Visit
description: A sunny Florida booking page. Cream paper, one coral that means "your choice", one sea green that means "open and yours to take".
colors:
  paper: "#FBF6EE"
  surface: "#FFFFFF"
  sunk: "#F1E8DA"
  line: "#E2D6C3"
  ink: "#1F2A37"
  ink-muted: "#5A6270"
  brand: "#B8431F"
  brand-deep: "#963415"
  brand-soft: "#F9E3D8"
  sea: "#1F6F78"
  sea-deep: "#17565D"
  sea-soft: "#DCEEEF"
  night: "#1F2A37"
  on-night: "#FBF6EE"
  on-night-muted: "#B9C0CA"
typography:
  display: { fontFamily: "Fraunces", fontSize: "2.75rem (4rem from 1024px)", fontWeight: 700, lineHeight: 1.04 }
  headline: { fontFamily: "Fraunces", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.15 }
  title: { fontFamily: "Fraunces", fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3 }
  body: { fontFamily: "Figtree", fontSize: "1rem", fontWeight: 400, lineHeight: 1.55 }
  label: { fontFamily: "Figtree", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4 }
  micro: { fontFamily: "Figtree", fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.35 }
---

# Design rules

The rulebook for every screen. Tokens live in `app/globals.css`; hex copies for drawn images live in `lib/brand.ts`. Change this file first.

## The idea

One page, two sides of the same visit. The customer's side is a bright public booking page. The owner's side is the same paper, calmer and denser: a list of the day. A booking made on one side shows up on the other at once.

## Color

1. **Coral** (`brand`) means a choice or an action: the chosen time, a note that needs attention.
2. **Sea green** (`sea`) means the visit is yours: the chosen day, the confirmation, a booking you made.
3. Everything else is ink on cream. Blocked time is a dashed outline on a sunk fill, never a color.
4. Light theme only. The "what would go out" note is dark (`night`) because it is a different thing: a message, not the page.

## Type

Fraunces for display, headline and title. Figtree for everything else. Six sizes only, as tokens: `text-display`, `text-headline`, `text-title`, `text-body`, `text-label`, `text-micro`. Tailwind's own sizes are off.

## Layout

- Landing page: one column up to 1024px, a max width of 72rem, a 16px side gutter on phones.
- Demo: a header with the Sample Business's mark and a two-tab switch, "Customer: booking page" and "Owner: the day". The owner tab shows a coral dot when a booking changed.
- The day strip scrolls sideways on a phone. Touch targets are at least 44px.

## Logo

**"Door open at four"** (Claude's pick, no options page this time): a house with a clock face in the door, hands set to four, white line on coral. `PRODUCT_MARK_SVG` in `lib/brand.ts`, `app/icon.svg`, `app/apple-icon.tsx`, the link preview and `docs/banner.svg` all ship it. It reads as "a visit, at a time" at 16px.

The Sample Business, Coquina Home Cleaning, has its own mark (`COQUINA_MARK_SVG`): a coquina shell on sea green. It shows only inside the demo.

## Motion

Short and settling. Screens arrive with one 320ms rise (`.arrive`); nothing loops, bounces or parallaxes. Content is visible by default, and `prefers-reduced-motion: reduce` turns all of it off.
