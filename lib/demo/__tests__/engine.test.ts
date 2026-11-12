import { describe, expect, it } from "vitest";
import { hours, TRAVEL_BUFFER } from "../business";
import { blockTime, book, cancel, dayItems, days, formatTime, openTimes, reschedule, seed, unblock } from "../engine";
import type { Schedule } from "../types";

// Wednesday 2026-11-11. Day 4 is Sunday 2026-11-15.
const week = days(new Date(2026, 10, 11));
const sunday = week[4];
const thursday = week[1];
const friday = week[2];

const empty: Schedule = { bookings: [], blocks: [], outbox: [], nextId: 1 };
const dana = { customer: "Dana K.", email: "dana@example.com", area: "Plantation" };

function ok(r: ReturnType<typeof book>) {
  if (!r.ok) throw new Error(r.reason);
  return r;
}

describe("days", () => {
  it("labels days from today", () => {
    expect(week[0].label).toBe("Wed, Nov 11");
    expect(sunday.weekday).toBe(0);
    expect(week).toHaveLength(14);
  });
});

describe("formatTime", () => {
  it("writes a 12-hour time", () => {
    expect(formatTime(8 * 60)).toBe("8:00 AM");
    expect(formatTime(12 * 60 + 30)).toBe("12:30 PM");
    expect(formatTime(17 * 60)).toBe("5:00 PM");
  });
});

describe("openTimes", () => {
  it("offers every half hour that fits inside opening hours", () => {
    const times = openTimes(empty, thursday, 120);
    expect(times[0]).toBe(hours.open);
    expect(times.at(-1)).toBe(hours.close - 120);
    expect(times.every((t) => t % 30 === 0)).toBe(true);
  });

  it("offers nothing on Sunday, today, or past the booking window", () => {
    expect(openTimes(empty, sunday, 120)).toEqual([]);
    expect(openTimes(empty, week[0], 120)).toEqual([]);
    expect(openTimes(empty, days(new Date(2026, 10, 11), 30)[20], 120)).toEqual([]);
  });

  it("keeps the travel buffer around a booked visit", () => {
    const s = ok(book(empty, { serviceId: "standard", day: thursday, start: 12 * 60, ...dana })).schedule;
    const times = openTimes(s, thursday, 60);
    // The visit runs 12:00 to 2:00 PM. A one-hour visit must end by 11:30 and start from 2:30.
    expect(times).toContain(12 * 60 - TRAVEL_BUFFER - 60);
    expect(times).not.toContain(11 * 60);
    expect(times).not.toContain(14 * 60);
    expect(times).toContain(14 * 60 + TRAVEL_BUFFER);
  });

  it("hides blocked time from the booking page", () => {
    const s = ok(blockTime(empty, { day: thursday, start: 13 * 60, minutes: 120, reason: "Dentist" })).schedule;
    const times = openTimes(s, thursday, 60);
    expect(times).not.toContain(13 * 60);
    expect(times).not.toContain(14 * 60);
    expect(times).toContain(12 * 60);
    expect(times).toContain(15 * 60);
  });
});

describe("book", () => {
  it("books an open time and drafts the confirmation and the owner alert", () => {
    const r = ok(book(empty, { serviceId: "deep", day: thursday, start: 9 * 60, ...dana }));
    expect(r.schedule.bookings).toHaveLength(1);
    expect(r.schedule.bookings[0]).toMatchObject({ online: true, customer: "Dana K." });
    expect(r.schedule.outbox.map((m) => m.to)).toEqual(["customer", "owner"]);
    expect(r.schedule.outbox[0].subject).toBe("You're booked: Thu, Nov 12 at 9:00 AM");
  });

  it("refuses a time that is taken, even if the page still shows it", () => {
    const s = ok(book(empty, { serviceId: "standard", day: thursday, start: 9 * 60, ...dana })).schedule;
    const again = book(s, { serviceId: "standard", day: thursday, start: 10 * 60, ...dana });
    expect(again).toEqual({ ok: false, reason: "That time was just taken. Pick another one." });
  });

  it("needs a name", () => {
    expect(book(empty, { serviceId: "standard", day: thursday, start: 9 * 60, ...dana, customer: " " }).ok).toBe(false);
  });
});

describe("reschedule and cancel", () => {
  const booked = ok(book(empty, { serviceId: "standard", day: thursday, start: 9 * 60, ...dana }));

  it("moves a visit and opens the old time again", () => {
    const moved = ok(reschedule(booked.schedule, booked.id, friday, 13 * 60));
    expect(moved.schedule.bookings[0]).toMatchObject({ day: friday.offset, start: 13 * 60 });
    expect(openTimes(moved.schedule, thursday, 120)).toContain(9 * 60);
    expect(moved.schedule.outbox[0].subject).toBe("Your visit moved to Fri, Nov 13 at 1:00 PM");
  });

  it("can move a visit to a time that overlaps its own old time", () => {
    expect(reschedule(booked.schedule, booked.id, thursday, 9 * 60 + 30).ok).toBe(true);
  });

  it("cancels a visit and frees its time", () => {
    const gone = ok(cancel(booked.schedule, booked.id));
    expect(gone.schedule.bookings).toEqual([]);
    expect(openTimes(gone.schedule, thursday, 120)).toContain(9 * 60);
    expect(gone.schedule.outbox.map((m) => m.subject)).toContain("Your visit is canceled");
  });
});

describe("blockTime", () => {
  it("never covers a booked visit", () => {
    const s = ok(book(empty, { serviceId: "standard", day: thursday, start: 9 * 60, ...dana })).schedule;
    const r = blockTime(s, { day: thursday, start: 10 * 60, minutes: 60, reason: "Errand" });
    expect(r).toEqual({ ok: false, reason: "Dana K. is booked at 9:00 AM. Move or cancel that visit first." });
  });

  it("stops at closing time and can be removed", () => {
    const r = ok(blockTime(empty, { day: thursday, start: 16 * 60, minutes: 180, reason: "" }));
    expect(r.schedule.blocks[0]).toMatchObject({ minutes: 60, reason: "Blocked" });
    expect(unblock(r.schedule, r.id).blocks).toEqual([]);
  });

  it("refuses Sunday", () => {
    expect(blockTime(empty, { day: sunday, start: 9 * 60, minutes: 60, reason: "x" }).ok).toBe(false);
  });
});

describe("seed and dayItems", () => {
  const s = seed(week);

  it("fills today and leaves every bookable day with open times", () => {
    expect(s.bookings.filter((b) => b.day === 0).length).toBeGreaterThanOrEqual(3);
    for (const d of week.slice(1)) {
      if (d.weekday === 0) expect(openTimes(s, d, 120)).toEqual([]);
      else expect(openTimes(s, d, 120).length, d.label).toBeGreaterThan(0);
    }
  });

  it("never seeds a visit over a block or on Sunday", () => {
    expect(s.bookings.some((b) => b.day === sunday.offset)).toBe(false);
    for (const k of s.blocks) {
      const clash = s.bookings.some((b) => b.day === k.day && b.start < k.start + k.minutes && k.start < b.start + 120);
      expect(clash).toBe(false);
    }
  });

  it("lays out the owner's day from open to close with no holes", () => {
    const items = dayItems(s, week[0]);
    expect(items[0].start).toBe(hours.open);
    expect(items.at(-1)?.end).toBe(hours.close);
    for (let i = 1; i < items.length; i++) expect(items[i].start).toBe(items[i - 1].end);
  });

  it("never marks anything as sent", () => {
    const r = ok(book(s, { serviceId: "standard", day: thursday, start: openTimes(s, thursday, 120)[0], ...dana }));
    expect(JSON.stringify(r.schedule.outbox)).not.toMatch(/"sent"/);
  });
});
