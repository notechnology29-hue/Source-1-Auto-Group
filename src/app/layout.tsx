import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#090A0F",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Source 1 Auto Group | Transparent Used Cars",
  description:
    "Premium pre-owned vehicles with full transparency: hotspot-inspected photos, live payment estimates, and 24-hour holds.",
  openGraph: {
    type: "website",
    siteName: "Source 1 Auto Group",
    title: "Source 1 Auto Group | Transparent Used Cars",
    description: "Driven By Performance. Built On Trust. Browse pre-owned vehicles with nothing hidden.",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
