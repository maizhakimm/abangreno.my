import Image, { getImageProps } from "next/image";
import {
  BUSINESS,
  SERVICE_AREAS,
  faqs,
  galleryIsPlaceholder,
  heroGuarantees,
  whatsappLink,
} from "./site";
import { HeroContent } from "./hero-content";
import { services } from "./services-data";
import { ServicesTabs } from "./services-tabs";
import { ProcessSteps } from "./process-steps";
import { WhatsAppIcon } from "./whatsapp-icon";

const heroImageAlt = "Pasukan Abang Reno beruniform bersama van servis";
const { props: heroDesktop } = getImageProps({ src: "/hero-team-desktop.webp", alt: heroImageAlt, width: 1672, height: 941, quality: 80, priority: true });
const { props: heroMobile } = getImageProps({ src: "/hero-team-mobile.webp", alt: heroImageAlt, width: 941, height: 1672, quality: 80, priority: true, sizes: "100vw" });

const navLinks = [
  { label: "Servis", href: "#servis" },
  { label: "Proses", href: "#proses" },
  { label: "Hasil Kerja", href: "#projek" },
  { label: "Kawasan", href: "#kawasan" },
  { label: "Soalan Lazim", href: "#faq" },
];

// Simple line icons (24x24, stroke) for the trust strip.
const trustIcons = {
  inspect: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  shield: "M12 3l7.5 3v5.25c0 4.6-3.2 8.4-7.5 9.75-4.3-1.35-7.5-5.15-7.5-9.75V6L12 3Zm-3 9l2 2 4-4",
  team: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.6a3 3 0 0 1 0 5.8",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

const trustPoints = [
  { icon: trustIcons.inspect, title: "Site Inspection PERCUMA", text: "Tiada sebarang bayaran." },
  { icon: trustIcons.shield, title: "Jaminan Perkhidmatan", text: "6 Bulan" },
  { icon: trustIcons.team, title: "Profesional Team", text: "Pengalaman lebih 10 tahun" },
  { icon: trustIcons.pin, title: "Seluruh Klang Valley", text: "KL, Selangor & Putrajaya." },
];

const gallery = [
  { src: "/before-after-epoxy.webp", alt: "Sebelum dan selepas lantai epoxy bilik air", caption: "Lantai epoxy bilik air" },
  { src: "/before-after-wall-crack.webp", alt: "Sebelum dan selepas baiki dinding retak", caption: "Baiki dinding retak" },
  { src: "/before-after-water-proofing.webp", alt: "Sebelum dan selepas kalis air", caption: "Kalis air bumbung rata" },
];

const reasons = [
  {
    title: "Pemilik sendiri turun ke tapak",
    text: "Anda berurusan terus dengan orang yang buat kerja. Tiada orang tengah, tiada salah faham.",
  },
  {
    title: "Penyediaan permukaan yang betul",
    text: "Epoxy tertanggal dan dinding bocor semula selalunya berpunca daripada penyediaan yang tidak betul. Kami tidak potong langkah ini.",
  },
  {
    title: "Nasihat jujur",
    text: "Kalau masalah anda boleh selesai dengan cara yang lebih murah, kami akan beritahu.",
  },
  {
    title: "Bersih & kemas",
    text: "Perabot dilindungi semasa kerja dan tapak dibersihkan selepas siap.",
  },
];

function WhatsAppButton({
  children,
  service,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  service?: string;
  variant?: "primary" | "dark" | "whatsapp";
  className?: string;
}) {
  const variants = {
    primary: "bg-orange-600 text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700",
    dark: "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20 hover:bg-neutral-800",
    whatsapp: "bg-[#1fa855] text-white shadow-lg shadow-green-700/25 hover:bg-[#178a45]",
  };

  return (
    <a
      href={whatsappLink(service)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold transition sm:text-base ${variants[variant]} ${className}`}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

function SectionHeader({ eyebrow, title, subtitle, tone = "light" }: { eyebrow: string; title: string; subtitle?: string; tone?: "light" | "dark" }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-orange-600">{eyebrow}</p>
      <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${tone === "dark" ? "text-white" : "text-neutral-950"}`}>{title}</h2>
      {subtitle ? <p className={`mt-4 text-base leading-7 ${tone === "dark" ? "text-white/70" : "text-neutral-600"}`}>{subtitle}</p> : null}
    </div>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: BUSINESS.name,
  legalName: BUSINESS.company,
  url: BUSINESS.url,
  logo: `${BUSINESS.url}/logo.webp`,
  image: `${BUSINESS.url}/og-image.jpg`,
  description: BUSINESS.description,
  areaServed: SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
  address: { "@type": "PostalAddress", addressRegion: "Selangor", addressCountry: "MY" },
  makesOffer: services.map((service) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.title } })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 text-white backdrop-blur-xl">
        <div className="section-shell flex min-h-16 items-center justify-between gap-4 py-2 sm:min-h-20">
          <a href="#utama" className="flex items-center gap-3" aria-label="Abang Reno, ke atas">
            <Image src="/logo.webp" width={52} height={52} alt="" priority className="h-11 w-11 sm:h-13 sm:w-13" />
            <div className="leading-tight">
              <p className="text-lg font-black">Abang Reno</p>
              <p className="hidden text-xs font-bold text-white/60 sm:block">Epoxy · Dinding Retak & Bocor</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-bold text-white/80 transition hover:text-orange-400">
                {link.label}
              </a>
            ))}
          </nav>

          <WhatsAppButton variant="whatsapp" className="min-h-11 whitespace-nowrap px-4 text-sm sm:px-5">
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">WhatsApp Kami</span>
          </WhatsAppButton>
        </div>
      </header>

      <main id="utama" className="overflow-hidden">
        {/* Hero */}
        <section className="relative isolate flex flex-col overflow-hidden bg-neutral-950 text-white lg:min-h-[680px] lg:justify-center">
          <HeroContent />

          {/* Mobile/tablet: photo sits below the text. Desktop: full-bleed background. */}
          <div className="relative -z-20 -mt-20 overflow-hidden sm:-mt-28 lg:absolute lg:inset-0 lg:mt-0">
            <picture>
              <source media="(min-width: 1024px)" srcSet={heroDesktop.srcSet} sizes="100vw" />
              <img
                {...heroMobile}
                alt={heroImageAlt}
                className="hero-kenburns aspect-[941/1000] w-full object-cover object-bottom sm:aspect-[941/820] lg:aspect-auto lg:h-full lg:object-[70%_center]"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/30 via-30% to-transparent to-50% lg:hidden" />
          </div>
          {/* Keeps desktop text readable over the photo. */}
          <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-neutral-950/90 via-neutral-950/55 via-50% to-transparent lg:block" />

          {/* Wide screens: guarantees float over the photo. Smaller screens show them under the CTA. */}
          <div className="hero-rise absolute bottom-24 right-8 hidden rounded-2xl bg-neutral-950/40 p-6 text-white ring-1 ring-white/20 backdrop-blur-md [animation-delay:500ms] xl:block">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Jaminan Kami</p>
            <ul className="mt-4 grid gap-3 text-sm font-bold">
              {heroGuarantees.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <a href="#servis" aria-label="Skrol ke bawah" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white lg:block">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>

        {/* Trust strip */}
        <section aria-label="Kenapa boleh percaya" className="bg-[#fffaf5]">
          <div className="section-shell grid grid-cols-2 gap-3 py-8 sm:gap-4 lg:grid-cols-4 lg:py-10">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-5"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={point.icon} />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-black leading-snug text-neutral-950 sm:text-base">{point.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-600 sm:text-sm">{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="servis" className="section-shell py-16 sm:py-24">
          <SectionHeader eyebrow="Apa Kami Buat" title="Servis Kami" />
          <ServicesTabs />
        </section>

        {/* Process */}
        <section id="proses" className="relative overflow-hidden bg-neutral-950 py-16 sm:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-orange-600/20 blur-3xl" />
          <div className="section-shell relative">
            <SectionHeader tone="dark" eyebrow="Cara Kami Bekerja" title="Semudah 4 Langkah" subtitle="Dari WhatsApp pertama sampai kerja siap. Telus di setiap langkah." />
            <ProcessSteps />
          </div>
        </section>

        {/* Gallery */}
        <section id="projek" className="section-shell py-16 sm:py-24">
          <SectionHeader eyebrow="Hasil Kerja" title="Sebelum & Selepas" subtitle="Perbezaan yang anda boleh lihat dan rasa." />
          <div className="grid gap-6 md:grid-cols-3">
            {gallery.map((item) => (
              <figure key={item.src} className="overflow-hidden rounded-[1.75rem] bg-white card-shadow">
                <Image src={item.src} alt={item.alt} width={1536} height={1024} sizes="(min-width: 768px) 360px, 100vw" className="aspect-[3/2] w-full object-cover" />
                <figcaption className="px-5 py-4 font-bold text-neutral-800">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
          {galleryIsPlaceholder ? <p className="mt-5 text-center text-xs text-neutral-500">* Gambar ilustrasi. Gambar projek sebenar akan dikemas kini.</p> : null}
        </section>

        {/* Why us */}
        <section className="bg-white py-16 sm:py-24">
          <div className="section-shell">
            <SectionHeader eyebrow="Kenapa Abang Reno" title="Kerja Yang Dibuat Dengan Betul" />
            <div className="grid gap-5 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason.title} className="rounded-[1.5rem] bg-[#fffaf5] p-6 ring-1 ring-orange-100">
                  <h3 className="text-lg font-black text-neutral-950">{reason.title}</h3>
                  <p className="mt-2 leading-7 text-neutral-600">{reason.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service areas */}
        <section id="kawasan" className="section-shell py-16 sm:py-24">
          <SectionHeader eyebrow="Kawasan Servis" title="Kami Cover Seluruh Klang Valley" subtitle="Site inspection percuma untuk semua kawasan di bawah. Kawasan anda tiada dalam senarai? WhatsApp kami untuk semak." />
          <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
            {SERVICE_AREAS.map((area) => (
              <li key={area} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-800 shadow-sm ring-1 ring-black/5">
                📍 {area}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white py-16 sm:py-24">
          <div className="section-shell">
            <SectionHeader eyebrow="Soalan Lazim" title="Soalan Yang Selalu Ditanya" />
            <div className="mx-auto grid max-w-3xl gap-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-[1.5rem] bg-[#fffaf5] p-5 ring-1 ring-orange-100 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-black text-neutral-950 sm:text-lg">
                    {faq.q}
                    <span aria-hidden="true" className="text-2xl leading-none text-orange-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 leading-7 text-neutral-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-shell py-16 sm:py-24">
          <div className="orange-gradient rounded-[2.5rem] p-8 text-white shadow-[0_40px_80px_rgba(255,90,0,0.25)] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Jangan Biar Masalah Makin Teruk</h2>
                <p className="mt-5 text-lg leading-8 text-white/85">
                  Retak kecil dan lantai yang rosak akan jadi lebih mahal untuk dibaiki jika dibiarkan. WhatsApp gambar sekarang dan tempah site
                  inspection percuma.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <WhatsAppButton variant="dark">Tempah Inspection Percuma</WhatsAppButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-950 pb-28 pt-14 text-white sm:pb-16">
        <div className="section-shell grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.webp" width={56} height={56} alt="" />
              <p className="text-2xl font-black">Abang Reno</p>
            </div>
            <p className="mt-4 max-w-sm text-white/70">Pakar lantai epoxy dan baik pulih dinding retak & bocor di Klang Valley.</p>
          </div>
          <div>
            <h2 className="text-lg font-black">Hubungi</h2>
            <ul className="mt-4 grid gap-2 text-white/70">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-orange-400">
                  WhatsApp Kami →
                </a>
              </li>
              <li>Kawasan: Klang Valley</li>
              <li>Website: abangreno.my</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-black">Syarikat</h2>
            <ul className="mt-4 grid gap-2 text-white/70">
              <li>{BUSINESS.company}</li>
              <li>No. Pendaftaran: {BUSINESS.ssm}</li>
            </ul>
          </div>
        </div>
        <p className="section-shell mt-12 border-t border-white/10 pt-6 text-sm text-white/50">
          © {new Date().getFullYear()} {BUSINESS.company}. Hak cipta terpelihara.
        </p>
      </footer>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Abang Reno"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#1fa855] px-4 text-base font-black text-white shadow-2xl shadow-green-700/30 transition hover:scale-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
        <span className="hidden sm:inline">WhatsApp Kami</span>
      </a>
    </>
  );
}
