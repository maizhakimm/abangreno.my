import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BUSINESS } from "./site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const title = "Abang Reno | Lantai Epoxy & Baiki Dinding Retak / Bocor di Klang Valley";
const shareTitle = "Abang Reno | Lantai Epoxy & Baiki Dinding Retak / Bocor";
const shareDescription = "Site inspection PERCUMA di seluruh Klang Valley. Quotation bertulis sebelum kerja bermula. WhatsApp 011-5131 7030.";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  title,
  description: BUSINESS.description,
  keywords: ["epoxy lantai", "lantai epoxy Klang Valley", "baiki dinding retak", "dinding bocor", "dinding lembap", "kalis air dinding", "waterproofing dinding"],
  alternates: { canonical: "/" },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: BUSINESS.url,
    siteName: BUSINESS.name,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Abang Reno: Lantai Epoxy & Baiki Dinding Retak / Bocor" }],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5a00",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms-MY">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
