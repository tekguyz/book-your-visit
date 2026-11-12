"use client";

// The Sample Business's public booking page, as the customer sees it:
// service, then an open time, then details, then the confirmation with
// change and cancel. Every write goes through the engine, which refuses a
// time that was taken meanwhile (the owner may block it from the other side).

import { useState } from "react";
import { areas, business, sampleCustomer, services } from "@/lib/demo/business";
import { formatLength, formatTime, isClosed, openTimes, service, type Day } from "@/lib/demo/engine";
import type { Result, Schedule, ServiceId } from "@/lib/demo/types";
import { primaryButton, secondaryButton } from "../buttons";
import { ArrowLeftIcon, BanIcon, CalendarIcon, CheckIcon, ClockIcon, MailIcon, PinIcon, RepeatIcon } from "../icons";
import { BusinessLogo } from "../logo";

export interface NewVisit {
  serviceId: ServiceId;
  day: Day;
  start: number;
  customer: string;
  area: string;
}

type Step = "service" | "time" | "details" | "done" | "canceled";

interface Props {
  week: Day[];
  schedule: Schedule;
  mineId: string | null;
  onBook: (v: NewVisit) => Result;
  onReschedule: (day: Day, start: number) => Result;
  onCancel: () => Result;
  onSeeOwner: () => void;
}

export function BookingPage({ week, schedule, mineId, onBook, onReschedule, onCancel, onSeeOwner }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [moving, setMoving] = useState(false);
  const [serviceId, setServiceId] = useState<ServiceId>("standard");
  const [dayOffset, setDayOffset] = useState<number | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);

  const mine = schedule.bookings.find((b) => b.id === mineId) ?? null;
  const svc = service(serviceId);
  const bookable = week.filter((d) => d.offset >= 1);
  const firstOpen = bookable.find((d) => openTimes(schedule, d, svc.minutes, mine?.id).length > 0);
  const day = week.find((d) => d.offset === dayOffset) ?? firstOpen ?? bookable[0];

  function pickService(id: ServiceId) {
    setServiceId(id);
    setDayOffset(null);
    setStart(null);
    setError(null);
    setStep("time");
  }

  function pickTime(t: number) {
    setStart(t);
    setError(null);
    if (!moving) setStep("details");
  }

  function confirmMove() {
    if (start === null) return;
    const r = onReschedule(day, start);
    if (!r.ok) return setError(r.reason);
    setMoving(false);
    setMoved(true);
    setStart(null);
    setStep("done");
  }

  function startMove() {
    if (!mine) return;
    setServiceId(mine.serviceId);
    setDayOffset(mine.day);
    setStart(null);
    setError(null);
    setMoving(true);
    setStep("time");
  }

  function startOver() {
    setStep("service");
    setMoving(false);
    setDayOffset(null);
    setStart(null);
    setError(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_50px_-24px_rgb(27_34_50/0.35)]">
      <div className="flex items-center gap-2 border-b border-line bg-sunk px-4 py-2 text-micro text-ink-muted" aria-hidden>
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="ml-2 truncate rounded-md bg-surface px-2.5 py-1">book.tidyheron.example</span>
      </div>
      <div className="px-4 pt-4 pb-5 sm:px-5">
        <BusinessLogo className="text-label sm:text-title" size="size-7" />
        <p className="mt-1 text-micro text-ink-muted">Home cleaning in {business.region} · Mon to Sat, 8 AM to 5 PM</p>

        <div className="mt-5" aria-live="polite">
          {step === "service" && <ServiceStep onPick={pickService} />}

          {step === "time" && (
            <TimeStep
              schedule={schedule}
              week={bookable}
              day={day}
              serviceId={serviceId}
              ignoreId={moving ? mine?.id : undefined}
              start={start}
              moving={moving ? mine : null}
              error={error}
              onBack={moving ? () => (setMoving(false), setStep("done")) : startOver}
              onDay={(d) => (setDayOffset(d), setStart(null), setError(null))}
              onTime={pickTime}
              onConfirmMove={confirmMove}
            />
          )}

          {step === "details" && start !== null && (
            <DetailsStep
              day={day}
              start={start}
              serviceId={serviceId}
              error={error}
              onBack={() => setStep("time")}
              onSubmit={(customer, area) => {
                const r = onBook({ serviceId, day, start, customer, area });
                if (!r.ok) return setError(r.reason);
                setError(null);
                setMoved(false);
                setStep("done");
              }}
            />
          )}

          {step === "done" && mine && (
            <DoneStep moved={moved} week={week} schedule={schedule} mineId={mine.id} onMove={startMove} onCancel={() => { const r = onCancel(); if (r.ok) setStep("canceled"); }} onSeeOwner={onSeeOwner} />
          )}

          {step === "canceled" && (
            <div className="arrive flex flex-col items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-sunk text-ink-muted">
                <BanIcon />
              </span>
              <h2 className="font-display text-headline">Your visit is canceled</h2>
              <p className="text-body text-ink-muted">The time is open again for the next customer. {business.owner} gets a text, so nobody drives to an empty house.</p>
              <button type="button" onClick={startOver} className={primaryButton}>
                Book another visit
              </button>
              <button type="button" onClick={onSeeOwner} className="inline-flex min-h-11 items-center text-label text-brand underline underline-offset-4 lg:hidden">
                See the owner&apos;s day
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHead({ n, title, onBack }: { n: number; title: string; onBack?: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {onBack && (
        <button type="button" onClick={onBack} className="-ml-2 inline-flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-sunk" aria-label="Back">
          <ArrowLeftIcon />
        </button>
      )}
      <div>
        <p className="text-micro font-semibold text-ink-muted">Step {n} of 3</p>
        <h2 className="font-display text-title">{title}</h2>
      </div>
    </div>
  );
}

function ServiceStep({ onPick }: { onPick: (id: ServiceId) => void }) {
  return (
    <div className="arrive">
      <StepHead n={1} title="What do you need?" />
      <ul className="flex flex-col gap-2.5">
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s.id)}
              className="flex w-full flex-col gap-1 rounded-xl border border-line px-4 py-3 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-body font-semibold">{s.name}</span>
                <span className="shrink-0 text-micro text-ink-muted">about {formatLength(s.minutes)}</span>
              </span>
              <span className="text-label font-normal text-ink-muted">{s.blurb}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TimeProps {
  schedule: Schedule;
  week: Day[];
  day: Day;
  serviceId: ServiceId;
  ignoreId?: string;
  start: number | null;
  moving: { day: number; start: number } | null;
  error: string | null;
  onBack: () => void;
  onDay: (offset: number) => void;
  onTime: (t: number) => void;
  onConfirmMove: () => void;
}

function TimeStep({ schedule, week, day, serviceId, ignoreId, start, moving, error, onBack, onDay, onTime, onConfirmMove }: TimeProps) {
  const svc = service(serviceId);
  // When moving, the visit's own time is not a new time.
  const times = openTimes(schedule, day, svc.minutes, ignoreId).filter((t) => !(moving && moving.day === day.offset && moving.start === t));
  const morning = times.filter((t) => t < 12 * 60);
  const afternoon = times.filter((t) => t >= 12 * 60);
  const movingFrom = moving ? `${week.find((d) => d.offset === moving.day)?.label} at ${formatTime(moving.start)}` : null;

  return (
    <div className="arrive">
      <StepHead n={2} title={moving ? "Pick a new time" : "Pick a time"} onBack={onBack} />
      <p className="mb-3 text-label font-normal text-ink-muted">
        {svc.name}, about {formatLength(svc.minutes)}. {movingFrom ? `Now ${movingFrom}.` : "Only times we can make it are shown."}
      </p>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5">
        <ul className="flex gap-1.5" aria-label="Day">
          {week.map((d) => {
            const closed = isClosed(d);
            const count = closed ? 0 : openTimes(schedule, d, svc.minutes, ignoreId).length;
            const selected = d.offset === day.offset;
            return (
              <li key={d.offset}>
                <button
                  type="button"
                  disabled={closed}
                  aria-pressed={selected}
                  aria-label={`${d.label}${closed ? ", closed" : count === 0 ? ", fully booked" : `, ${count} open times`}`}
                  onClick={() => onDay(d.offset)}
                  className={`flex min-h-16 w-13 flex-col items-center justify-center rounded-xl border text-center transition-colors ${
                    selected ? "border-brand bg-brand text-white" : closed ? "border-transparent text-ink-muted/60" : count === 0 ? "border-line text-ink-muted" : "border-line hover:border-brand"
                  }`}
                >
                  <span className="text-micro">{d.short}</span>
                  <span className="text-body font-semibold">{d.date}</span>
                  <span className={`mt-0.5 size-1.5 rounded-full ${closed || count === 0 ? "bg-transparent" : selected ? "bg-white" : "bg-brand"}`} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-label">{day.label}</p>
      {times.length === 0 ? (
        <p className="mt-2 rounded-xl bg-sunk px-4 py-3 text-label font-normal text-ink-muted">No open times this day. Try another day.</p>
      ) : (
        <div className="mt-2 flex flex-col gap-3">
          {[
            ["Morning", morning],
            ["Afternoon", afternoon],
          ].map(([label, list]) =>
            (list as number[]).length ? (
              <div key={label as string}>
                <p className="mb-1.5 text-micro text-ink-muted">{label as string}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(list as number[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={start === t}
                      onClick={() => onTime(t)}
                      className={`min-h-11 rounded-lg text-label transition-colors ${start === t ? "bg-brand text-white" : "bg-brand-soft text-brand hover:bg-brand hover:text-white"}`}
                    >
                      {formatTime(t)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}

      {error && <p className="mt-3 text-label text-danger" role="alert">{error}</p>}

      {moving && (
        <button type="button" onClick={onConfirmMove} disabled={start === null} className={`${primaryButton} mt-4 w-full disabled:cursor-not-allowed disabled:bg-sunk disabled:text-ink-muted`}>
          {start === null ? "Pick a new time" : `Move my visit to ${day.short} ${formatTime(start)}`}
        </button>
      )}
    </div>
  );
}

interface DetailsProps {
  day: Day;
  start: number;
  serviceId: ServiceId;
  error: string | null;
  onBack: () => void;
  onSubmit: (customer: string, area: string) => void;
}

const field = "mt-1 block min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-body focus:border-brand";

function DetailsStep({ day, start, serviceId, error, onBack, onSubmit }: DetailsProps) {
  const [name, setName] = useState<string>(sampleCustomer.name);
  const [area, setArea] = useState<string>(sampleCustomer.area);
  const svc = service(serviceId);
  return (
    <form
      className="arrive"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(name, area);
      }}
    >
      <StepHead n={3} title="Your details" onBack={onBack} />
      <div className="mb-4 flex flex-col gap-1.5 rounded-xl bg-paper px-4 py-3 text-label">
        <span className="flex items-center gap-2"><CalendarIcon width={16} height={16} className="text-brand" /> {day.label} at {formatTime(start)}</span>
        <span className="flex items-center gap-2 font-normal text-ink-muted"><ClockIcon width={16} height={16} /> {svc.name}, about {formatLength(svc.minutes)}</span>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-label">
          Name
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
        </label>
        <label className="text-label">
          Email
          <input className={`${field} text-ink-muted`} value={sampleCustomer.email} readOnly aria-describedby="email-note" />
        </label>
        <label className="text-label">
          Area
          <select className={field} value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <p id="email-note" className="text-micro text-ink-muted">
          Sample details are filled in. Nothing is sent or kept, so there is no need to type your own.
        </p>
      </div>
      {error && <p className="mt-3 text-label text-danger" role="alert">{error}</p>}
      <button type="submit" className={`${primaryButton} mt-4 w-full`}>
        Book this visit
      </button>
    </form>
  );
}

interface DoneProps {
  moved: boolean;
  week: Day[];
  schedule: Schedule;
  mineId: string;
  onMove: () => void;
  onCancel: () => void;
  onSeeOwner: () => void;
}

function DoneStep({ moved, week, schedule, mineId, onMove, onCancel, onSeeOwner }: DoneProps) {
  const [asking, setAsking] = useState(false);
  const mine = schedule.bookings.find((b) => b.id === mineId);
  const email = schedule.outbox.find((m) => m.to === "customer");
  if (!mine) return null;
  const svc = service(mine.serviceId);
  const day = week.find((d) => d.offset === mine.day);
  return (
    <div className="arrive flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <CheckIcon />
        </span>
        <div>
          <h2 className="font-display text-headline">{moved ? "Your visit moved" : "You’re booked"}</h2>
          <p className="text-label font-normal text-ink-muted">A reminder would go out the day before.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-line px-4 py-3 text-label">
        <span className="flex items-center gap-2"><CalendarIcon width={16} height={16} className="text-brand" /> {day?.label} at {formatTime(mine.start)}</span>
        <span className="flex items-center gap-2 font-normal text-ink-muted"><ClockIcon width={16} height={16} /> {svc.name}, about {formatLength(svc.minutes)}</span>
        <span className="flex items-center gap-2 font-normal text-ink-muted"><PinIcon width={16} height={16} /> {mine.area}</span>
      </div>

      {email && (
        <div className="rounded-xl bg-paper px-4 py-3">
          <p className="flex items-center justify-between gap-2 text-micro text-ink-muted">
            <span className="flex items-center gap-1.5 font-semibold"><MailIcon width={14} height={14} /> The email {mine.customer.split(" ")[0]} would get</span>
            <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold">Not sent</span>
          </p>
          <p className="mt-1.5 text-label">{email.subject}</p>
          <p className="mt-1 text-label font-normal text-ink-muted">{email.body}</p>
        </div>
      )}

      {asking ? (
        <div className="rounded-xl border border-danger/40 px-4 py-3" role="group" aria-label="Cancel this visit?">
          <p className="text-label">Cancel this visit?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center rounded-xl bg-danger px-5 text-label text-white">
              Yes, cancel it
            </button>
            <button type="button" onClick={() => setAsking(false)} className={secondaryButton}>
              Keep my visit
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onMove} className={secondaryButton}>
            <RepeatIcon width={16} height={16} /> Change time
          </button>
          <button type="button" onClick={() => setAsking(true)} className={secondaryButton}>
            <BanIcon width={16} height={16} /> Cancel
          </button>
        </div>
      )}

      <button type="button" onClick={onSeeOwner} className="inline-flex min-h-11 items-center self-start text-label text-brand underline underline-offset-4 lg:hidden">
        See it on the owner&apos;s day
      </button>
    </div>
  );
}
