import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { colors, PRODUCT_MARK_SVG } from "@/lib/brand";
import { siteName } from "@/lib/site";

// The link-preview card, drawn by the app in its own look (DEMO-STANDARD.md):
// the headline on paper, and a booking card with open times, one picked.
export const alt = `${siteName}. Customers pick a time themselves: a service, an open time, booked, with change and cancel built in.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "app/_og");
const [display, body400, body600] = await Promise.all([
  readFile(join(fontDir, "young-serif-400.woff")),
  readFile(join(fontDir, "onest-400.woff")),
  readFile(join(fontDir, "onest-600.woff")),
]);

const mark = `data:image/svg+xml,${encodeURIComponent(PRODUCT_MARK_SVG)}`;
const times = ["8:30 AM", "9:00 AM", "10:30 AM", "11:00 AM", "1:00 PM", "2:30 PM"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: colors.paper,
          color: colors.ink,
          fontFamily: "Onest",
          padding: "64px 72px",
          borderBottom: `12px solid ${colors.brand}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={56} height={56} alt="" />
            <div style={{ fontSize: 34, fontWeight: 600 }}>{siteName}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontFamily: "YoungSerif", fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.015em" }}>
            <span>Customers pick a time</span>
            <span>themselves.</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 28, color: colors.inkMuted, maxWidth: 560 }}>
            Only the times you are free. Change or cancel without a call.
          </div>
          <div style={{ display: "flex", marginTop: "auto" }}>
            <div style={{ display: "flex", padding: "14px 28px", borderRadius: 14, background: colors.brand, color: "#fff", fontSize: 26, fontWeight: 600 }}>
              Try the demo · no signup
            </div>
          </div>
        </div>
        <div style={{ display: "flex", width: 320, marginLeft: 28, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 320, borderRadius: 24, background: colors.surface, border: `2px solid ${colors.line}`, padding: "26px 24px", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, color: colors.inkMuted }}>Deep clean · 3 hours</span>
              <span style={{ fontSize: 26, fontWeight: 600 }}>Thu, Nov 19</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {times.map((t) => {
                const picked = t === "10:30 AM";
                return (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      width: 126,
                      justifyContent: "center",
                      padding: "12px 0",
                      borderRadius: 12,
                      fontSize: 20,
                      fontWeight: 600,
                      background: picked ? colors.brand : colors.brandSoft,
                      color: picked ? "#fff" : colors.brand,
                    }}
                  >
                    {t}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", marginTop: 6, background: colors.paper, borderRadius: 14, padding: "14px 16px", flexDirection: "column", gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 20 }}>You&apos;re booked</span>
              <span style={{ fontSize: 17, color: colors.inkMuted }}>Change or cancel any time</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "YoungSerif", data: display, weight: 400, style: "normal" },
        { name: "Onest", data: body400, weight: 400, style: "normal" },
        { name: "Onest", data: body600, weight: 600, style: "normal" },
      ],
    },
  );
}
