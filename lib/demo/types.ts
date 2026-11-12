export type Booking = {
  id: string;
  serviceId: string;
  /** YYYY-MM-DD */
  date: string;
  /** Minutes after midnight. */
  start: number;
  name: string;
  email: string;
  notes: string;
  crew: 0 | 1;
  status: "booked" | "cancelled";
  /** True for a booking the visitor made in this demo session. */
  mine: boolean;
};

export type Block = { id: string; date: string; start: number; end: number; reason: string };

export type DemoState = { bookings: Booking[]; blocks: Block[]; next: number };

export type Now = { date: string; minutes: number };
