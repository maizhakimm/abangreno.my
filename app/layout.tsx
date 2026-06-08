import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://abangreno.my"),
  title: "Abang Reno | Waterproofing, Painting & Home Repair Services Klang Valley",
  description:
    "Professional waterproofing, wall crack repair, painting, epoxy coating, mirror installation and minor renovation services throughout Klang Valley. Request a quotation through WhatsApp today.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Abang Reno | Waterproofing, Painting & Home Repair Services Klang Valley",
    description:
      "Professional waterproofing, wall crack repair, painting, epoxy coating, mirror installation and minor renovation services throughout Klang Valley.",
    url: "https://abangreno.my",
    siteName: "Abang Reno",
    images: [{ url: "/team-van.svg", width: 1200, height: 820, alt: "Abang Reno local team with branded service van" }],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abang Reno | Waterproofing, Painting & Home Repair Services Klang Valley",
    description:
      "Waterproofing, painting, home repair and minor renovation services throughout Klang Valley.",
    images: ["/team-van.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-MY">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
