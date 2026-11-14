"use client";

// The whole demo on one screen: the customer's booking page and the owner's
// day. The rules are pure, in lib/demo/engine.ts; this file only holds the
// state. Nothing is kept: a reload starts over (ADR 0001).

import { useEffect, useState } from "react";
import { business, sampleCustomer } from "@/lib/demo/business";
import { blockTime, book, cancel, days, reschedule, seed, unblock, type Day, type NewBlock } from "@/lib/demo/engine";
import type { Result, Schedule } from "@/lib/demo/types";
import { CheckIcon } from "../icons";
import { DemoBanner } from "./banner";
import { BookingPage, type NewVisit } from "./booking-page";
import { Outbox } from "./outbox";
import { OwnerDay } from "./owner-day";

type Tour = { booked: boolean; changed: boolean; ownerSaw: boolean; blocked: boolean };
const noTour: Tour = { booked: false, changed: false, ownerSaw: false, blocked: false };

const tourSteps: [keyof Tour, string][] = [
  ["booked", "Book a visit"],
  ["ownerSaw", "See it on the owner's day"],
  ["blocked", "Block off time as the owner"],
  ["changed", "Change or cancel the visit"],
];

export function DemoApp() {
  // The demo's week starts on the visitor's real today, set after the page
  // loads so the server and the browser never disagree on the date.
  const [week, setWeek] = useState<Day[] | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [mineId, setMineId] = useState<string | null>(null);
  const [ownerDay, setOwnerDay] = useState(0);
  const [tab, setTab] = useState<"customer" | "owner">("customer");
  const [unseen, setUnseen] = useState(false);
  const [tour, setTour] = useState<Tour>(noTour);
  const [resets, setResets] = useState(0);

  useEffect(() => {
    const w = days(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the date is only known in the browser.
    setWeek(w);
    setSchedule(seed(w));
  }, []);

  if (!week || !schedule) {
    return (
      <>
        <DemoBanner onReset={() => {}} />
        <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-5 pb-16 sm:px-6">
          <p className="text-body text-ink-muted">Opening the demo…</p>
        </main>
      </>
    );
  }

  const s = schedule;

  function apply(r: Result, after?: (id: string) => void): Result {
    if (r.ok) {
      setSchedule(r.schedule);
      after?.(r.id);
    }
    return r;
  }

  function noteOwnerChange(day: number) {
    setOwnerDay(day);
    if (tab !== "owner") setUnseen(true);
  }

  const onBook = (v: NewVisit) =>
    apply(book(s, { ...v, email: sampleCustomer.email }), (id) => {
      setMineId(id);
      // On a wide screen the owner's day is already in view.
      const wide = window.matchMedia("(min-width: 64rem)").matches;
      setTour((t) => ({ ...t, booked: true, ownerSaw: t.ownerSaw || wide }));
      noteOwnerChange(v.day.offset);
    });

  const onReschedule = (day: Day, start: number) =>
    apply(reschedule(s, mineId ?? "", day, start), () => {
      setTour((t) => ({ ...t, changed: true }));
      noteOwnerChange(day.offset);
    });

  const onCancel = () => {
    const day = s.bookings.find((b) => b.id === mineId)?.day ?? ownerDay;
    return apply(cancel(s, mineId ?? ""), () => {
      setMineId(null);
      setTour((t) => ({ ...t, changed: true }));
      noteOwnerChange(day);
    });
  };

  const onBlock = (n: NewBlock) => apply(blockTime(s, n), () => setTour((t) => ({ ...t, blocked: true })));
  const onUnblock = (id: string) => setSchedule(unblock(s, id));

  function showTab(next: "customer" | "owner") {
    setTab(next);
    if (next === "owner") {
      setUnseen(false);
      if (mineId) setTour((t) => ({ ...t, ownerSaw: true }));
    }
  }

  function reset() {
    if (!week) return;
    setSchedule(seed(week));
    setMineId(null);
    setOwnerDay(0);
    setTab("customer");
    setUnseen(false);
    setTour(noTour);
    setResets((n) => n + 1);
  }

  return (
    <>
      <DemoBanner onReset={reset} />
      <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-5 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-headline">Book a visit with {business.name}</h1>
          <p className="max-w-[64ch] text-body text-ink-muted">
            You play both sides: a customer booking a cleaning, and {business.owner}, the owner, running her day. Nothing is sent to anyone.
          </p>
        </div>

        <ol className="mt-4 flex flex-wrap gap-2 text-micro" aria-label="Things to try">
          {tourSteps.map(([key, label]) => (
            <li
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${tour[key] ? "bg-brand-soft text-brand" : "bg-sunk text-ink-muted"}`}
            >
              {tour[key] ? <CheckIcon width={14} height={14} /> : <span aria-hidden className="size-1.5 rounded-full bg-ink-muted" />}
              {label}
              <span className="sr-only">{tour[key] ? " (done)" : " (not yet)"}</span>
            </li>
          ))}
        </ol>

        <div role="tablist" aria-label="Demo view" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-sunk p-1 lg:hidden">
          {(
            [
              ["customer", "Booking page"],
              ["owner", "Owner's day"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => showTab(id)}
              className={`relative min-h-11 rounded-lg text-label ${tab === id ? "bg-surface text-ink shadow-sm" : "text-ink-muted"}`}
            >
              {label}
              {id === "owner" && unseen && tab !== "owner" && <span className="absolute top-2.5 right-4 size-2.5 rounded-full bg-accent" aria-label="Something changed" />}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[26rem_minmax(0,1fr)] lg:items-start">
          <section id="panel-customer" aria-label="Booking page" className={`${tab === "customer" ? "" : "hidden"} min-w-0 lg:sticky lg:top-4 lg:block`}>
            <BookingPage
              key={resets}
              week={week}
              schedule={s}
              mineId={mineId}
              onBook={onBook}
              onReschedule={onReschedule}
              onCancel={onCancel}
              onSeeOwner={() => {
                showTab("owner");
                requestAnimationFrame(() => document.getElementById("panel-owner")?.scrollIntoView({ block: "start" }));
              }}
            />
          </section>
          <section id="panel-owner" aria-label="Owner's day" className={`${tab === "owner" ? "" : "hidden"} min-w-0 flex flex-col gap-6 lg:flex`}>
            <OwnerDay key={resets} week={week} schedule={s} day={ownerDay} onDay={setOwnerDay} mineId={mineId} onBlock={onBlock} onUnblock={onUnblock} />
            <Outbox outbox={s.outbox} />
          </section>
        </div>
      </main>
    </>
  );
}
