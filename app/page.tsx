import Link from "next/link";
import { primaryButton } from "@/components/buttons";
import { BanIcon, CalendarIcon, ClockIcon, MailIcon, RepeatIcon } from "@/components/icons";
import { ProductLogo } from "@/components/logo";
import { business } from "@/lib/demo/business";

// The landing page (DEMO-STANDARD.md, "What they get"). It sells the idea by
// itself and opens the demo with one press. "Try the demo" is a plain link:
// opening the demo writes nothing on a server (ADR 0001).
// Copy rules: no prices, no statistics, no setup-time claims, no phone numbers.
// The words follow tekguyz-one brand/solutions.md, Custom Web Apps offering 4.

const demoHref = "/demo";

const steps = [
  { title: "Pick a service", body: "Each one knows how long it takes, so the page never offers a time that cannot fit." },
  { title: "See only open times", body: "Times you are booked, blocked or driving between homes never show up." },
  { title: "Book in a minute", body: "Name, area, done. The customer gets a confirmation, and you get a text." },
  { title: "Change or cancel, no call", body: "One link moves the visit or cancels it, and the time opens up again." },
];

const ownerGets = [
  { icon: <CalendarIcon />, text: "Your day at a glance: every visit, who, what and where, and the open gaps between them." },
  { icon: <BanIcon />, text: "Block off an hour or an afternoon in two taps. It disappears from the booking page at once." },
  { icon: <ClockIcon />, text: "Room to drive between homes is kept free for you, so visits never stack up back to back." },
  { icon: <MailIcon />, text: "A text when someone books, moves or cancels. No more phone tag to set a time." },
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
        <section className="mx-auto grid w-full max-w-[72rem] items-center gap-12 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:pt-14 lg:pb-24">
          <div>
            <p className="text-label text-brand">Online booking for home-service businesses</p>
            <h1 className="mt-3 max-w-[14ch] font-display text-display">Customers pick a time themselves.</h1>
            <p className="mt-5 max-w-[52ch] text-body text-ink-muted">
              A booking page in your name. Customers choose a service, see only the times you are really free, and book in a minute. They can
              change or cancel without calling, and you see it all on your day.
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
              How it works for your customers
            </h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft font-display text-label text-brand">{i + 1}</span>
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
              What you see as the owner
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {ownerGets.map((line) => (
                <li key={line.text} className="flex gap-3 text-body">
                  <span className="mt-0.5 shrink-0 text-brand">{line.icon}</span>
                  {line.text}
                </li>
              ))}
            </ul>
          </div>
          <DayPreview />
        </section>

        <section aria-labelledby="try" className="bg-night text-on-night">
          <div className="mx-auto flex w-full max-w-[72rem] flex-col items-start gap-5 px-4 py-16 sm:px-6">
            <h2 id="try" className="max-w-[26ch] font-display text-headline">
              See it with a made-up cleaning company
            </h2>
            <p className="max-w-[60ch] text-body text-on-night-muted">
              The demo plays {business.name}, a made-up business in {business.region}. Book a cleaning as the customer, watch it land on the
              owner&apos;s day, block off time as the owner, then move or cancel your visit. Nothing is sent, and nothing leaves your browser.
            </p>
            <Link href={demoHref} className={primaryButton}>
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
  const times = ["8:30 AM", "9:00 AM", "10:30 AM", "11:00 AM", "1:00 PM", "2:30 PM"];
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[24rem] pb-20">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_60px_-24px_rgb(27_34_50/0.4)]">
        <p className="text-micro text-ink-muted">Deep clean · about 3 hours</p>
        <p className="mt-1 font-display text-title">Pick a time</p>
        <div className="mt-3 flex gap-1.5">
          {[
            ["Wed", "18"],
            ["Thu", "19"],
            ["Fri", "20"],
            ["Sat", "21"],
            ["Sun", "22"],
          ].map(([d, n], i) => (
            <span key={d} className={`flex w-12 flex-col items-center rounded-xl border py-2 ${i === 1 ? "border-brand bg-brand text-white" : i === 4 ? "border-transparent text-ink-muted/60" : "border-line"}`}>
              <span className="text-micro">{d}</span>
              <span className="text-body font-semibold">{n}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {times.map((t) => (
            <span key={t} className={`flex min-h-10 items-center justify-center rounded-lg text-label ${t === "10:30 AM" ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-6 bottom-0 rounded-2xl border border-line bg-surface p-4 shadow-lg">
        <p className="flex items-center gap-2 text-label">
          <RepeatIcon width={16} height={16} className="text-brand" /> You&apos;re booked: Thu at 10:30 AM
        </p>
        <p className="mt-1 text-label font-normal text-ink-muted">Change the time or cancel from your email.</p>
      </div>
    </div>
  );
}

function DayPreview() {
  const rows = [
    ["8:00 AM", "Marisa T.", "Standard clean", "visit"],
    ["10:30 AM", "Dana K.", "Booked online", "new"],
    ["1:00 PM", "Blocked", "Supply run", "block"],
    ["3:00 PM", "Open", "On the booking page", "open"],
  ] as const;
  return (
    <div aria-hidden className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 font-display text-title">
        <CalendarIcon className="text-brand" /> Thursday
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map(([time, who, what, kind]) => (
          <li
            key={time}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-label ${
              kind === "new" ? "border-accent bg-accent-soft" : kind === "block" ? "hatch border-line" : kind === "open" ? "border-dashed border-line font-normal text-ink-muted" : "border-line bg-paper"
            }`}
          >
            <span className="w-18 shrink-0 tabular-nums">{time}</span>
            <span className="truncate">{who}</span>
            <span className={`ml-auto shrink-0 text-micro ${kind === "new" ? "rounded-full bg-accent px-2 py-0.5 font-semibold text-white" : "text-ink-muted"}`}>{what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
