import { describe, expect, it } from "vitest";
import { addBlock, addDays, book, cancel, dayBookings, formatTime, isOpenDay, openTimes, removeBlock, reschedule, seed } from "../engine";
import type { DemoState } from "../types";

// 2026-11-11 is a Wednesday.
const today = "2026-11-11";
const early = { date: today, minutes: 6 * 60 };
const empty: DemoState = { bookings: [], blocks: [], next: 1 };
const draft = { serviceId: "standard", date: "2026-11-12", start: 9 * 60, name: "Ana K.", email: "ana@example.com", notes: "" };

function ok<T>(r: { ok: true; state: DemoState; value: T } | { ok: false; error: string }) {
  if (!r.ok) throw new Error(r.error);
  return r;
}

describe("dates and times", () => {
  it("formats times", () => {
    expect(formatTime(8 * 60)).toBe("8:00 AM");
    expect(formatTime(12 * 60 + 30)).toBe("12:30 PM");
  });
  it("closes on Sundays", () => {
    expect(isOpenDay("2026-11-15")).toBe(false);
    expect(addDays("2026-11-14", 1)).toBe("2026-11-15");
    expect(openTimes(empty, "standard", "2026-11-15", early)).toEqual([]);
  });
});

describe("openTimes", () => {
  it("never runs a visit past closing", () => {
    const times = openTimes(empty, "deep", "2026-11-12", early);
    expect(times[0]).toBe(8 * 60);
    expect(times.at(-1)).toBe(12 * 60);
  });
  it("hides past days and times too soon from now", () => {
    expect(openTimes(empty, "standard", "2026-11-10", early)).toEqual([]);
    const noon = { date: today, minutes: 12 * 60 };
    expect(openTimes(empty, "windows", today, noon)[0]).toBe(14 * 60);
  });
  it("stays open until both crews are busy", () => {
    const one = ok(book(empty, draft, early));
    expect(openTimes(one.state, "standard", "2026-11-12", early)).toContain(9 * 60);
    const two = ok(book(one.state, { ...draft, name: "Bo L." }, early));
    const times = openTimes(two.state, "standard", "2026-11-12", early);
    expect(times).not.toContain(9 * 60);
    expect(times).not.toContain(10 * 60); // 10 to 12 overlaps the 9 to 11 visits
    expect(times).toContain(11 * 60);
  });
  it("a block closes the time for everyone", () => {
    const r = ok(addBlock(empty, { date: "2026-11-12", start: 10 * 60, end: 12 * 60, reason: "" }));
    const times = openTimes(r.state, "standard", "2026-11-12", early);
    expect(times).toContain(8 * 60);
    expect(times).not.toContain(9 * 60 + 30);
    expect(times).not.toContain(11 * 60);
    expect(times).toContain(12 * 60);
    const back = removeBlock(r.state, r.value.block.id);
    expect(openTimes(back, "standard", "2026-11-12", early)).toContain(11 * 60);
  });
});

describe("book, reschedule, cancel", () => {
  it("books a free time and refuses a blocked one", () => {
    expect(book(empty, draft, early).ok).toBe(true);
    const blocked = ok(addBlock(empty, { date: "2026-11-12", start: 8 * 60, end: 16 * 60, reason: "Day off" }));
    expect(book(blocked.state, draft, early)).toMatchObject({ ok: false });
  });
  it("needs a name and an email", () => {
    expect(book(empty, { ...draft, name: " " }, early)).toMatchObject({ ok: false });
    expect(book(empty, { ...draft, email: "nope" }, early)).toMatchObject({ ok: false });
  });
  it("can move to a time that overlaps its own old slot", () => {
    const a = ok(book(empty, draft, early));
    const moved = ok(reschedule(a.state, a.value.id, "2026-11-12", 10 * 60, early));
    expect(moved.value.start).toBe(10 * 60);
    expect(moved.state.bookings).toHaveLength(1);
  });
  it("cancelling frees the time, and a cancelled visit cannot move", () => {
    let state = empty;
    for (const name of ["A", "B"]) state = ok(book(state, { ...draft, name }, early)).state;
    expect(openTimes(state, "standard", "2026-11-12", early)).not.toContain(9 * 60);
    state = cancel(state, "b1");
    expect(openTimes(state, "standard", "2026-11-12", early)).toContain(9 * 60);
    expect(reschedule(state, "b1", "2026-11-13", 9 * 60, early)).toMatchObject({ ok: false });
  });
  it("blocking over a booking names the visit to call", () => {
    const a = ok(book(empty, draft, early));
    const r = ok(addBlock(a.state, { date: "2026-11-12", start: 9 * 60, end: 10 * 60, reason: "Dentist" }));
    expect(r.value.clashes.map((b) => b.name)).toEqual(["Ana K."]);
    expect(addBlock(a.state, { date: "2026-11-12", start: 600, end: 600, reason: "" })).toMatchObject({ ok: false });
  });
});

describe("seed", () => {
  it("makes visits on open days from today on, including when today is a Sunday", () => {
    for (const t of ["2026-11-11", "2026-11-14", "2026-11-15"]) {
      const s = seed(t);
      expect(s.bookings.every((b) => isOpenDay(b.date) && b.date >= t)).toBe(true);
      expect(dayBookings(s, s.bookings[0].date).length).toBeGreaterThan(0);
    }
  });
});
