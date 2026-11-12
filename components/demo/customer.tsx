"use client";

import { useMemo, useState } from "react";
import { primaryButton, secondaryButton } from "@/components/buttons";
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon, MailIcon } from "@/components/icons";
import { business, services } from "@/lib/demo/business";
import { addDays, book, cancel, duration, formatDay, formatTime, isOpenDay, openTimes, reschedule, serviceById } from "@/lib/demo/engine";
import type { Booking, DemoState, Now } from "@/lib/demo/types";

// The customer's side: the business's public booking page. Every change goes
// through lib/demo/engine.ts. Nothing is sent: the confirmation is drawn.

const DAYS_AHEAD = 14;

type Props = {
  state: DemoState;
  now: Now;
  setState: (s: DemoState) => void;
  /** Id of the visit the customer just made (survives a switch to the owner view). */
  bookingId: string | null;
  setBookingId: (id: string | null) => void;
  goOwner: () => void;
};

export function CustomerView({ state, now, setState, bookingId, setBookingId, goOwner }: Props) {
  const booking = state.bookings.find((b) => b.id === bookingId) ?? null;
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [error, setError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  function startOver() {
    setServiceId(null);
    setDate(null);
    setStart(null);
    setError("");
    setRescheduling(false);
    setConfirmCancel(false);
    setBookingId(null);
  }

  // ---- A booked visit: confirmation, change, cancel
  if (booking && booking.status === "booked" && !rescheduling) {
    return (
      <Confirmation
        booking={booking}
        confirmCancel={confirmCancel}
        onChange={() => {
          setRescheduling(true);
          setServiceId(booking.serviceId);
          setDate(null);
          setStart(null);
          setError("");
        }}
        onAskCancel={() => setConfirmCancel(true)}
        onKeep={() => setConfirmCancel(false)}
        onCancel={() => {
          setState(cancel(state, booking.id));
          setConfirmCancel(false);
        }}
        goOwner={goOwner}
      />
    );
  }
  if (booking && booking.status === "cancelled") {
    return (
      <Shell>
        <div className="arrive rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-headline">Your visit is cancelled.</h2>
          <p className="mt-3 text-ink-muted">
            The {formatDay(booking.date)} {formatTime(booking.start)} time is open again for the next customer. A cancellation note
            would go to your email, and to {business.owner}. Not sent in the demo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={primaryButton} onClick={startOver}>
              Book another time
            </button>
            <button type="button" className={secondaryButton} onClick={goOwner}>
              See the open time on the owner&apos;s side
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ---- Moving a visit
  if (booking && rescheduling) {
    return (
      <Shell>
        <button type="button" className="mb-4 inline-flex min-h-11 items-center text-label text-ink-muted underline underline-offset-4" onClick={() => setRescheduling(false)}>
          Keep my current time
        </button>
        <h2 className="font-display text-headline">Pick a new time</h2>
        <p className="mt-2 text-ink-muted">
          {serviceById(booking.serviceId)?.name}, now {formatDay(booking.date)} at {formatTime(booking.start)}.
        </p>
        <TimePicker
          state={state}
          now={now}
          serviceId={booking.serviceId}
          ignoreId={booking.id}
          date={date}
          start={start}
          onDate={(d) => {
            setDate(d);
            setStart(null);
          }}
          onStart={setStart}
        />
        {error && (
          <p role="alert" className="mt-4 text-label text-brand">
            {error}
          </p>
        )}
        <div className="mt-6">
          <button
            type="button"
            className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={!date || start === null}
            onClick={() => {
              if (!date || start === null) return;
              const r = reschedule(state, booking.id, date, start, now);
              if (!r.ok) return setError(r.error);
              setState(r.state);
              setRescheduling(false);
              setError("");
            }}
          >
            Move my visit
          </button>
        </div>
      </Shell>
    );
  }

  // ---- A new booking: service, time, details
  const service = serviceId ? serviceById(serviceId) : null;
  const step = !service ? 1 : date && start !== null ? 3 : 2;

  return (
    <Shell>
      <p className="text-label text-sea">Step {step} of 3</p>
      {step === 1 && (
        <>
          <h2 className="mt-1 font-display text-headline">What do you need cleaned?</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className="group flex h-full w-full flex-col gap-2 rounded-2xl border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-sea"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-title">{s.name}</span>
                    <ArrowRightIcon className="shrink-0 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-sea" />
                  </span>
                  <span className="text-body text-ink-muted">{s.blurb}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-label text-sea">
                    <ClockIcon width={16} height={16} /> About {hours(s.minutes)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {step >= 2 && service && (
        <>
          <button
            type="button"
            className="mb-2 inline-flex min-h-11 items-center text-label text-ink-muted underline underline-offset-4"
            onClick={() => {
              setServiceId(null);
              setDate(null);
              setStart(null);
            }}
          >
            Change service
          </button>
          <h2 className="font-display text-headline">
            {step === 2 ? `When for your ${service.name.toLowerCase()}?` : "Last step: who is it for?"}
          </h2>
          {step === 2 ? (
            <TimePicker state={state} now={now} serviceId={service.id} date={date} start={start} onDate={(d) => { setDate(d); setStart(null); }} onStart={setStart} />
          ) : (
            <>
              <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full bg-sea-soft px-4 py-2 text-label text-sea-deep">
                <CalendarIcon width={16} height={16} /> {service.name} · {formatDay(date!, true)} at {formatTime(start!)}
                <button type="button" className="ml-1 min-h-6 underline underline-offset-4" onClick={() => setStart(null)}>
                  Change
                </button>
              </p>
              <form
                className="mt-6 grid max-w-xl gap-4"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  const r = book(state, { serviceId: service.id, date: date!, start: start!, ...form }, now);
                  if (!r.ok) return setError(r.error);
                  setState(r.state);
                  setBookingId(r.value.id);
                  setError("");
                }}
              >
                <Field label="Your name">
                  <input className={input} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First name and last initial" />
                </Field>
                <Field label="Email for the confirmation">
                  <input className={input} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </Field>
                <Field label="Anything the crew should know? (optional)">
                  <textarea className={`${input} min-h-24`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="A friendly dog, parking, which door to use" />
                </Field>
                {error && (
                  <p role="alert" className="text-label text-brand">
                    {error}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" className={primaryButton}>
                    Book this visit
                  </button>
                  <p className="text-label font-normal text-ink-muted">Demo: nothing is sent, and nothing is charged.</p>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </Shell>
  );
}

const input = "min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-body text-ink placeholder:text-ink-muted/70";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-label">{label}</span>
      {children}
    </label>
  );
}

function hours(minutes: number): string {
  const h = minutes / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${h === 1 ? "hour" : "hours"}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[56rem] px-4 py-8 sm:px-6 sm:py-12">
      <div className="arrive">{children}</div>
    </div>
  );
}

function TimePicker({
  state, now, serviceId, ignoreId, date, start, onDate, onStart,
}: {
  state: DemoState;
  now: Now;
  serviceId: string;
  ignoreId?: string;
  date: string | null;
  start: number | null;
  onDate: (d: string) => void;
  onStart: (m: number) => void;
}) {
  const days = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(now.date, i)), [now.date]);
  const times = date ? openTimes(state, serviceId, date, now, ignoreId) : [];
  return (
    <div className="mt-6">
      <p className="text-label text-ink-muted" id="day-label">
        Pick a day. We are open {business.hours}.
      </p>
      <div role="group" aria-labelledby="day-label" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {days.map((d) => {
          const free = openTimes(state, serviceId, d, now, ignoreId).length;
          const disabled = !isOpenDay(d) || free === 0;
          const selected = d === date;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onDate(d)}
              className={`flex min-h-16 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-xl border px-2 py-2 text-label transition-colors duration-150 ${
                selected ? "border-sea bg-sea text-white" : disabled ? "border-line bg-sunk text-ink-muted/60" : "border-line bg-surface hover:border-sea"
              }`}
            >
              <span className="text-micro font-semibold uppercase tracking-wide">{formatDay(d).split(",")[0]}</span>
              <span className="font-display text-title">{formatDay(d).split(" ")[2]}</span>
              <span className="text-micro font-normal">{!isOpenDay(d) ? "Closed" : free === 0 ? "Full" : formatDay(d).split(" ")[1]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6" aria-live="polite">
        {date === null ? (
          <p className="text-ink-muted">Open times show here.</p>
        ) : (
          <>
            <p className="text-label text-ink-muted">
              Open times on {formatDay(date, true)}. A visit takes about {hours(duration(serviceId))}.
            </p>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {times.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    aria-pressed={t === start}
                    onClick={() => onStart(t)}
                    className={`min-h-11 w-full rounded-xl border px-2 text-label transition-colors duration-150 ${
                      t === start ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Confirmation({
  booking, confirmCancel, onChange, onAskCancel, onKeep, onCancel, goOwner,
}: {
  booking: Booking;
  confirmCancel: boolean;
  onChange: () => void;
  onAskCancel: () => void;
  onKeep: () => void;
  onCancel: () => void;
  goOwner: () => void;
}) {
  const service = serviceById(booking.serviceId)!;
  const end = booking.start + service.minutes;
  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sea-soft px-3 py-1.5 text-label text-sea-deep">
            <CheckIcon width={16} height={16} /> You are booked
          </p>
          <h2 className="mt-3 font-display text-headline">
            {formatDay(booking.date, true)} at {formatTime(booking.start)}
          </h2>
          <dl className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
            <Detail label="Service" value={service.name} />
            <Detail label="Crew on site" value={`${formatTime(booking.start)} to about ${formatTime(end)}`} />
            <Detail label="Booked for" value={booking.name} />
            <Detail label="Confirmation to" value={booking.email} />
            {booking.notes && <Detail label="Your note" value={booking.notes} />}
          </dl>

          {confirmCancel ? (
            <div role="alertdialog" aria-label="Cancel this visit" className="arrive mt-6 rounded-2xl border border-brand bg-brand-soft p-5">
              <p className="font-display text-title">Cancel this visit?</p>
              <p className="mt-1 text-ink-muted">The time goes back to the open list for other customers.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className={primaryButton} onClick={onCancel}>
                  Yes, cancel it
                </button>
                <button type="button" className={secondaryButton} onClick={onKeep}>
                  Keep my visit
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={secondaryButton} onClick={onChange}>
                Change the time
              </button>
              <button type="button" className={secondaryButton} onClick={onAskCancel}>
                Cancel the visit
              </button>
              <button type="button" className={`${secondaryButton} text-sea-deep`} onClick={goOwner}>
                See it on the owner&apos;s side <ArrowRightIcon width={16} height={16} />
              </button>
            </div>
          )}
        </div>

        <aside aria-label="What would go out" className="rounded-2xl bg-night p-5 text-on-night">
          <p className="flex items-center gap-2 text-micro font-semibold text-on-night-muted">
            <MailIcon width={16} height={16} /> What would go out · not sent in the demo
          </p>
          <p className="mt-3 font-display text-title">Your visit with {business.name}</p>
          <p className="mt-2 text-label font-normal text-on-night-muted">
            Hi {booking.name.split(" ")[0]}, you are booked for a {service.name.toLowerCase()} on {formatDay(booking.date, true)} at {formatTime(booking.start)}.
            Need a different time? Use the link in this email to change or cancel, any time before the visit.
          </p>
          <p className="mt-3 text-micro text-on-night-muted">{business.name}</p>
        </aside>
      </div>
    </Shell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-micro font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-body">{value}</dd>
    </div>
  );
}
