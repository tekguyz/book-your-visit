// Small line icons, 24px grid, drawn after Lucide (ISC license).
import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

type P = SVGProps<SVGSVGElement>;
export const CalendarIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
export const ClockIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>);
export const CheckIcon = (p: P) => (<svg {...base} {...p}><path d="M20 6 9 17l-5-5" /></svg>);
export const PinIcon = (p: P) => (<svg {...base} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
export const ArrowLeftIcon = (p: P) => (<svg {...base} {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
export const ChevronLeftIcon = (p: P) => (<svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>);
export const ChevronRightIcon = (p: P) => (<svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>);
export const MailIcon = (p: P) => (<svg {...base} {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>);
export const TextIcon = (p: P) => (<svg {...base} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
export const BanIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></svg>);
export const RepeatIcon = (p: P) => (<svg {...base} {...p}><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>);
export const UserIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>);
export const XIcon = (p: P) => (<svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>);
