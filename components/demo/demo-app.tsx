"use client";

import { useEffect, useState } from "react";
import { BusinessLogo } from "@/components/logo";
import { seed } from "@/lib/demo/engine";
import type { DemoState, Now } from "@/lib/demo/types";
import { DemoBanner } from "./banner";
import { CustomerView } from "./customer";
import { OwnerView } from "./owner";

// The whole demo lives in this component's memory (ADR 0001). A reload, or
// "Reset demo", starts over. Nothing is sent and nothing is stored.

function localNow(): Now {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { date, minutes: d.getHours() * 60 + d.getMinutes() };
}

export function DemoApp() {
  const [now, setNow] = useState<Now | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [view, setView] = useState<"customer" | "owner">("customer");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // The date is read in the browser, so the server render never guesses it.
  useEffect(() => {
    const n = localNow();
    setNow(n); // eslint-disable-line react-hooks/set-state-in-effect
    setState(seed(n.date));
  }, []);

  function reset() {
    if (!now) return;
    setState(seed(now.date));
    setBookingId(null);
    setView("customer");
    setFresh(false);
    setResetKey((k) => k + 1);
  }


  return (
    <>
      <DemoBanner onReset={reset} />
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[72rem] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <BusinessLogo />
          <div role="tablist" aria-label="Choose a side of the demo" className="flex rounded-full bg-sunk p-1">
            {(
              [
                ["customer", "Customer: booking page"],
                ["owner", "Owner: the day"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => {
                  setView(id);
                  if (id === "owner") setFresh(false);
                }}
                className={`relative min-h-11 rounded-full px-4 text-label transition-colors duration-150 ${view === id ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
                {id === "owner" && fresh && view !== "owner" && <span aria-label="New booking" className="absolute top-2 right-2 size-2 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="flex-1" key={resetKey}>
        {!now || !state ? (
          <p className="px-4 py-16 text-center text-ink-muted">Opening the booking page…</p>
        ) : view === "customer" ? (
          <CustomerView
            state={state}
            now={now}
            setState={(s) => {
              setState(s);
              setFresh(true);
            }}
            bookingId={bookingId}
            setBookingId={setBookingId}
            goOwner={() => {
              setView("owner");
              setFresh(false);
            }}
          />
        ) : (
          <OwnerView state={state} now={now} setState={setState} focusDate={state.bookings.find((b) => b.id === bookingId)?.date ?? now.date} />
        )}
      </main>
    </>
  );
}
