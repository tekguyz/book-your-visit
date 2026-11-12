// The words follow CONTEXT.md. Times are minutes after midnight; days are
// offsets from the demo's "today" (0 = today, 1 = tomorrow).

export type ServiceId = "standard" | "deep" | "move";

export interface Service {
  id: ServiceId;
  name: string;
  minutes: number;
  blurb: string;
}

export interface Booking {
  id: string;
  day: number;
  start: number;
  serviceId: ServiceId;
  customer: string;
  area: string;
  /** Booked by the visitor in this demo, on the booking page. */
  online?: boolean;
}

export interface Block {
  id: string;
  day: number;
  start: number;
  minutes: number;
  reason: string;
}

/** A message the system would send. In the demo it is drawn, never sent. */
export interface Outgoing {
  id: string;
  to: "customer" | "owner";
  channel: "email" | "text";
  subject: string;
  body: string;
}

export interface Schedule {
  bookings: Booking[];
  blocks: Block[];
  outbox: Outgoing[];
  /** A counter, so ids stay unique and the engine stays pure. */
  nextId: number;
}

export type Result = { ok: true; schedule: Schedule; id: string } | { ok: false; reason: string };
