// The booking rules, as pure functions. Screens never change state by hand
// (CLAUDE.md). A real backend could replace this file and keep the screens.

import { services } from "./business";
import type { Block, Booking, DemoState, Now } from "./types";

export const OPEN = 8 * 60;
export const CLOSE = 16 * 60;
export const STEP = 30;
export const CREWS = 2;
/** A customer cannot book a time sooner than this many minutes from now. */
export const LEAD = 120;

// ---- dates (always UTC arithmetic on YYYY-MM-DD, so no time zone surprises)

const toUtc = (date: string) => new Date(`${date}T00:00:00Z`);

export function addDays(date: string, n: number): string {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const isOpenDay = (date: string) => toUtc(date).getUTCDay() !== 0;

export function formatDay(date: string, long = false): string {
  return toUtc(date).toLocaleDateString("en-US", {
    weekday: long ? "long" : "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export const serviceById = (id: string) => services.find((s) => s.id === id);

export function duration(serviceId: string): number {
  const s = serviceById(serviceId);
  if (!s) throw new Error(`Unknown service: ${serviceId}`);
  return s.minutes;
}

// ---- availability

const active = (b: Booking) => b.status === "booked";

function busyCrews(state: DemoState, date: string, cell: number, ignoreId?: string): number {
  if (state.blocks.some((x) => x.date === date && cell >= x.start && cell < x.end)) return CREWS;
  return state.bookings.filter(
    (b) => active(b) && b.id !== ignoreId && b.date === date && cell >= b.start && cell < b.start + duration(b.serviceId),
  ).length;
}

/** Start times (minutes) a customer can pick for a service on a day. */
export function openTimes(state: DemoState, serviceId: string, date: string, now: Now, ignoreId?: string): number[] {
  if (!isOpenDay(date) || date < now.date) return [];
  const length = duration(serviceId);
  const times: number[] = [];
  for (let start = OPEN; start + length <= CLOSE; start += STEP) {
    if (date === now.date && start < now.minutes + LEAD) continue;
    let free = true;
    for (let cell = start; cell < start + length; cell += STEP) {
      if (busyCrews(state, date, cell, ignoreId) >= CREWS) {
        free = false;
        break;
      }
    }
    if (free) times.push(start);
  }
  return times;
}

/** Which crew is free for the whole visit. */
function freeCrew(state: DemoState, serviceId: string, date: string, start: number, ignoreId?: string): 0 | 1 | null {
  const length = duration(serviceId);
  for (const crew of [0, 1] as const) {
    const clash = state.bookings.some(
      (b) => active(b) && b.id !== ignoreId && b.date === date && b.crew === crew && b.start < start + length && start < b.start + duration(b.serviceId),
    );
    if (!clash) return crew;
  }
  return null;
}

// ---- actions

export type Draft = { serviceId: string; date: string; start: number; name: string; email: string; notes: string };
export type Result<T> = { ok: true; state: DemoState; value: T } | { ok: false; error: string };

export function book(state: DemoState, draft: Draft, now: Now): Result<Booking> {
  if (!draft.name.trim()) return { ok: false, error: "Add your name." };
  if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) return { ok: false, error: "Add an email address, like you@example.com." };
  if (!openTimes(state, draft.serviceId, draft.date, now).includes(draft.start)) {
    return { ok: false, error: "That time was just taken. Pick another." };
  }
  const crew = freeCrew(state, draft.serviceId, draft.date, draft.start);
  if (crew === null) return { ok: false, error: "That time was just taken. Pick another." };
  const booking: Booking = {
    id: `b${state.next}`,
    serviceId: draft.serviceId,
    date: draft.date,
    start: draft.start,
    name: draft.name.trim(),
    email: draft.email.trim(),
    notes: draft.notes.trim(),
    crew,
    status: "booked",
    mine: true,
  };
  return { ok: true, state: { ...state, bookings: [...state.bookings, booking], next: state.next + 1 }, value: booking };
}

export function reschedule(state: DemoState, id: string, date: string, start: number, now: Now): Result<Booking> {
  const current = state.bookings.find((b) => b.id === id && active(b));
  if (!current) return { ok: false, error: "This visit is not booked any more." };
  if (!openTimes(state, current.serviceId, date, now, id).includes(start)) {
    return { ok: false, error: "That time is not open. Pick another." };
  }
  const crew = freeCrew(state, current.serviceId, date, start, id);
  if (crew === null) return { ok: false, error: "That time is not open. Pick another." };
  const moved: Booking = { ...current, date, start, crew };
  return { ok: true, state: { ...state, bookings: state.bookings.map((b) => (b.id === id ? moved : b)) }, value: moved };
}

export function cancel(state: DemoState, id: string): DemoState {
  return { ...state, bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)) };
}

export function addBlock(
  state: DemoState,
  input: { date: string; start: number; end: number; reason: string },
): Result<{ block: Block; clashes: Booking[] }> {
  if (input.end <= input.start) return { ok: false, error: "The end must be after the start." };
  const block: Block = { id: `x${state.next}`, ...input, reason: input.reason.trim() || "Blocked off" };
  const clashes = dayBookings(state, input.date).filter(
    (b) => active(b) && b.start < input.end && input.start < b.start + duration(b.serviceId),
  );
  return { ok: true, state: { ...state, blocks: [...state.blocks, block], next: state.next + 1 }, value: { block, clashes } };
}

export function removeBlock(state: DemoState, id: string): DemoState {
  return { ...state, blocks: state.blocks.filter((b) => b.id !== id) };
}

export const dayBookings = (state: DemoState, date: string) =>
  state.bookings.filter((b) => b.date === date).sort((a, b) => a.start - b.start);

export const dayBlocks = (state: DemoState, date: string) =>
  state.blocks.filter((b) => b.date === date).sort((a, b) => a.start - b.start);

// ---- sample data, made up, dated from today so the demo is always current

export function seed(today: string): DemoState {
  const nextOpen = (date: string) => {
    let d = date;
    while (!isOpenDay(d)) d = addDays(d, 1);
    return d;
  };
  const d0 = nextOpen(today);
  const d1 = nextOpen(addDays(d0, 1));
  const d2 = nextOpen(addDays(d1, 1));
  const mk = (n: number, date: string, hour: number, serviceId: string, name: string, crew: 0 | 1): Booking => ({
    id: `s${n}`,
    serviceId,
    date,
    start: hour * 60,
    name,
    email: "sample@example.com",
    notes: "",
    crew,
    status: "booked",
    mine: false,
  });
  const bookings = [
    mk(1, d0, 12, "standard", "Camila R.", 0),
    mk(2, d0, 13, "windows", "Marcus T.", 1),
    mk(3, d1, 8, "deep", "Priya N.", 0),
    mk(4, d1, 8, "standard", "Dev S.", 1),
    mk(5, d1, 13, "move", "Luz M.", 0),
    mk(6, d2, 9, "standard", "Noah B.", 0),
    mk(7, d2, 10, "deep", "Rosa F.", 1),
  ];
  const blocks: Block[] = [{ id: "x0", date: d2, start: 14 * 60, end: 16 * 60, reason: "Supply run and van service" }];
  return { bookings, blocks, next: 100 };
}
