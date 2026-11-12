<p align="center"><img src="docs/banner.svg" alt="Book Your Visit" width="100%"></p>

<p align="center">
  <img src="https://img.shields.io/badge/status-demo%20built-2b4c9b?labelColor=f7f4ee" alt="Status: demo built">
  <img src="https://img.shields.io/badge/Next.js-16-1b2232?labelColor=f7f4ee" alt="Next.js 16">
  <img src="https://img.shields.io/badge/backend-none-2b4c9b?labelColor=f7f4ee" alt="No backend">
  <img src="https://img.shields.io/badge/tests-Vitest-b45a0c?labelColor=f7f4ee" alt="Tests: Vitest">
</p>

**Customers pick a time themselves: a landing page and a one-click demo of an online booking portal for home-service businesses.**

Not deployed yet. See issue #1 for what is left.

## Status

| Row | |
|---|---|
| Phase | Demo built (Opus build of the model comparison), not deployed |
| Shipped | Landing page and one-click demo, on branch `opus-build` |
| Next | Founder picks a build, then Vercel and showcase pictures: issue #1 |
| Updated | 2026-11-11 |

## What it does

- A landing page that explains the portal in four steps and opens the demo with one press.
- The demo plays Tidy Heron Home Cleaning, a made-up cleaning company in Broward County. The visitor plays a customer, Dana K., and the owner, Yolanda.
- The customer picks a service (each has a length), then a day and an open time. Only times that fit are shown: inside opening hours, never on Sunday, never over blocked time, and with 30 minutes to drive between homes.
- Booking shows a confirmation and the email that would go out. The customer can change the time or cancel; the old time opens up again.
- The owner's day lists every visit, the free gaps and the blocked time. The visit booked online lands there, marked "New".
- The owner blocks off time in two taps, and those times disappear from the booking page at once. A block can never cover a booked visit.
- "What would go out" lists every email and text the system would send, each marked "Not sent".

## What it never does

- Sends anything. No SMS, no email leaves the browser.
- Keeps anything on a server. The demo lives in the page's memory; a reload starts over (ADR 0001).
- Asks for the visitor's own details. The form is filled with made-up ones.
- Shows a real business, a real person, a price, a statistic or a phone number.
- Lets search engines index the demo. Only the landing page is indexed.

## Stack

Next.js 16 (App Router) and Tailwind 4 on Vercel. No database, no API routes. Vitest for unit tests.

## Run it locally

Needs Node 24 and npm. No env vars needed. On Vercel, `SITE_URL` may set the link-preview address if the domain differs from the project's.

```bash
npm install
npm run dev
```

## Tests

`npm run test:unit`. Never `npm test` (it fails on purpose). CI runs typecheck, lint, `test:unit` and the build on every PR.

## Docs

- `DESIGN.md`: the look, colors, type and the logo.
- `PRODUCT.md`: who it is for and the voice.
- `CONTEXT.md`: the words the code uses.
- `docs/adr/0001-browser-only-demo.md`: why there is no backend.

---

<p align="center">Built by <a href="https://tekguyz.com">TEKGUYZ</a></p>
