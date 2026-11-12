# Book Your Visit (`book-your-visit`)

## What this is

The landing page and one-click demo for TEKGUYZ Custom Web Apps, offering 4, "Appointment and scheduling portals": customers pick a time themselves (`tekguyz-one` `brand/solutions.md`). The demo plays Tidy Heron Home Cleaning, a made-up cleaning company in Broward County. Built to `C:/Projects/claude-config/DEMO-STANDARD.md`. Tracking issue: #1.

Next.js (App Router), Tailwind 4, Vitest, on Vercel. No backend (ADR 0001): nothing is sent, and the demo lives in the visitor's browser.

Next.js rules: @AGENTS.md

## Commands

- `npm run test:unit` for tests. Never `npm test`.
- `npm run typecheck` runs `next typegen` first, so route types exist.
- `npm run lint`.

## Rules

- Follow `DESIGN.md` for the look. Colors and type sizes are tokens in `app/globals.css`; Tailwind's own colors and sizes are off. Change `DESIGN.md` first.
- The marks live once, in `lib/brand.ts`. `app/icon.svg` must equal `PRODUCT_MARK_SVG` (a test checks it). Logo: "Booked at home", a house with a check (`DESIGN.md`).
- Never a price, a statistic, a setup-time claim or a phone number, real or placeholder. `app/__tests__/guards.test.ts` checks prices and phone numbers.
- TEKGUYZ appears only in the small "Built by TEKGUYZ" credit. Never in the app name, URL or screens.
- Never a real business name or a real person. Tidy Heron Home Cleaning was searched on 2026-11-11 and nothing uses it. Every customer is a first name and an initial. Sample emails use `example.com`; the drawn booking-page address uses `.example`.
- Every booking rule is a pure function in `lib/demo/engine.ts`; screens never change a Schedule by hand. The engine refuses a taken time even when the screen offered it. Nothing is ever sent, not even behind a flag.
- `next`, `react`, `react-dom` and `eslint-config-next` are pinned to exact versions. Bump them together.
- Follow `C:/Projects/claude-config/README-STANDARD.md` for the README. A PR that finishes a ticket updates its Status table.

## Issues and labels

New work goes to GitHub Issues (`gh` CLI). Labels: `ready-for-agent`, `ready-for-human`, `bug`, `enhancement`, `documentation`, `question`, and one Model label per issue (`opus-medium`, `sonnet-high`…). How to pick it is in the global rules.
