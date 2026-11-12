import type { Service } from "./types";

// The made-up Sample Business the demo plays (DEMO-STANDARD.md). Tidy Heron
// Home Cleaning was searched on 2026-11-11 and nothing uses the name. Every
// customer is a first name and an initial. No prices, no phone numbers.

export const business = {
  name: "Tidy Heron Home Cleaning",
  short: "Tidy Heron",
  owner: "Yolanda",
  region: "Broward County",
} as const;

export const services: Service[] = [
  { id: "standard", name: "Standard clean", minutes: 120, blurb: "Kitchen, bathrooms, floors and dusting. For a home kept up week to week." },
  { id: "deep", name: "Deep clean", minutes: 180, blurb: "Everything in a standard clean, plus baseboards, inside the oven and the corners that wait." },
  { id: "move", name: "Move-in or move-out clean", minutes: 240, blurb: "An empty home, top to bottom, inside cabinets and closets." },
];

export const areas = ["Fort Lauderdale", "Wilton Manors", "Oakland Park", "Plantation", "Davie", "Dania Beach"] as const;

/** Opening hours. Sunday is closed. */
export const hours = { open: 8 * 60, close: 17 * 60, closedWeekday: 0 } as const;

/** Times start on the half hour. */
export const SLOT_STEP = 30;

/** Room to drive between two homes, kept free between visits. */
export const TRAVEL_BUFFER = 30;

/** How far ahead a customer can book, in days (today is not bookable online). */
export const BOOKING_WINDOW = 13;

/** The visitor's made-up details, filled in so the form takes one press. */
export const sampleCustomer = { name: "Dana K.", email: "dana@example.com", area: "Plantation" } as const;
