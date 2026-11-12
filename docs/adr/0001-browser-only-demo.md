# The demo runs in the browser, with no backend

The TEKGUYZ demo standard expects a Supabase anonymous sign-in per Demo Visitor. For Book Your Visit we chose a browser-only demo instead, like FancyFam, Missed Call Follow-Up and No-Show Rescue (their ADR 0001). The sample week is built in the page from the visitor's own date. Visits, blocks and drafted messages live in the page's own memory, and a reload starts over. Every visitor is walled off by design, nothing costs money, and there is no sign-in, visit cap or cleanup job to build.

Nothing is ever sent. The confirmation, the move and cancel notices and the owner's texts are drawn on screen and listed under "What would go out"; no SMS or email leaves the browser. The booking form is filled with made-up details, and the email field is read-only, so a visitor is never asked for their own.

All rules live in one pure engine (`lib/demo/engine.ts`) that a real backend could run on the server. It already behaves like one: it refuses a time that is no longer open, even when the screen still offered it.

## Consequences

- The standard's server rules (POST-only sign-in, RLS walls, visit cap, 7-day cleanup) have nothing to guard. Do not "fix" the demo by adding them.
- "Try the demo" is a plain link, because opening the demo writes nothing on a server.
- The landing page has no form and no sign-in page; the footer credit is the only way to get in touch.
