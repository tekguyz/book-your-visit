import type { Metadata, Viewport } from "next";
import { Onest, Young_Serif } from "next/font/google";
import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";
import "./globals.css";

// Fonts and colors follow DESIGN.md.
const youngSerif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young-serif" });
const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

// The link preview: title, description and app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: `${siteName} · ${siteTagline}`, template: `%s · ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} · ${siteTagline}`,
    description: siteDescription,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${siteName} · ${siteTagline}`, description: siteDescription },
};

export const viewport: Viewport = { themeColor: "#f7f4ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${onest.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col text-body text-ink">{children}</body>
    </html>
  );
}
