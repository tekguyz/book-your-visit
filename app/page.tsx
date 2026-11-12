import Link from "next/link";
import { primaryButton } from "@/components/buttons";
import { CalendarIcon, CheckIcon, ClockIcon, UsersIcon } from "@/components/icons";
import { ProductLogo } from "@/components/logo";
import { business } from "@/lib/demo/business";

// The landing page (DEMO-STANDARD.md, "What they get"). It sells the idea by
// itself and opens the demo with one press. "Try the demo" is a plain link:
// opening the demo writes nothing on a server (ADR 0001).
// Copy rules: no prices, no statistics, no setup-time claims, no phone numbers.
// The words follow tekguyz-one brand/solutions.md, Custom Web Apps, offering 4.

const demoHref = "/demo";

const steps = [
  { title: "Pick a service", body: "Your customer chooses what they need from your list, and sees about how long it takes." },
  { title: "See the open times", body: "Only times your crews can really take. Booked and blocked times never show up." },
  { title: "Book in one go", body: "A name and an email. The confirmation shows right away." },
  { title: "Change or cancel", body: "They move or cancel the visit themselves. The time goes back to the open list." },
];

const ownerGets = [
  { icon: <CalendarIcon />, text: "The day at a glance: who is coming, for what, and which crew has it." },
  { icon: <ClockIcon />, text: "Block off a lunch, a supply run or a day off, and it vanishes from the booking page at once." },
  { icon: <UsersIcon />, text: "No double booking. A time is open only while a crew is free for the whole visit." },
  { icon: <CheckIcon />, text: "Cancelled visits free their time for the next customer, with no phone tag." },
];

export default function LandingPage() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-[72rem] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Book Your Visit, home">
          <ProductLogo />
        </Link>
        <Link href={demoHref} className={`${primaryButton} max-sm:hidden`}>
          Try the demo
        </Link>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto grid w-full max-w-[72rem] items-center gap-12 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:pt-14 lg:pb-24">
          <div>
            <p className="text-label text-sea">An online booking page for home-service businesses</p>
            <h1 className="mt-3 max-w-[12ch] font-display text-display">Let customers pick their own time.</h1>
            <p className="mt-5 max-w-[52ch] text-body text-ink-muted">
              Your customers choose a service, see the times that are really open, and book without a phone call. They can move or cancel
              the visit on their own. You see the day, and block off the time you need.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href={demoHref} className={primaryButton}>
                Try the demo
              </Link>
              <p className="text-label font-normal text-ink-muted">One click. No signup. Nothing is sent.</p>
            </div>
          </div>
          <HeroPreview />
        </section>

        <section aria-labelledby="how" className="border-y border-line bg-surface">
          <div className="mx-auto w-full max-w-[72rem] px-4 py-16 sm:px-6">
            <h2 id="how" className="font-display text-headline">
              What your customer does
            </h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-2">
                  <span className={`flex size-9 items-center justify-center rounded-full font-display text-label ${i === 3 ? "bg-brand-soft text-brand" : "bg-sea-soft text-sea"}`}>
                    {i + 1}
                  </span>
                  <h3 className="font-display text-title">{s.title}</h3>
                  <p className="text-body text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="owner" className="mx-auto grid w-full max-w-[72rem] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 id="owner" className="font-display text-headline">
              What you see
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {ownerGets.map((line) => (
                <li key={line.text} className="flex gap-3 text-body">
                  <span className="mt-0.5 shrink-0 text-sea">{line.icon}</span>
                  {line.text}
                </li>
              ))}
            </ul>
          </div>
          <DayPreview />
        </section>

        <section aria-labelledby="try" className="bg-night text-on-night">
          <div className="mx-auto flex w-full max-w-[72rem] flex-col items-start gap-5 px-4 py-16 sm:px-6">
            <h2 id="try" className="max-w-[24ch] font-display text-headline">
              Book a visit with a made-up cleaning company
            </h2>
            <p className="max-w-[60ch] text-body text-on-night-muted">
              The demo plays {business.name}, a made-up cleaning company. You are the customer: pick a service, book a time, then move or
              cancel it. Switch to the owner&apos;s side to see your booking on the day and block off a time. Nothing is sent, and nothing
              leaves your browser.
            </p>
            <Link href={demoHref} className={`${primaryButton} bg-white text-ink hover:bg-sunk`}>
              Try the demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-[72rem] flex-wrap items-center justify-between gap-3 px-4 py-6 text-label font-normal text-ink-muted sm:px-6">
        <p>Book Your Visit</p>
        <p>
          Built by{" "}
          <a href="https://tekguyz.com" className="inline-flex min-h-11 items-center underline underline-offset-4">
            TEKGUYZ
          </a>
        </p>
      </footer>
    </>
  );
}

/** A still picture of the booking page, drawn in the page's own parts. Decorative. */
function HeroPreview() {
  const times = ["8:00 AM", "9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM"];
  return (
    <div aria-hidden className="mx-auto w-full max-w-[28rem] rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_60px_-24px_rgb(31_42_55/0.35)]">
      <p className="font-display text-title">{business.name}</p>
      <p className="mt-0.5 text-label font-normal text-ink-muted">Deep clean · about 4 hours</p>
      <div className="mt-4 grid grid-cols-5 gap-1.5 text-center text-label">
        {[["Mon", "9"], ["Tue", "10"], ["Wed", "11"], ["Thu", "12"], ["Fri", "13"]].map(([d, n], i) => (
          <div key={d} className={`rounded-xl border px-1 py-2 ${i === 2 ? "border-sea bg-sea text-white" : "border-line"}`}>
            <p className="text-micro font-semibold uppercase">{d}</p>
            <p className="font-display text-title">{n}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {times.map((t, i) => (
          <p key={t} className={`rounded-xl border px-2 py-2.5 text-center text-label ${i === 2 ? "border-brand bg-brand text-white" : "border-line"}`}>
            {t}
          </p>
        ))}
        <p className="rounded-xl border border-dashed border-line px-2 py-2.5 text-center text-label font-normal text-ink-muted/70 line-through">12:00 PM</p>
      </div>
      <p className="mt-4 rounded-xl bg-sea-soft px-3 py-2.5 text-label text-sea-deep">Wednesday at 11:00 AM is yours.</p>
    </div>
  );
}

function DayPreview() {
  const rows = [
    ["8:00 AM", "Priya N.", "Deep clean · Crew A", "sea"],
    ["8:00 AM", "Dev S.", "Standard clean · Crew B", "sea"],
    ["12:00 PM", "Blocked off", "Lunch and van check", "block"],
    ["1:00 PM", "Luz M.", "Move-out clean · Crew A", "sea"],
  ] as const;
  return (
    <div aria-hidden className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 font-display text-title">
        <CalendarIcon className="text-sea" /> Thursday
      </p>
      <ul className="mt-3">
        {rows.map(([time, name, line, tone], i) => (
          <li key={i} className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0">
            <span className="w-18 shrink-0 text-label">{time}</span>
            <span className={`min-w-0 flex-1 rounded-xl px-3 py-2 ${tone === "block" ? "border border-dashed border-ink-muted bg-sunk" : "bg-sea-soft"}`}>
              <span className="block truncate text-label">{name}</span>
              <span className="block truncate text-micro font-normal text-ink-muted">{line}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
