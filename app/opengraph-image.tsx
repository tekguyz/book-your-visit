import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { colors, PRODUCT_MARK_SVG } from "@/lib/brand";
import { siteName } from "@/lib/site";

// The link-preview card, drawn by the app in its own look (DEMO-STANDARD.md):
// the headline on cream, and a booking page with a time picked.
export const alt = `${siteName}. Customers pick their own time: choose a service, see open times, book, change or cancel.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "app/_og");
const [display, body400, body600] = await Promise.all([
  readFile(join(fontDir, "fraunces-700.woff")),
  readFile(join(fontDir, "figtree-400.woff")),
  readFile(join(fontDir, "figtree-600.woff")),
]);

const mark = `data:image/svg+xml,${encodeURIComponent(PRODUCT_MARK_SVG)}`;
const times = ["8:00 AM", "9:30 AM", "11:00 AM", "1:30 PM"];

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
          fontFamily: "Figtree",
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
          <div style={{ display: "flex", flexDirection: "column", marginTop: 44, fontFamily: "Fraunces", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            <span>Let customers</span>
            <span>pick their time.</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 28, color: colors.inkMuted, maxWidth: 560 }}>
            Choose a service, see open times, book, change or cancel. The owner sees the day.
          </div>
          <div style={{ display: "flex", marginTop: "auto" }}>
            <div style={{ display: "flex", padding: "14px 28px", borderRadius: 999, background: colors.brand, color: "#fff", fontSize: 26, fontWeight: 600 }}>
              Try the demo · no signup
            </div>
          </div>
        </div>
        <div style={{ display: "flex", width: 340, marginLeft: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 340, height: 500, borderRadius: 32, background: "#fff", border: "2px solid #E2D6C3", padding: "28px 24px", gap: 14, fontSize: 22 }}>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 28 }}>Deep clean</div>
            <div style={{ display: "flex", color: colors.inkMuted, fontSize: 19 }}>Wednesday · about 4 hours</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {times.map((t, i) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    padding: "12px 16px",
                    borderRadius: 14,
                    fontWeight: 600,
                    fontSize: 20,
                    background: i === 2 ? colors.brand : "#fff",
                    color: i === 2 ? "#fff" : colors.ink,
                    border: `2px solid ${i === 2 ? colors.brand : "#E2D6C3"}`,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: "auto", background: "#DCEEEF", color: "#17565D", borderRadius: 16, padding: "14px 16px", fontWeight: 600, fontSize: 20 }}>
              Wednesday at 11:00 AM is yours.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: display, weight: 700, style: "normal" },
        { name: "Figtree", data: body400, weight: 400, style: "normal" },
        { name: "Figtree", data: body600, weight: 600, style: "normal" },
      ],
    },
  );
}
