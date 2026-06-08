import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://abangreno.my"),
  title: "Abang Reno — Waterproofing, Baiki Dinding Retak, Painting di Klang Valley",
  description:
    "Abang Reno menyediakan servis waterproofing, baiki dinding retak, painting, epoxy coating dan pemasangan cermin sekitar Klang Valley dengan quotation yang jelas sebelum kerja bermula.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Abang Reno — Waterproofing & Servis Rumah di Klang Valley",
    description:
      "Abang Reno menyediakan servis waterproofing, baiki dinding retak, painting, epoxy coating dan pemasangan cermin sekitar Klang Valley.",
    url: "https://abangreno.my",
    siteName: "Abang Reno",
    images: [{ url: "/team-van.svg", width: 1200, height: 820, alt: "Abang Reno local team with branded service van" }],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abang Reno — Waterproofing & Servis Rumah di Klang Valley",
    description:
      "Abang Reno menyediakan servis waterproofing, baiki dinding retak, painting, epoxy coating dan pemasangan cermin sekitar Klang Valley.",
    images: ["/team-van.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms-MY">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
