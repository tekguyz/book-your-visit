"use client";

import { useState } from "react";
import { primaryButton, secondaryButton } from "@/components/buttons";
import { CalendarIcon, ClockIcon } from "@/components/icons";
import { business, crewNames } from "@/lib/demo/business";
import { addBlock, addDays, cancel, dayBlocks, dayBookings, duration, formatDay, formatTime, OPEN, CLOSE, removeBlock, serviceById, STEP } from "@/lib/demo/engine";
import type { Booking, DemoState, Now } from "@/lib/demo/types";

// The owner's side: the day's bookings and a way to block off time.

const timeOptions = Array.from({ length: (CLOSE - OPEN) / STEP + 1 }, (_, i) => OPEN + i * STEP);

export function OwnerView({ state, now, setState, focusDate }: { state: DemoState; now: Now; setState: (s: DemoState) => void; focusDate: string }) {
  const [date, setDate] = useState(focusDate);
  const [from, setFrom] = useState(12 * 60);
  const [to, setTo] = useState(13 * 60);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const bookings = dayBookings(state, date);
  const blocks = dayBlocks(state, date);
  const live = bookings.filter((b) => b.status === "booked");
  type Row = { at: number; booking?: Booking; block?: (typeof blocks)[number] };
  const rows: Row[] = [
    ...bookings.map((booking) => ({ at: booking.start, booking })),
    ...blocks.map((block) => ({ at: block.start, block })),
  ].sort((a, b) => a.at - b.at);

  return (
    <div className="mx-auto grid w-full max-w-[72rem] gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <section aria-labelledby="day" className="arrive">
        <p className="text-label text-sea">{business.name} · owner view</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h2 id="day" className="font-display text-headline">
            {formatDay(date, true)}
          </h2>
          <div className="flex items-center gap-2">
            <button type="button" className={secondaryButton} onClick={() => { setDate(addDays(date, -1)); setNote(null); }} aria-label="Previous day">
              Previous
            </button>
            <button type="button" className={secondaryButton} onClick={() => { setDate(now.date); setNote(null); }}>
              Today
            </button>
            <button type="button" className={secondaryButton} onClick={() => { setDate(addDays(date, 1)); setNote(null); }} aria-label="Next day">
              Next
            </button>
          </div>
        </div>
        <p className="mt-2 text-ink-muted" role="status">
          {live.length === 0 ? "No visits booked." : `${live.length} ${live.length === 1 ? "visit" : "visits"} booked.`} {crewNames.length} crews on the road.
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-ink-muted">
            Nothing on this day. Customers can book any open time on the booking page.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {rows.map((r) =>
              r.booking ? (
                <BookingRow key={r.booking.id} booking={r.booking} onCancel={() => setState(cancel(state, r.booking!.id))} />
              ) : (
                <li key={r.block!.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink-muted bg-sunk p-4">
                  <div>
                    <p className="text-label text-ink-muted">
                      {formatTime(r.block!.start)} to {formatTime(r.block!.end)} · Blocked off
                    </p>
                    <p className="text-body">{r.block!.reason}</p>
                  </div>
                  <button type="button" className={secondaryButton} onClick={() => setState(removeBlock(state, r.block!.id))}>
                    Open this time again
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      <aside aria-labelledby="block" className="arrive rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-6">
        <h2 id="block" className="flex items-center gap-2 font-display text-title">
          <ClockIcon className="text-sea" /> Block off a time
        </h2>
        <p className="mt-1 text-label font-normal text-ink-muted">
          Blocked times disappear from the booking page right away. Customers cannot pick them.
        </p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const r = addBlock(state, { date, start: from, end: to, reason });
            if (!r.ok) return setNote({ tone: "warn", text: r.error });
            setState(r.state);
            setReason("");
            const n = r.value.clashes.length;
            setNote(
              n
                ? { tone: "warn", text: `Blocked. ${n === 1 ? "One visit is" : `${n} visits are`} already inside it (${r.value.clashes.map((b) => b.name).join(", ")}). Move or cancel ${n === 1 ? "it" : "them"} below.` }
                : { tone: "ok", text: `Blocked ${formatTime(from)} to ${formatTime(to)} on ${formatDay(date)}.` },
            );
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-label">
              From
              <select className={select} value={from} onChange={(e) => setFrom(Number(e.target.value))}>
                {timeOptions.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-label">
              To
              <select className={select} value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {timeOptions.slice(1).map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-label">
            Reason (only you see it)
            <input className={select} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lunch, supply run, day off" />
          </label>
          <button type="submit" className={primaryButton}>
            Block off {formatDay(date)}
          </button>
          {note && (
            <p role="status" className={`rounded-xl p-3 text-label font-normal ${note.tone === "ok" ? "bg-sea-soft text-sea-deep" : "bg-brand-soft text-brand-deep"}`}>
              {note.text}
            </p>
          )}
        </form>
      </aside>
    </div>
  );
}

const select = "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-body font-normal text-ink placeholder:text-ink-muted/70";

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const service = serviceById(booking.serviceId)!;
  const gone = booking.status === "cancelled";
  return (
    <li className={`arrive flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-surface p-4 ${booking.mine && !gone ? "border-sea" : "border-line"}`}>
      <div className="min-w-0">
        <p className={`flex items-center gap-2 text-label ${gone ? "text-ink-muted line-through" : ""}`}>
          <CalendarIcon width={16} height={16} className="text-sea" />
          {formatTime(booking.start)} to {formatTime(booking.start + duration(booking.serviceId))}
          <span className="font-normal text-ink-muted no-underline">· {crewNames[booking.crew]}</span>
        </p>
        <p className={`mt-0.5 font-display text-title ${gone ? "text-ink-muted line-through" : ""}`}>{booking.name}</p>
        <p className="text-label font-normal text-ink-muted">
          {service.name}
          {booking.notes ? ` · “${booking.notes}”` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {gone ? (
          <span className="rounded-full bg-sunk px-3 py-1 text-micro font-semibold text-ink-muted">Cancelled</span>
        ) : (
          <>
            {booking.mine && <span className="rounded-full bg-sea-soft px-3 py-1 text-micro font-semibold text-sea-deep">Booked by you in the demo</span>}
            <button type="button" className={secondaryButton} onClick={onCancel}>
              Cancel visit
            </button>
          </>
        )}
      </div>
    </li>
  );
}
