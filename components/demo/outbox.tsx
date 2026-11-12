import type { Outgoing } from "@/lib/demo/types";
import { MailIcon, TextIcon } from "../icons";

/** Every message the system would send, newest first. None is sent. */
export function Outbox({ outbox }: { outbox: Outgoing[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5">
      <h2 className="font-display text-title">What would go out</h2>
      <p className="mt-0.5 text-label font-normal text-ink-muted">Each email and text the system would send. In the demo, none is sent.</p>
      {outbox.length === 0 ? (
        <p className="mt-3 rounded-xl bg-sunk px-4 py-3 text-label font-normal text-ink-muted">Nothing yet. Book a visit to see the confirmation and the owner&apos;s alert.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {outbox.map((m) => (
            <li key={m.id} className="arrive rounded-xl bg-paper px-4 py-3">
              <p className="flex flex-wrap items-center justify-between gap-2 text-micro text-ink-muted">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  {m.channel === "email" ? <MailIcon width={14} height={14} /> : <TextIcon width={14} height={14} />}
                  {m.channel === "email" ? "Email" : "Text"} to the {m.to}
                </span>
                <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold">Not sent</span>
              </p>
              <p className="mt-1 text-label">{m.subject}</p>
              <p className="mt-0.5 text-label font-normal text-ink-muted">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
