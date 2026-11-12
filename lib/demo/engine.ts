// Every booking rule, as pure functions. Screens never change a Schedule by
// hand: they call these. A real backend could run the same rules on a server
// (ADR 0001). Nothing here sends anything; messages go to `outbox` only.

import { BOOKING_WINDOW, business, hours, services, SLOT_STEP, TRAVEL_BUFFER } from "./business";
import type { Block, Booking, Outgoing, Result, Schedule, ServiceId } from "./types";

export function service(id: ServiceId) {
  const s = services.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service ${id}`);
  return s;
}

/** The demo's days, from a real start date. Day 0 is today. */
export interface Day {
  offset: number;
  weekday: number;
  /** "Tue, Nov 17" */
  label: string;
  /** "Tue" */
  short: string;
  /** "17" */
  date: string;
}

export function days(today: Date, count = BOOKING_WINDOW + 1): Day[] {
  return Array.from({ length: count }, (_, offset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return {
      offset,
      weekday: d.getDay(),
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      short: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: String(d.getDate()),
    };
  });
}

export function isClosed(day: Day) {
  return day.weekday === hours.closedWeekday;
}

/** "8:00 AM" */
export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "2 hours", "90 minutes" */
export function formatLength(minutes: number) {
  if (minutes % 60 === 0) return minutes === 60 ? "1 hour" : `${minutes / 60} hours`;
  if (minutes > 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  return `${minutes} minutes`;
}

export function bookingEnd(b: Booking) {
  return b.start + service(b.serviceId).minutes;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * The start times a customer may pick for a visit of `minutes` on `day`.
 * A time is open when the visit fits inside opening hours, keeps the travel
 * buffer from every other visit that day, and touches no blocked time.
 * `ignoreId` leaves out one booking: the one being moved.
 */
export function openTimes(s: Schedule, day: Day, minutes: number, ignoreId?: string): number[] {
  if (isClosed(day) || day.offset < 1 || day.offset > BOOKING_WINDOW) return [];
  const visits = s.bookings.filter((b) => b.day === day.offset && b.id !== ignoreId);
  const blocks = s.blocks.filter((b) => b.day === day.offset);
  const times: number[] = [];
  for (let start = hours.open; start + minutes <= hours.close; start += SLOT_STEP) {
    const end = start + minutes;
    const clashVisit = visits.some((v) => overlaps(start, end, v.start - TRAVEL_BUFFER, bookingEnd(v) + TRAVEL_BUFFER));
    const clashBlock = blocks.some((b) => overlaps(start, end, b.start, b.start + b.minutes));
    if (!clashVisit && !clashBlock) times.push(start);
  }
  return times;
}

function message(s: Schedule, m: Omit<Outgoing, "id">): Schedule {
  return { ...s, outbox: [{ id: `m${s.nextId}`, ...m }, ...s.outbox], nextId: s.nextId + 1 };
}

export interface NewBooking {
  serviceId: ServiceId;
  day: Day;
  start: number;
  customer: string;
  email: string;
  area: string;
}

/** Books a visit. Refuses a time that is not open: the page can be stale. */
export function book(s: Schedule, n: NewBooking): Result {
  const svc = service(n.serviceId);
  if (!n.customer.trim()) return { ok: false, reason: "Add a name for the booking." };
  if (!openTimes(s, n.day, svc.minutes).includes(n.start)) return { ok: false, reason: "That time was just taken. Pick another one." };
  const id = `b${s.nextId}`;
  const booking: Booking = { id, day: n.day.offset, start: n.start, serviceId: n.serviceId, customer: n.customer.trim(), area: n.area, online: true };
  let next: Schedule = { ...s, bookings: [...s.bookings, booking], nextId: s.nextId + 1 };
  const when = `${n.day.label} at ${formatTime(n.start)}`;
  next = message(next, {
    to: "owner",
    channel: "text",
    subject: "New booking",
    body: `${booking.customer} booked a ${svc.name.toLowerCase()} for ${when}, in ${n.area}.`,
  });
  next = message(next, {
    to: "customer",
    channel: "email",
    subject: `You're booked: ${when}`,
    body: `Hi ${firstName(booking.customer)}, your ${svc.name.toLowerCase()} with ${business.name} is booked for ${when}. It takes about ${formatLength(svc.minutes)}. We'll send a reminder the day before. To change the time or cancel, use the link in this email.`,
  });
  return { ok: true, schedule: next, id };
}

/** Moves a visit to a new open time. The old time opens up again. */
export function reschedule(s: Schedule, id: string, day: Day, start: number): Result {
  const old = s.bookings.find((b) => b.id === id);
  if (!old) return { ok: false, reason: "That booking is gone." };
  const svc = service(old.serviceId);
  if (!openTimes(s, day, svc.minutes, id).includes(start)) return { ok: false, reason: "That time was just taken. Pick another one." };
  let next: Schedule = { ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, day: day.offset, start } : b)) };
  const when = `${day.label} at ${formatTime(start)}`;
  next = message(next, { to: "owner", channel: "text", subject: "Visit moved", body: `${old.customer} moved their ${svc.name.toLowerCase()} to ${when}. The old time is open again.` });
  next = message(next, {
    to: "customer",
    channel: "email",
    subject: `Your visit moved to ${when}`,
    body: `Hi ${firstName(old.customer)}, your ${svc.name.toLowerCase()} is now ${when}. Nothing else changes.`,
  });
  return { ok: true, schedule: next, id };
}

/** Cancels a visit. Its time opens up for the next customer. */
export function cancel(s: Schedule, id: string): Result {
  const old = s.bookings.find((b) => b.id === id);
  if (!old) return { ok: false, reason: "That booking is gone." };
  const svc = service(old.serviceId);
  let next: Schedule = { ...s, bookings: s.bookings.filter((b) => b.id !== id) };
  next = message(next, { to: "owner", channel: "text", subject: "Visit canceled", body: `${old.customer} canceled their ${svc.name.toLowerCase()}. That time is open on the booking page again.` });
  next = message(next, {
    to: "customer",
    channel: "email",
    subject: "Your visit is canceled",
    body: `Hi ${firstName(old.customer)}, your ${svc.name.toLowerCase()} is canceled. Book again any time from the same page.`,
  });
  return { ok: true, schedule: next, id };
}

export interface NewBlock {
  day: Day;
  start: number;
  minutes: number;
  reason: string;
}

/** The owner blocks off time. It never covers a booked visit. */
export function blockTime(s: Schedule, n: NewBlock): Result {
  const end = Math.min(n.start + n.minutes, hours.close);
  if (isClosed(n.day)) return { ok: false, reason: "That day is already closed." };
  if (n.start < hours.open || end <= n.start) return { ok: false, reason: "Pick a time inside opening hours." };
  const clash = s.bookings.find((b) => b.day === n.day.offset && overlaps(n.start, end, b.start, bookingEnd(b)));
  if (clash) return { ok: false, reason: `${clash.customer} is booked at ${formatTime(clash.start)}. Move or cancel that visit first.` };
  const id = `k${s.nextId}`;
  const block: Block = { id, day: n.day.offset, start: n.start, minutes: end - n.start, reason: n.reason.trim() || "Blocked" };
  return { ok: true, schedule: { ...s, blocks: [...s.blocks, block], nextId: s.nextId + 1 }, id };
}

export function unblock(s: Schedule, id: string): Schedule {
  return { ...s, blocks: s.blocks.filter((b) => b.id !== id) };
}

function firstName(name: string) {
  return name.split(" ")[0];
}

/** What the owner's day holds, in order: visits, blocks and the open gaps. */
export type DayItem =
  | { kind: "visit"; start: number; end: number; booking: Booking }
  | { kind: "block"; start: number; end: number; block: Block }
  | { kind: "open"; start: number; end: number };

export function dayItems(s: Schedule, day: Day): DayItem[] {
  if (isClosed(day)) return [];
  const busy: DayItem[] = [
    ...s.bookings.filter((b) => b.day === day.offset).map((b): DayItem => ({ kind: "visit", start: b.start, end: bookingEnd(b), booking: b })),
    ...s.blocks.filter((b) => b.day === day.offset).map((b): DayItem => ({ kind: "block", start: b.start, end: b.start + b.minutes, block: b })),
  ].sort((a, b) => a.start - b.start);
  const out: DayItem[] = [];
  let cursor: number = hours.open;
  for (const item of busy) {
    if (item.start > cursor) out.push({ kind: "open", start: cursor, end: item.start });
    out.push(item);
    cursor = Math.max(cursor, item.end);
  }
  if (cursor < hours.close) out.push({ kind: "open", start: cursor, end: hours.close });
  return out;
}

const names = ["Marisa T.", "Glen O.", "Priya S.", "Jules B.", "Ana C.", "Tom W.", "Keisha L.", "Rafael D.", "Wen H.", "Carla M.", "Omar F.", "Beth N."];
const seedAreas = ["Wilton Manors", "Davie", "Fort Lauderdale", "Oakland Park", "Dania Beach", "Plantation"];

/** Four day shapes, so the week looks lived in and leaves real gaps. */
const patterns: { start: number; serviceId: ServiceId }[][] = [
  [
    { start: 8 * 60, serviceId: "standard" },
    { start: 13 * 60, serviceId: "deep" },
  ],
  [
    { start: 8 * 60, serviceId: "deep" },
    { start: 14 * 60 + 30, serviceId: "standard" },
  ],
  [{ start: 8 * 60, serviceId: "move" }],
  [{ start: 13 * 60 + 30, serviceId: "standard" }],
];

/** The sample week. Same days in, same schedule out. */
export function seed(week: Day[]): Schedule {
  const bookings: Booking[] = [];
  let n = 0;
  for (const day of week) {
    if (isClosed(day)) continue;
    const shape = day.offset === 0 ? [...patterns[0], { start: 10 * 60 + 30, serviceId: "standard" as const }] : patterns[day.offset % patterns.length];
    for (const p of shape) {
      bookings.push({ id: `s${n}`, day: day.offset, start: p.start, serviceId: p.serviceId, customer: names[n % names.length], area: seedAreas[n % seedAreas.length] });
      n++;
    }
  }
  bookings.sort((a, b) => a.day - b.day || a.start - b.start);
  const firstOpen = week.find((d) => d.offset >= 2 && !isClosed(d));
  const blocks: Block[] = firstOpen ? [{ id: "k0", day: firstOpen.offset, start: 16 * 60, minutes: 60, reason: "Supply pickup" }] : [];
  return { bookings, blocks, outbox: [], nextId: 1 };
}
