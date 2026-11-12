// The made-up Sample Business. Not a real company: no real name, person,
// address or phone number. Durations only; never a price.

export const business = {
  name: "Coquina Home Cleaning",
  area: "Broward and Palm Beach",
  owner: "Imani",
  hours: "Monday to Saturday, 8:00 AM to 4:00 PM",
} as const;

export type Service = { id: string; name: string; minutes: number; blurb: string };

export const services: readonly Service[] = [
  { id: "standard", name: "Standard clean", minutes: 120, blurb: "Kitchen, bathrooms, floors and dusting. A good reset for a lived-in home." },
  { id: "deep", name: "Deep clean", minutes: 240, blurb: "Everything in a standard clean, plus baseboards, inside the oven and behind the furniture." },
  { id: "move", name: "Move-out clean", minutes: 180, blurb: "An empty home, cleaned top to bottom for the next people." },
  { id: "windows", name: "Window wash", minutes: 90, blurb: "Inside and out, tracks and screens included." },
] as const;

export const crewNames = ["Crew A", "Crew B"] as const;
