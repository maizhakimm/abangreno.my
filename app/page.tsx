import Image from "next/image";
import type { ReactNode } from "react";

const whatsappLink =
  "https://wa.me/601151317030?text=Hi%20Abang%20Reno!%0A%0AService%20Required:%20__________%0ALocation:%20__________%0APlease%20provide%20a%20quotation.%20Thank%20you.";

const navLinks = [
  { label: "Servis", href: "#services" },
  { label: "Sebelum & Selepas", href: "#before-after" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "Hasil Kerja", href: "#projects" },
  { label: "Kawasan", href: "#coverage" },
  { label: "FAQ", href: "#faq" },
];

const trustBadges = ["Respon Pantas", "Quotation Jelas", "Servis Klang Valley", "Pilihan Bayaran Fleksibel"];

const stats = [
  ["500+", "Projek Disiapkan", "Kerja waterproofing, retak, cat, cermin dan epoxy."],
  ["24 Jam", "Respon WhatsApp", "Hantar gambar masalah untuk semakan awal."],
  ["KV", "Servis Seluruh Klang Valley", "Rumah, kedai, pejabat dan premis kecil."],
  ["Awal", "Quotation Sebelum Kerja", "Harga dan skop diterangkan sebelum mula."],
];

const services = [
  {
    title: "Waterproofing",
    description: "Atasi masalah kebocoran pada dinding, siling, bumbung, balkoni dan bilik air.",
    imageClass: "service-waterproofing",
  },
  {
    title: "Baiki Dinding Retak",
    description: "Rawatan dan pembaikan retakan dinding dalaman serta luaran.",
    imageClass: "service-crack",
  },
  {
    title: "Painting Service",
    description: "Cat rumah, pejabat dan premis dengan kemasan kemas dan berkualiti.",
    imageClass: "service-painting",
  },
  {
    title: "Pemasangan Cermin",
    description: "Pemasangan cermin rumah, pejabat dan premis komersial.",
    imageClass: "service-mirror",
  },
  {
    title: "Epoxy Coating",
    description: "Kemasan lantai tahan lasak dan mudah dibersihkan.",
    imageClass: "service-epoxy",
  },
];

const beforeAfter = [
  ["Waterproofing", "Kesan lembap & bocor", "Permukaan dirawat"],
  ["Dinding Retak", "Retak jelas pada dinding", "Retakan dibaiki kemas"],
  ["Painting", "Cat pudar & mengelupas", "Warna baru lebih segar"],
  ["Pemasangan Cermin", "Ruang kosong", "Cermin siap dipasang"],
  ["Epoxy Coating", "Lantai kusam", "Kemasan epoxy berkilat"],
];

const reasons = [
  ["Team Tempatan Klang Valley", "Faham keadaan rumah, kedai dan premis sekitar kawasan Klang Valley."],
  ["Quotation Jelas Sebelum Kerja Bermula", "Skop kerja, cadangan dan anggaran harga diterangkan awal."],
  ["Mudah Berurusan Melalui WhatsApp", "Hantar gambar, lokasi dan masalah rumah terus kepada team kami."],
  ["Kerja Kemas & Berkualiti", "Fokus pada kemasan akhir yang rapi dan praktikal untuk jangka panjang."],
  ["Pilihan Bayaran Fleksibel", "Boleh semak pilihan bayaran melalui rakan pembayaran terpilih."],
  ["Servis Mesra & Profesional", "Komunikasi mudah, sopan dan jelas dari mula hingga selesai."],
];

const payments = ["Atome", "Grab PayLater", "SPayLater", "Boost PayFlex", "Visa", "Mastercard", "FPX", "DuitNow QR"];

const testimonials = [
  "Kerja kemas dan mudah berurusan. Quotation pun jelas.",
  "Respon WhatsApp cepat dan sangat membantu.",
  "Team datang ikut masa dan terangkan kerja sebelum mula.",
];

const gallery = ["Waterproofing", "Dinding Retak", "Painting", "Cermin", "Epoxy"];
const areas = ["Shah Alam", "Klang", "Setia Alam", "Subang Jaya", "Petaling Jaya", "Kuala Lumpur", "Putrajaya", "Selangor"];

const faqs = [
  ["Apa itu waterproofing?", "Waterproofing ialah kerja rawatan untuk mengurangkan risiko air meresap atau bocor pada bumbung, siling, dinding, balkoni, bilik air dan kawasan basah."],
  ["Boleh hantar gambar dahulu melalui WhatsApp?", "Boleh. Hantar gambar masalah rumah, lokasi dan servis yang diperlukan supaya kami boleh bantu semak serta beri cadangan awal."],
  ["Adakah quotation diberi sebelum kerja bermula?", "Ya. Quotation dan skop kerja akan diterangkan sebelum kerja bermula supaya anda jelas dengan anggaran kos dan proses."],
  ["Kawasan mana yang Abang Reno cover?", "Kami cover Shah Alam, Klang, Setia Alam, Subang Jaya, Petaling Jaya, Kuala Lumpur, Putrajaya dan kawasan sekitar Selangor/Klang Valley."],
  ["Boleh bayar secara BNPL?", "Pilihan BNPL mungkin tersedia melalui rakan pembayaran terpilih dan kelulusan adalah tertakluk kepada pihak rakan pembayaran tersebut."],
];

function CtaButton({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "dark" | "light" }) {
  const variants = {
    primary: "bg-orange-600 text-white shadow-xl shadow-orange-600/25 hover:bg-orange-700",
    dark: "bg-neutral-950 text-white shadow-xl shadow-neutral-950/20 hover:bg-neutral-800",
    light: "bg-white text-neutral-950 ring-1 ring-neutral-200 hover:bg-orange-50",
  };

  return (
    <a
      href={whatsappLink}
      aria-label={`${children} melalui WhatsApp`}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-center text-sm font-black transition ${variants[variant]}`}
    >
      {children}
    </a>
  );
}

function SectionHeader({ eyebrow, title, subtitle, tone = "light" }: { eyebrow?: string; title: string; subtitle?: string; tone?: "light" | "dark" }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-orange-600">{eyebrow}</p> : null}
      <h2 className={`text-3xl font-black tracking-[-0.035em] sm:text-5xl ${tone === "dark" ? "text-white" : "text-neutral-950"}`}>{title}</h2>
      {subtitle ? <p className={`mt-4 text-base leading-7 sm:text-lg ${tone === "dark" ? "text-white/70" : "text-neutral-600"}`}>{subtitle}</p> : null}
    </div>
  );
}

function ServiceVisual({ className, label }: { className: string; label: string }) {
  return (
    <div className={`service-photo ${className}`} role="img" aria-label={`Gambar servis ${label}`}>
      <span className="photo-shine" />
      <span className="photo-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main id="home" className="min-h-screen overflow-hidden bg-[#fffaf5]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/[0.92] backdrop-blur-xl">
        <div className="section-shell flex min-h-20 items-center justify-between gap-4 py-3">
          <a href="#home" className="flex items-center gap-3" aria-label="Abang Reno home">
            <Image src="/Logo_Abang_Reno_Header.png" width={58} height={58} alt="Logo rasmi Abang Reno" priority className="rounded-full bg-white object-contain" />
            <div className="leading-tight">
              <p className="text-lg font-black text-neutral-950">Abang Reno</p>
              <p className="text-xs font-bold text-neutral-500">Pakar Baik Pulih Rumah</p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-bold text-neutral-700 transition hover:text-orange-600">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <CtaButton>WhatsApp Untuk Quotation</CtaButton>
          </div>

          <details className="group lg:hidden">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950" aria-label="Buka menu mudah alih">
              <span className="relative h-4 w-5 before:absolute before:left-0 before:top-0 before:h-0.5 before:w-5 before:bg-current after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-5 after:bg-current">
                <span className="absolute left-0 top-[7px] h-0.5 w-5 bg-current" />
              </span>
            </summary>
            <div className="absolute left-4 right-4 top-[76px] rounded-[1.5rem] border border-neutral-100 bg-white p-4 shadow-2xl">
              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-orange-50">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <CtaButton>WhatsApp Untuk Quotation</CtaButton>
              </div>
            </div>
          </details>
        </div>
      </header>

      <section className="hero-grid-bg relative pb-12 pt-8 sm:pb-20 lg:pt-14">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 shadow-sm ring-1 ring-orange-100">
              Servis niche sekitar Klang Valley
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Rumah Ada Masalah Bocor, Dinding Retak atau Cat Mengelupas?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-650 sm:text-xl">
              Abang Reno menyediakan servis waterproofing, baiki dinding retak, painting, epoxy coating dan pemasangan cermin sekitar Klang Valley dengan quotation yang jelas sebelum kerja bermula.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton>WhatsApp Untuk Quotation</CtaButton>
              <CtaButton variant="light">Hantar Gambar Masalah Rumah</CtaButton>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <div key={badge} className="rounded-2xl bg-white p-4 text-sm font-extrabold text-neutral-800 shadow-sm ring-1 ring-black/5">
                  <span className="mb-2 block text-orange-600">✓</span>{badge}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[3rem] bg-orange-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] bg-neutral-950 p-2 card-shadow">
              <Image src="/team-van.svg" width={1200} height={820} alt="Team Abang Reno dengan uniform oren dan van oren" priority className="h-auto w-full rounded-[1.85rem] bg-white object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/[0.92] p-4 shadow-xl backdrop-blur">
                <p className="text-sm font-black text-neutral-950">Team tempatan untuk masalah rumah yang spesifik.</p>
                <p className="mt-1 text-xs font-bold text-neutral-600">Waterproofing • Retak • Cat • Epoxy • Cermin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell -mt-2 pb-12 sm:pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label, detail]) => (
            <article key={label} className="premium-stat rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
              <p className="text-4xl font-black tracking-[-0.05em] text-orange-600">{value}</p>
              <h3 className="mt-3 text-lg font-black text-neutral-950">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Servis Kami" title="Fokus Pada Masalah Rumah Yang Selalu Berlaku" subtitle="Kami bukan handyman umum. Abang Reno fokus pada servis khusus yang bantu selesaikan masalah bocor, retak, cat, lantai epoxy dan pemasangan cermin." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="overflow-hidden rounded-[2rem] bg-white card-shadow ring-1 ring-black/5 transition hover:-translate-y-1 hover:ring-orange-200">
              <ServiceVisual className={service.imageClass} label={service.title} />
              <div className="p-6">
                <h3 className="text-2xl font-black tracking-[-0.03em] text-neutral-950">{service.title}</h3>
                <p className="mt-3 min-h-20 leading-7 text-neutral-600">{service.description}</p>
                <div className="mt-6"><CtaButton>WhatsApp Servis Ini</CtaButton></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="before-after" className="bg-neutral-950 py-16 text-white sm:py-24">
        <div className="section-shell">
          <SectionHeader eyebrow="Bukti Visual" title="Sebelum & Selepas" subtitle="Lihat gambaran perbezaan kerja baik pulih. Hantar gambar masalah anda supaya team kami boleh cadangkan langkah seterusnya." tone="dark" />
          <div className="grid gap-6 lg:grid-cols-2">
            {beforeAfter.map(([title, before, after], index) => (
              <article key={title} className={`comparison-card comparison-${index} rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur`}>
                <div className="grid min-h-72 overflow-hidden rounded-[1.5rem] sm:grid-cols-2">
                  <div className="comparison-pane before flex flex-col justify-between p-5">
                    <span className="w-fit rounded-full bg-neutral-950/70 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">Sebelum</span>
                    <p className="text-xl font-black">{before}</p>
                  </div>
                  <div className="comparison-pane after flex flex-col justify-between p-5">
                    <span className="w-fit rounded-full bg-orange-600 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">Selepas</span>
                    <p className="text-xl font-black">{after}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 px-2">
                  <h3 className="text-2xl font-black">{title}</h3>
                  <CtaButton variant="light">Hantar Gambar</CtaButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Kenapa Pilih Kami" title="Servis Tempatan Yang Mudah Dipercayai" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(([title, detail]) => (
            <article key={title} className="premium-card rounded-[2rem] bg-white p-6 ring-1 ring-black/5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-orange-500">✓</div>
              <h3 className="text-xl font-black text-neutral-950">{title}</h3>
              <p className="mt-3 leading-7 text-neutral-600">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-16 sm:py-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-orange-50 p-6 ring-1 ring-orange-100 sm:p-10">
          <SectionHeader title="Pilihan Bayaran Fleksibel" subtitle="Projek baik pulih rumah kini lebih mudah dengan pilihan bayaran melalui rakan pembayaran terpilih." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {payments.map((payment) => (
              <div key={payment} className="payment-logo flex items-center justify-center rounded-2xl px-3 text-center text-sm font-black text-neutral-900">
                {payment}
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl bg-white p-4 text-center text-sm font-bold text-neutral-600 ring-1 ring-orange-100">
            Kelulusan BNPL adalah tertakluk kepada rakan pembayaran terpilih.
          </p>
        </div>
      </section>

      <section id="testimonials" className="bg-white py-16 sm:py-24">
        <div className="section-shell">
          <SectionHeader eyebrow="Testimoni" title="Apa Kata Pelanggan Kami" />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((quote) => (
              <article key={quote} className="rounded-[2rem] bg-[#fffaf5] p-7 card-shadow ring-1 ring-orange-100">
                <p className="text-lg tracking-[0.16em] text-orange-500">★★★★★</p>
                <p className="mt-5 text-lg font-bold leading-8 text-neutral-800">&quot;{quote}&quot;</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Hasil Kerja" title="Hasil Kerja Terkini" subtitle="Kategori kerja terbaru yang selalu diminta oleh pemilik rumah, kedai dan premis kecil sekitar Klang Valley." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {gallery.map((item, index) => (
            <article key={item} className={`gallery-card gallery-${index} min-h-72 overflow-hidden rounded-[2rem] p-5 text-white card-shadow`}>
              <div className="flex h-full flex-col justify-between">
                <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-black text-neutral-950">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-black">{item}</h3>
                  <p className="mt-2 text-sm font-bold text-white/80">Kerja kemas, jelas dan fokus pada masalah sebenar.</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="coverage" className="bg-white py-16 sm:py-24">
        <div className="section-shell">
          <SectionHeader eyebrow="Kawasan" title="Kawasan Servis Kami" subtitle="Hubungi kami jika lokasi anda berada sekitar Klang Valley dan kawasan berdekatan." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area) => (
              <div key={area} className="rounded-2xl border border-neutral-100 bg-[#fffaf5] p-5 text-center font-black text-neutral-900 shadow-sm">{area}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="FAQ" title="Soalan Lazim" />
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-3xl bg-white p-5 card-shadow ring-1 ring-black/5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-black text-neutral-950">
                {question}<span className="text-orange-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-neutral-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="section-shell py-16 sm:py-24">
        <div className="orange-gradient overflow-hidden rounded-[2.75rem] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-white/70">Hubungi Kami</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Perlu Quotation?</h2>
            <p className="mt-5 text-lg leading-8 text-white/80">Hantar gambar masalah rumah anda melalui WhatsApp dan kami akan bantu berikan cadangan serta anggaran harga.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton variant="light">WhatsApp Sekarang</CtaButton>
              <CtaButton variant="dark">Dapatkan Quotation</CtaButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-950 pb-28 pt-14 text-white sm:pb-16">
        <div className="section-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Image src="/Logo_Abang_Reno_Header.png" width={72} height={72} alt="Logo rasmi Abang Reno" className="rounded-full bg-white" />
            <h2 className="mt-4 text-2xl font-black">Abang Reno</h2>
            <p className="mt-2 max-w-sm text-white/70">Pakar Waterproofing, Dinding Retak, Painting, Epoxy & Pemasangan Cermin di Klang Valley.</p>
          </div>
          <div>
            <h3 className="text-lg font-black">Neugens Solution</h3>
            <div className="mt-4 space-y-2 text-white/70">
              <p>Reg. No. : 202503301282 (AS0504872-V)</p>
              <p>WhatsApp: +601151317030</p>
              <p>Website: abangreno.my</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black">Servis</h3>
            <div className="mt-4 grid gap-2 text-white/70">
              {services.map((service) => <a key={service.title} href="#services" className="hover:text-orange-400">{service.title}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <a
        href={whatsappLink}
        aria-label="WhatsApp Abang Reno untuk quotation"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-base font-black text-white shadow-2xl shadow-green-700/30 transition hover:scale-105"
      >
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor"><path d="M16.02 3.2C9.28 3.2 3.8 8.55 3.8 15.12c0 2.23.64 4.4 1.86 6.28L3.4 28.8l7.65-2.16a12.63 12.63 0 0 0 4.97.99c6.74 0 12.22-5.35 12.22-11.93S22.76 3.2 16.02 3.2Zm0 22.28c-1.58 0-3.12-.4-4.5-1.14l-.32-.17-4.53 1.28 1.33-4.33-.2-.34a10.15 10.15 0 0 1-1.58-5.37c0-5.38 4.4-9.76 9.8-9.76s9.8 4.38 9.8 9.76-4.4 10.07-9.8 10.07Zm5.39-7.32c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.91-2.18-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.36-.27.3-1.04 1-1.04 2.45s1.07 2.85 1.21 3.05c.15.2 2.1 3.15 5.1 4.41.71.31 1.27.5 1.7.64.71.22 1.36.19 1.88.12.57-.08 1.76-.7 2.01-1.38.25-.68.25-1.27.17-1.39-.07-.12-.27-.19-.56-.34Z" /></svg>
        <span className="hidden sm:inline">WhatsApp Abang Reno</span>
      </a>
    </main>
  );
}
