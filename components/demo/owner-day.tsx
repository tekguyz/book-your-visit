"use client";

// The owner's side: one day at a time, with visits, blocked time and the
// open gaps between them. Blocking time here removes it from the booking
// page at once, because both read the same Schedule.

import { useState } from "react";
import { business, hours, SLOT_STEP } from "@/lib/demo/business";
import { dayItems, formatLength, formatTime, isClosed, service, type Day, type NewBlock } from "@/lib/demo/engine";
import type { Result, Schedule } from "@/lib/demo/types";
import { secondaryButton } from "../buttons";
import { BanIcon, ChevronLeftIcon, ChevronRightIcon, PinIcon, UserIcon, XIcon } from "../icons";

interface Props {
  week: Day[];
  schedule: Schedule;
  day: number;
  onDay: (offset: number) => void;
  mineId: string | null;
  onBlock: (n: NewBlock) => Result;
  onUnblock: (id: string) => void;
}

const lengths = [30, 60, 120, 180, 240];

export function OwnerDay({ week, schedule, day: offset, onDay, mineId, onBlock, onUnblock }: Props) {
  const day = week[offset] ?? week[0];
  const items = dayItems(schedule, day);
  const visits = items.filter((i) => i.kind === "visit").length;
  const label = offset === 0 ? `Today, ${day.label}` : offset === 1 ? `Tomorrow, ${day.label}` : day.label;

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-micro font-semibold text-ink-muted">{business.owner}&apos;s schedule</p>
          <h2 className="font-display text-title">{label}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onDay(Math.max(0, offset - 1))} disabled={offset === 0} className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-sunk disabled:opacity-40" aria-label="Day before">
            <ChevronLeftIcon />
          </button>
          <button type="button" onClick={() => onDay(0)} disabled={offset === 0} className="inline-flex min-h-11 items-center rounded-lg px-3 text-label hover:bg-sunk disabled:text-ink-muted">
            Today
          </button>
          <button type="button" onClick={() => onDay(Math.min(week.length - 1, offset + 1))} disabled={offset === week.length - 1} className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-sunk disabled:opacity-40" aria-label="Next day">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {isClosed(day) ? (
          <p className="rounded-xl bg-sunk px-4 py-3 text-label font-normal text-ink-muted">Closed on Sundays. The booking page shows no times.</p>
        ) : (
          <>
            <p className="mb-3 text-label font-normal text-ink-muted">
              {visits === 0 ? "No visits yet." : visits === 1 ? "1 visit." : `${visits} visits.`} Open {formatTime(hours.open)} to {formatTime(hours.close)}.
            </p>
            <ol className="flex flex-col gap-2">
              {items.map((item) => {
                const time = `${formatTime(item.start)} – ${formatTime(item.end)}`;
                if (item.kind === "open") {
                  return (
                    <li key={`open-${item.start}`} className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-2.5 text-label font-normal text-ink-muted">
                      <span className="w-40 shrink-0 tabular-nums whitespace-nowrap">{time}</span>
                      <span>Free</span>
                    </li>
                  );
                }
                if (item.kind === "block") {
                  return (
                    <li key={item.block.id} className="hatch arrive flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-label">
                      <span className="w-40 shrink-0 tabular-nums whitespace-nowrap">{time}</span>
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <BanIcon width={16} height={16} className="shrink-0 text-ink-muted" />
                        <span className="truncate">{item.block.reason}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnblock(item.block.id)}
                        className="-my-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface/80 text-ink-muted hover:text-ink"
                        aria-label={`Remove the block at ${formatTime(item.start)}`}
                      >
                        <XIcon width={16} height={16} />
                      </button>
                    </li>
                  );
                }
                const b = item.booking;
                const mine = b.id === mineId;
                return (
                  <li key={b.id} className={`relative overflow-hidden rounded-xl border px-4 py-2.5 ${mine ? "arrive border-accent bg-accent-soft" : "border-line bg-paper"}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label">
                      <span className="shrink-0 tabular-nums whitespace-nowrap max-sm:w-full sm:w-40">{time}</span>
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className="inline-flex items-center gap-1.5"><UserIcon width={15} height={15} className="text-ink-muted" /> {b.customer}</span>
                        <span className="font-normal text-ink-muted">{service(b.serviceId).name}</span>
                        <span className="inline-flex items-center gap-1 font-normal text-ink-muted"><PinIcon width={14} height={14} /> {b.area}</span>
                      </span>
                      {b.online && <span className="rounded-full bg-accent px-2 py-0.5 text-micro font-semibold text-white">{mine ? "New · booked online" : "Booked online"}</span>}
                    </div>
                    {mine && <span aria-hidden className="hairline-draw absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
                  </li>
                );
              })}
            </ol>
            <BlockForm key={day.offset} day={day} onBlock={onBlock} />
          </>
        )}
      </div>
    </div>
  );
}

const field = "mt-1 block min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-body focus:border-brand";

function BlockForm({ day, onBlock }: { day: Day; onBlock: (n: NewBlock) => Result }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(12 * 60);
  const [minutes, setMinutes] = useState(60);
  const [reason, setReason] = useState("Supply run");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const starts: number[] = [];
  for (let t = hours.open; t < hours.close; t += SLOT_STEP) starts.push(t);

  if (!open) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen(true)} className={secondaryButton}>
          <BanIcon width={16} height={16} /> Block off time
        </button>
        {message?.ok && <p className="text-label font-normal text-ink-muted" role="status">{message.text}</p>}
      </div>
    );
  }

  return (
    <form
      className="arrive mt-4 rounded-xl border border-line bg-paper p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const r = onBlock({ day, start, minutes, reason });
        if (!r.ok) return setMessage({ ok: false, text: r.reason });
        setMessage({ ok: true, text: "Blocked. Those times are gone from the booking page." });
        setOpen(false);
      }}
    >
      <p className="font-display text-title">Block off time on {day.label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
        <label className="text-label">
          From
          <select className={field} value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {starts.map((t) => (
              <option key={t} value={t}>{formatTime(t)}</option>
            ))}
          </select>
        </label>
        <label className="text-label">
          For
          <select className={field} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {lengths.map((m) => (
              <option key={m} value={m}>{formatLength(m)}</option>
            ))}
          </select>
        </label>
        <label className="text-label">
          Why (only you see this)
          <input className={field} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={40} />
        </label>
      </div>
      {message && !message.ok && <p className="mt-3 text-label text-danger" role="alert">{message.text}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className="inline-flex min-h-11 items-center rounded-xl bg-ink px-5 text-label text-paper hover:bg-night-raised">
          Block it
        </button>
        <button type="button" onClick={() => (setOpen(false), setMessage(null))} className={secondaryButton}>
          Never mind
        </button>
      </div>
    </form>
  );
}
